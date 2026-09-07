import { useEffect, useRef, useState } from 'react'

import { AnswerTile, type AnswerSlot, Button, Card, Dialog, EmptyState, FailureState, Field, LoadingState, SuccessState } from '../index.ts'
import styles from './Gallery.module.css'
import { contrast, tokenColour, verdict } from './contrast.ts'

/**
 * W02's acceptance gate — §16 p25:
 * «صفحة عرض تُظهر كل مكوّن في كل حالاته، في الوضعين الفاتح والداكن،
 *  وباتجاهين، بتباين مطابق للمعيار.»
 *
 * A page showing every component in every state, in light and dark, in both
 * directions, with contrast meeting the standard.
 *
 * The contrast column is COMPUTED IN THE BROWSER from the resolved tokens, so
 * it re-measures when the theme flips. A hardcoded table would keep saying
 * "AA" after somebody changed a token, which is worse than no table.
 *
 * Development only. Not registered in the production bundle — see the route.
 */

const SLOTS: AnswerSlot[] = [1, 2, 3, 4]
const SAMPLE = ['باريس', 'لندن', 'برلين', 'مدريد']

function useThemeAndDir() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [rtl, setRtl] = useState(() => document.documentElement.dir !== 'ltr')

  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])
  useEffect(() => { document.documentElement.dir = rtl ? 'rtl' : 'ltr' }, [rtl])

  return { dark, setDark, rtl, setRtl }
}

/**
 * Live contrast for one foreground/background token pair.
 *
 * Re-measures whenever the THEME actually changes, watched with a
 * MutationObserver on <html> rather than on a React prop. The first version
 * recomputed only on re-render, so flipping the theme from outside React —
 * the system preference changing, ThemeProvider resolving, devtools — left
 * every number on screen reading the old theme's values while the swatches
 * beside them had already changed colour. A contrast readout that can go
 * stale is exactly as untrustworthy as the hardcoded table it replaced.
 */
function Ratio({ fg, bg, large = false }: { fg: string; bg: string; large?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [text, setText] = useState('…')

  useEffect(() => {
    const measure = () => {
      const host = ref.current?.closest('.asas') ?? ref.current
      if (!host) return
      const r = contrast(tokenColour(host, fg), tokenColour(host, bg))
      setText(r == null ? '—' : `${r.toFixed(2)} ${verdict(r, large)}`)
    }
    measure()

    const observer = new MutationObserver(measure)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'dir', 'style'] })
    /* The OS-level preference too, for the case where nothing on <html>
       changes because the app is following `prefers-color-scheme` directly. */
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', measure)
    return () => { observer.disconnect(); media.removeEventListener('change', measure) }
  }, [fg, bg, large])

  const failing = text.includes('FAILS')
  return <span ref={ref} className={failing ? styles.fail : styles.pass}>{text}</span>
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.h}>{title}</h2>
      {note && <p className={styles.note}>{note}</p>}
      {children}
    </section>
  )
}

