import { CallToAction } from '@/components/sections/CallToAction'
import { Features } from '@/components/sections/Features'
import { Hero } from '@/components/sections/Hero'
import { Platform } from '@/components/sections/Platform'
import { Stats } from '@/components/sections/Stats'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function Home() {
  useDocumentTitle()

  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <Platform />
      <CallToAction />
    </>
  )
}
