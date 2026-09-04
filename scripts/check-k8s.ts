import fs from 'node:fs'
import path from 'node:path'
import { parseAllDocuments } from 'yaml'

/**
 * Guards the agreement between `kubernetes/`, `nginx.conf` and the deploy
 * workflow. Each of the three is edited on its own and `kubectl apply` accepts
 * whatever it is given, so a mismatch between them surfaces as a stalled
 * rollout or a silently wrong page rather than as an error.
 *
 * Coverage is the point: every manifest must be either contract-checked below
 * or listed as a reviewed exclusion, so adding a file to the directory cannot
 * quietly opt it out of checking.
 */

/* Manifests are untyped by nature and the checks below *are* the validation,
   so the parsed tree is walked loosely rather than modelled up front. */
type Manifest = any

type Loaded = {
  /** Path relative to `kubernetes/`, which is how files are named below. */
  name: string
  docs: Manifest[]
}

const root = path.resolve(import.meta.dirname, '..')
const manifestDir = path.join(root, 'kubernetes')
const nginxConfPath = path.join(root, 'nginx.conf')
const workflowPath = path.join(root, '.github/workflows/main.yml')

/** Names the workflow uses literally, in `set image`, `rollout status` and its jsonpath. */
const DEPLOYMENT_NAME = 'asasera-new-frontend-deployment'
const CONTAINER_NAME = 'asasera-new-frontend-container'

const failures: string[] = []

function fail(file: string, message: string): void {
  failures.push(`${file}: ${message}`)
}

function docOfKind(loaded: Loaded, kind: string): Manifest | undefined {
  return loaded.docs.find((doc) => doc?.kind === kind)
}

function sameLabels(a: Manifest, b: Manifest): boolean {
  const normalise = (labels: Manifest) =>
    JSON.stringify(
      Object.entries(labels ?? {})
        .map(([key, value]) => [key, String(value)])
        .sort(),
    )
  return normalise(a) === normalise(b)
}

/**
 * What the container will actually do with a request, read out of the config
 * that ships in the image. Regexes rather than a real parser, because this is
 * a file we write and keep small — see nginx.conf.
 */