export default function Gallery() {
  const { dark, setDark, rtl, setRtl } = useThemeAndDir()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewport, setViewport] = useState({ w: 0, h: 0 })
  const [selected, setSelected] = useState<AnswerSlot | null>(null)

  /*
   * The measured viewport, printed. §17 requires real innerWidth/innerHeight
   * before a screenshot is trusted — a resize tool that silently did nothing
   * would otherwise produce a desktop screenshot labelled "phone".
   */
  useEffect(() => {
    const read = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    read()
    window.addEventListener('resize', read)
    return () => window.removeEventListener('resize', read)
  }, [])

  return (
    <div className={`asas ${styles.page}`} data-gallery="v4">
      <div className={styles.bar}>
        <h1 className={styles.barTitle}>نظام الرموز — v4 §5</h1>
        <Button variant="secondary" onClick={() => setDark((d) => !d)}>
          {dark ? 'الوضع الفاتح' : 'الوضع الداكن'}
        </Button>
        <Button variant="secondary" onClick={() => setRtl((r) => !r)}>
          {rtl ? 'LTR' : 'RTL'}
        </Button>
        <span className={styles.spacer} />
        {/*
          * `dir="ltr"` on the readout, and it is not cosmetic.
          *
          * In an RTL document «1728×846» renders as «846×1728»: the bidi
          * algorithm reorders the two number runs around the × separator. A
          * diagnostic that reports the viewport backwards is worse than none —
          * it is precisely how a desktop capture gets labelled as a phone.
          */}
        <span className={styles.readout} data-testid="viewport" dir="ltr">
          {viewport.w}×{viewport.h} · {dark ? 'dark' : 'light'} · {rtl ? 'rtl' : 'ltr'}
        </span>
      </div>

      <Section
        title="الألوان والتباين"
        note="كل نسبة تُحسب في المتصفح من قيمة الرمز بعد حلّها، لا من جدول مكتوب. تتغيّر مع تبديل الوضع."
      >
        <div className={styles.swatches}>
          {[
            ['--act', '--on-act', 'إجراء'],
            ['--act-press', '--on-act', 'إجراء مضغوط'],
            ['--evidence', '--on-evidence', 'دليل'],
            ['--a1', '--on-a1', 'مثلث'],
            ['--a2', '--on-a2', 'معيّن'],
            ['--a3', '--on-a3', 'دائرة'],
            ['--a4', '--on-a4', 'مربع'],
          ].map(([bg, fg, label]) => (
            <div key={bg} className={styles.swatch}>
              <div className={styles.chip} style={{ background: `var(${bg})`, color: `var(${fg})` }}>
                {label}
              </div>
              <div className={styles.meta}>
                {bg} · <Ratio fg={fg!} bg={bg!} large={bg === '--a4'} />
                {bg === '--a4' && <> · نص كبير فقط</>}
              </div>
            </div>
          ))}
          {[['--ink', 'حبر'], ['--muted', 'خافت']].map(([fg, label]) => (
            <div key={fg} className={styles.swatch}>
              <div className={styles.chip} style={{ background: 'var(--surface)', color: `var(${fg})` }}>{label}</div>
              <div className={styles.meta}>{fg} على السطح · <Ratio fg={fg!} bg="--surface" /></div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="الهندسة — 4 للأدوات و8 للبطاقات"
        note="§5: «نصف قطر واحد لكل شيء» ممنوع صراحة. نصف القطر يشفّر التسلسل."
      >
        <div className={styles.geo}>
          <div className={styles.geoBox} style={{ width: 96, height: 48, borderRadius: 'var(--r-control)' }}>4px · أداة</div>
          <div className={styles.geoBox} style={{ width: 140, height: 96, borderRadius: 'var(--r-card)' }}>8px · بطاقة</div>
          <div className={styles.geoBox} style={{ width: 96, height: 48, borderRadius: 'var(--r-control)', boxShadow: 'var(--press)' }}>--press</div>
        </div>
      </Section>

      <Section title="الأزرار — كل الحالات" note="لا سهم ملحق بأي نص زر (§5).">
        {(['primary', 'secondary', 'quiet', 'danger'] as const).map((variant) => (
          <div key={variant} className={styles.row}>
            <span className={styles.caption} style={{ minWidth: 90 }}>{variant}</span>
            <Button variant={variant}>عادي</Button>
            <Button variant={variant} disabled>معطّل</Button>
            <Button variant={variant} loading>جارٍ</Button>
          </div>
        ))}
        <p className={styles.note}>التركيز: استخدم Tab. الحلقة صلبة بإزاحة، لا لون فقط.</p>
      </Section>

      <Section
        title="بطاقات الإجابة — اللون مربوط بالشكل"
        note="نفس الفتحة تعطي نفس اللون ونفس الشكل في المحرّر والبروجكتر وشاشة الطالب. لا خاصية لون منفصلة."
      >
        <div className={styles.col}>
          {SLOTS.map((slot) => (
            <AnswerTile key={slot} slot={slot} label={SAMPLE[slot - 1]!}
              state={selected === slot ? 'selected' : 'idle'}
              onClick={() => setSelected(selected === slot ? null : slot)} />
          ))}
        </div>
        <p className={styles.caption}>الكشف — صحيح وخاطئ، بعلامة ونص لا بلون وحده</p>
        <div className={styles.col}>
          <AnswerTile slot={1} label="باريس" state="correct" trailing="12" />
          <AnswerTile slot={2} label="لندن" state="incorrect" trailing="7" />
          <AnswerTile slot={3} label="برلين" state="incorrect" trailing="3" />
          <AnswerTile slot={4} label="مدريد" state="pending" />
        </div>
        <p className={styles.caption}>شاشة الطالب — أشكال وألوان بلا نص (§8). النص يبقى في الاسم المتاح.</p>
        <div className={styles.row}>
          {SLOTS.map((slot) => (
            <AnswerTile key={slot} slot={slot} label={SAMPLE[slot - 1]!} shapeOnly
              style={{ width: 120 }} />
          ))}
        </div>
      </Section>

      <Section title="مقياس البروجكتر — 40 إلى 72 بكسل" note="§4 #4: clamp() على عرض المنفذ.">
        <div className={styles.stageDemo}>
          <p className={styles.stageText}>ما عاصمة فرنسا؟</p>
        </div>
      </Section>

      <Section title="الحقول">
        <div className={styles.row}>
          <div className={styles.col}><Field label="عنوان النشاط" placeholder="اكتب عنوانًا" /></div>
          <div className={styles.col}><Field label="مع تلميح" hint="يظهر للمعلّمين فقط" defaultValue="كسور" /></div>
          <div className={styles.col}><Field label="خطأ" error="هذا الحقل مطلوب قبل النشر" defaultValue="" /></div>
          <div className={styles.col}><Field label="معطّل" disabled defaultValue="غير قابل للتعديل" /></div>
        </div>
      </Section>

      <Section title="البطاقات والنوافذ">
        <div className={styles.row}>
          <Card style={{ flex: '1 1 260px' }}>
            <strong>بطاقة عادية</strong>
            <p className={styles.note} style={{ marginBottom: 0 }}>حدّ شعري، لا ظل رمادي ناعم.</p>
          </Card>
          <Card strip="var(--a3)" style={{ flex: '1 1 260px' }}>
            <strong>شريط وحدة</strong>
            <p className={styles.note} style={{ marginBottom: 0 }}>اللون هنا يعني الوحدة، لا زينة.</p>
          </Card>
          <Button variant="primary" onClick={() => setDialogOpen(true)}>افتح نافذة</Button>
        </div>
        <Dialog open={dialogOpen} title="حذف السؤال؟" onClose={() => setDialogOpen(false)}
          actions={<>
            <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button variant="danger" onClick={() => setDialogOpen(false)}>حذف</Button>
          </>}>
          <p className={styles.note}>سيُحذف السؤال وأزواج الخطأ المرتبطة به. لا يمكن التراجع.</p>
        </Dialog>
      </Section>

      <Section title="الحالات المشتركة" note="كل حالة تقول ما حدث وما التالي. الحالة بلا مخرج ليست حالة.">
        <div className={styles.row}>
          <div className={styles.col}>
            <EmptyState title="لا أنشطة في هذا الرفّ بعد"
              body="لم يؤلّف أحد هنا حتى الآن."
              actions={<Button variant="primary">كن أول من يؤلّف هنا</Button>} />
          </div>
          <div className={styles.col}>
            <FailureState title="تعذّر الحفظ"
              body="آخر تعديل محفوظ محليًا ولم يُفقد."
              actions={<Button variant="primary">أعد المحاولة</Button>} />
          </div>
          <div className={styles.col}>
            <SuccessState title="نُشر النشاط" body="أصبح ظاهرًا في رفّ الرياضيات — الثاني المتوسط." />
          </div>
          <div className={styles.col}>
            <Card><LoadingState rows={4} /></Card>
          </div>
        </div>
      </Section>

      <Section title="السلّم الطباعي — عربي أولًا">
        {([['--f-stage', 'مسرح'], ['--f-hero', 'رئيس'], ['--f-title', 'عنوان'], ['--f-heading', 'ترويسة'],
           ['--f-body', 'نص'], ['--f-small', 'صغير'], ['--f-micro', 'دقيق']] as const).map(([token, label]) => (
          <div key={token} style={{ fontSize: `var(${token})`, lineHeight: 'var(--lh-body)', marginBottom: 'var(--s-2)' }}>
            {label} — الثاني المتوسط · Grade 8 · 1234
            <span className={styles.caption} style={{ fontSize: 'var(--f-micro)' }}> {token}</span>
          </div>
        ))}
      </Section>
    </div>
  )
}