function readNginx(): { listenPorts: string[]; exactLocations: string[]; hasSpaFallback: boolean } {
  const conf = fs.readFileSync(nginxConfPath, 'utf8')
  return {
    listenPorts: [...conf.matchAll(/^\s*listen\s+(?:\[::\]:)?(\d+)\s*;/gm)].map((m) => m[1]!),
    exactLocations: [...conf.matchAll(/^\s*location\s*=\s*(\S+)\s*\{/gm)].map((m) => m[1]!),
    hasSpaFallback: /try_files\s+[^;]*\/index\.html\s*;/.test(conf),
  }
}

/** The repository the workflow pushes to, which is the one the pod must pull. */
function readWorkflowRepository(): string | undefined {
  const workflow = parseAllDocuments(fs.readFileSync(workflowPath, 'utf8'))[0]?.toJS()
  const job = workflow?.jobs?.build
  const repositories = new Set<string>()

  if (job?.env?.ECR_REPOSITORY) repositories.add(String(job.env.ECR_REPOSITORY))
  for (const step of job?.steps ?? []) {
    if (step?.env?.ECR_REPOSITORY) repositories.add(String(step.env.ECR_REPOSITORY))
  }

  if (repositories.size > 1) {
    fail(
      '.github/workflows/main.yml',
      `steps disagree on ECR_REPOSITORY (${[...repositories].join(', ')}); the image that gets ` +
        'pushed and the image that gets deployed would be different repositories.',
    )
    return undefined
  }
  return [...repositories][0]
}

/** Names the workflow hard-codes in shell, which the manifest has to match. */
function checkWorkflowReferences(deploymentName: string, containerName: string): void {
  const workflow = fs.readFileSync(workflowPath, 'utf8')
  const file = '.github/workflows/main.yml'

  if (!workflow.includes(`deployment/${deploymentName}`)) {
    fail(
      file,
      `does not reference deployment/${deploymentName}, which is the Deployment the manifest ` +
        'defines. `kubectl set image` and `rollout status` would target something else.',
    )
  }
  if (!workflow.includes(`@.name=="${containerName}"`)) {
    fail(
      file,
      `its jsonpath does not filter on the container name "${containerName}", so the image ` +
        'assertion would read an empty string and fail after the rollout has gone live.',
    )
  }
}

function checkFrontendDeployment(loaded: Loaded): void {
  const { name } = loaded
  const deployment = docOfKind(loaded, 'Deployment')
  const service = docOfKind(loaded, 'Service')

  if (!deployment) return fail(name, 'no Deployment document found')
  if (!service) return fail(name, 'no Service document found')

  const containers = deployment.spec?.template?.spec?.containers ?? []
  if (containers.length !== 1) {
    return fail(name, `expected exactly one container, found ${containers.length}.`)
  }
  const container = containers[0]

  const deploymentName = String(deployment.metadata?.name ?? '')
  const containerName = String(container.name ?? '')
  if (deploymentName !== DEPLOYMENT_NAME) {
    fail(name, `Deployment is named "${deploymentName}", expected "${DEPLOYMENT_NAME}".`)
  }
  if (containerName !== CONTAINER_NAME) {
    fail(name, `container is named "${containerName}", expected "${CONTAINER_NAME}".`)
  }
  checkWorkflowReferences(deploymentName, containerName)

  // The workflow pushes to one repository and the pod pulls from whatever is
  // written here. Nothing reconciles the two, and the symptom of a mismatch is
  // ImagePullBackOff several minutes into a deploy that looked fine.
  const image = String(container.image ?? '')
  const repository = readWorkflowRepository()
  if (!repository) {
    fail(name, 'could not read ECR_REPOSITORY from the workflow to compare against the image.')
  } else if (image.split(':')[0]?.split('/').pop() !== repository) {
    fail(
      name,
      `image is "${image}", but the workflow builds and pushes to the "${repository}" ` +
        'repository. The deployed pod would pull an image this pipeline never wrote.',
    )
  }

  const podLabels = deployment.spec?.template?.metadata?.labels
  if (!sameLabels(deployment.spec?.selector?.matchLabels, podLabels)) {
    fail(name, 'Deployment selector.matchLabels does not match the pod template labels.')
  }
  if (!sameLabels(service.spec?.selector, podLabels)) {
    fail(
      name,
      'Service selector does not match the pod template labels, so the Service would have no ' +
        'endpoints and the target group would stay empty.',
    )
  }

  const nginx = readNginx()

  // The Service forwards to `targetPort`, the container advertises
  // `containerPort`, and nginx binds whatever `listen` says. Only the last one
  // opens a socket.
  const containerPort = String(container.ports?.[0]?.containerPort ?? '')
  const targetPort = String(service.spec?.ports?.[0]?.targetPort ?? '')
  // Every `listen`, not just one of them: a config that serves the right port
  // over IPv4 and a different one over IPv6 is a half-broken pod, not a pass.
  const strayPorts = [...new Set(nginx.listenPorts.filter((port) => port !== containerPort))]
  if (nginx.listenPorts.length === 0) {
    fail(name, `containerPort is ${containerPort}, but nginx.conf has no listen directive.`)
  } else if (strayPorts.length > 0) {
    fail(
      name,
      `containerPort is ${containerPort}, but nginx.conf also listens on ${strayPorts.join(', ')}.`,
    )
  }
  if (targetPort !== containerPort) {
    fail(name, `Service targetPort is ${targetPort} but containerPort is ${containerPort}.`)
  }

  if (!nginx.hasSpaFallback) {
    fail(
      'nginx.conf',
      'no `try_files ... /index.html` fallback. The app uses BrowserRouter, so following a ' +
        'link to /about would work but reloading on it would return nginx\'s own 404.',
    )
  }

  // Every probe path needs its own `location =` block. The SPA fallback means
  // *any* path returns 200 with index.html, so a probe pointed at a path nginx
  // does not explicitly handle passes forever — including while the site is
  // serving nothing but a stale shell.
  for (const probe of ['startupProbe', 'readinessProbe', 'livenessProbe']) {
    const httpGet = container[probe]?.httpGet
    if (!httpGet) {
      fail(name, `${probe} is not configured.`)
      continue
    }
    if (!nginx.exactLocations.includes(String(httpGet.path))) {
      fail(
        name,
        `${probe} calls "${httpGet.path}", which nginx.conf has no "location = ${httpGet.path}" ` +
          'block for. The SPA fallback would answer it with index.html and a 200, so the probe ' +
          'would pass whether or not the container is healthy.',
      )
    }
    if (String(httpGet.port) !== containerPort) {
      fail(name, `${probe} targets port ${httpGet.port}, but the container listens on ${containerPort}.`)
    }
  }

  // Without a request the scheduler cannot place the pod deliberately; without
  // a limit one pod can take a node down with it.
  for (const field of ['requests', 'limits']) {
    if (!container.resources?.[field]) fail(name, `resources.${field} is not set.`)
  }
}

/** One entry per manifest. A file with no entry here fails the coverage check. */
const CONTRACTS: Record<string, (loaded: Loaded) => void> = {
  'frontend-deployment.yaml': checkFrontendDeployment,
}

/**
 * Manifests deliberately left unchecked, each with the reason. Empty on
 * purpose — an entry here is a decision someone has to write down.
 */
const EXCLUSIONS: Record<string, string> = {}

function main(): void {
  for (const required of [manifestDir, nginxConfPath, workflowPath]) {
    if (!fs.existsSync(required)) {
      console.error(`Missing ${path.relative(root, required)}.`)
      process.exit(1)
    }
  }

  const found = fs
    .readdirSync(manifestDir, { recursive: true })
    .map((entry) => String(entry))
    .filter((entry) => /\.ya?ml$/.test(entry))
    .sort()

  // A contract naming a file that no longer exists is worse than no contract:
  // it reads as coverage while checking nothing.
  for (const name of [...Object.keys(CONTRACTS), ...Object.keys(EXCLUSIONS)]) {
    if (!found.includes(name)) {
      failures.push(`${name}: listed in check-k8s.ts but not present in kubernetes/.`)
    }
  }

  for (const name of found) {
    if (name in EXCLUSIONS) {
      console.log(`- ${name}: excluded (${EXCLUSIONS[name]})`)
      continue
    }

    const contract = CONTRACTS[name]
    if (!contract) {
      failures.push(
        `${name}: no contract and no reviewed exclusion. Add a check to scripts/check-k8s.ts, ` +
          'or an EXCLUSIONS entry saying why it does not need one.',
      )
      continue
    }

    const parsed = parseAllDocuments(fs.readFileSync(path.join(manifestDir, name), 'utf8'))
    const syntaxErrors = parsed.flatMap((doc) => doc.errors)
    if (syntaxErrors.length > 0) {
      for (const error of syntaxErrors) failures.push(`${name}: ${error.message}`)
      continue
    }

    contract({ name, docs: parsed.map((doc) => doc.toJS()) })
    console.log(`- ${name}: checked`)
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} problem(s) found:\n`)
    for (const failure of failures) console.error(`  ✗ ${failure}`)
    console.error('')
    process.exit(1)
  }

  console.log(`\n${found.length} manifest(s) OK.`)
}

main()
