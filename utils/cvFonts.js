// Fonts the CV can be set in. All come from Google Fonts and include Latin Extended,
// so Croatian letters (č ć đ š ž) render in the font itself.
//
// Only the fonts linked in nuxt.config (`preloaded`) are on the page from the start;
// every other font is fetched the first time someone picks it.

export const cvFontCategories = [
  { id: 'all', name: 'All' },
  { id: 'sans', name: 'Sans' },
  { id: 'serif', name: 'Serif' },
  { id: 'slab', name: 'Slab' },
  { id: 'display', name: 'Display' },
  { id: 'mono', name: 'Mono' }
]

const fallback = {
  sans: "'Helvetica Neue', Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  slab: "Rockwell, Georgia, serif",
  display: "'Helvetica Neue', Arial, sans-serif",
  mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
}

// [key, family, category, weights]. `sans`, `serif` and `grotesk` keep their old keys so saved CVs still open in the same font.
const list = [
  // ---- sans
  ['sans', 'Inter', 'sans', '300;400;500;600;700', true],
  ['grotesk', 'Manrope', 'sans', '300;400;500;600;700', true],
  ['roboto', 'Roboto', 'sans', '300;400;500;700'],
  ['open-sans', 'Open Sans', 'sans', '300;400;500;600;700'],
  ['lato', 'Lato', 'sans', '300;400;700'],
  ['montserrat', 'Montserrat', 'sans', '300;400;500;600;700'],
  ['poppins', 'Poppins', 'sans', '300;400;500;600;700'],
  ['raleway', 'Raleway', 'sans', '300;400;500;600;700'],
  ['nunito', 'Nunito', 'sans', '300;400;500;600;700'],
  ['nunito-sans', 'Nunito Sans', 'sans', '300;400;500;600;700'],
  ['source-sans', 'Source Sans 3', 'sans', '300;400;500;600;700'],
  ['work-sans', 'Work Sans', 'sans', '300;400;500;600;700'],
  ['dm-sans', 'DM Sans', 'sans', '300;400;500;600;700'],
  ['ibm-plex-sans', 'IBM Plex Sans', 'sans', '300;400;500;600;700'],
  ['rubik', 'Rubik', 'sans', '300;400;500;600;700'],
  ['karla', 'Karla', 'sans', '300;400;500;600;700'],
  ['mulish', 'Mulish', 'sans', '300;400;500;600;700'],
  ['outfit', 'Outfit', 'sans', '300;400;500;600;700'],
  ['plus-jakarta', 'Plus Jakarta Sans', 'sans', '300;400;500;600;700'],
  ['space-grotesk', 'Space Grotesk', 'sans', '300;400;500;600;700'],
  ['fira-sans', 'Fira Sans', 'sans', '300;400;500;600;700'],
  ['pt-sans', 'PT Sans', 'sans', '400;700'],
  ['barlow', 'Barlow', 'sans', '300;400;500;600;700'],
  ['josefin-sans', 'Josefin Sans', 'sans', '300;400;500;600;700'],
  ['quicksand', 'Quicksand', 'sans', '300;400;500;600;700'],
  ['archivo', 'Archivo', 'sans', '300;400;500;600;700'],
  ['sora', 'Sora', 'sans', '300;400;500;600;700'],
  ['lexend', 'Lexend', 'sans', '300;400;500;600;700'],
  ['figtree', 'Figtree', 'sans', '300;400;500;600;700'],
  ['urbanist', 'Urbanist', 'sans', '300;400;500;600;700'],
  ['red-hat-display', 'Red Hat Display', 'sans', '300;400;500;600;700'],
  ['red-hat-text', 'Red Hat Text', 'sans', '300;400;500;600;700'],
  ['libre-franklin', 'Libre Franklin', 'sans', '300;400;500;600;700'],
  ['noto-sans', 'Noto Sans', 'sans', '300;400;500;600;700'],
  ['hanken-grotesk', 'Hanken Grotesk', 'sans', '300;400;500;600;700'],
  ['public-sans', 'Public Sans', 'sans', '300;400;500;600;700'],
  ['ubuntu', 'Ubuntu', 'sans', '300;400;500;700'],
  ['cabin', 'Cabin', 'sans', '400;500;600;700'],
  ['titillium', 'Titillium Web', 'sans', '300;400;600;700'],
  ['onest', 'Onest', 'sans', '300;400;500;600;700'],
  ['geologica', 'Geologica', 'sans', '300;400;500;600;700'],
  ['albert-sans', 'Albert Sans', 'sans', '300;400;500;600;700'],
  ['be-vietnam', 'Be Vietnam Pro', 'sans', '300;400;500;600;700'],
  ['schibsted', 'Schibsted Grotesk', 'sans', '400;500;600;700'],
  ['instrument-sans', 'Instrument Sans', 'sans', '400;500;600;700'],
  ['atkinson', 'Atkinson Hyperlegible', 'sans', '400;700'],
  ['exo', 'Exo 2', 'sans', '300;400;500;600;700'],
  ['maven-pro', 'Maven Pro', 'sans', '400;500;600;700'],
  ['asap', 'Asap', 'sans', '300;400;500;600;700'],
  ['heebo', 'Heebo', 'sans', '300;400;500;600;700'],

  // ---- serif
  ['serif', 'Lora', 'serif', '400;500;600;700', true],
  ['playfair', 'Playfair Display', 'serif', '400;500;600;700', true],
  ['merriweather', 'Merriweather', 'serif', '300;400;700'],
  ['libre-baskerville', 'Libre Baskerville', 'serif', '400;700'],
  ['eb-garamond', 'EB Garamond', 'serif', '400;500;600;700'],
  ['cormorant', 'Cormorant Garamond', 'serif', '300;400;500;600;700'],
  ['crimson-pro', 'Crimson Pro', 'serif', '300;400;500;600;700'],
  ['source-serif', 'Source Serif 4', 'serif', '300;400;500;600;700'],
  ['pt-serif', 'PT Serif', 'serif', '400;700'],
  ['noto-serif', 'Noto Serif', 'serif', '300;400;500;600;700'],
  ['spectral', 'Spectral', 'serif', '300;400;500;600;700'],
  ['fraunces', 'Fraunces', 'serif', '300;400;500;600;700'],
  ['libre-caslon', 'Libre Caslon Text', 'serif', '400;700'],
  ['alegreya', 'Alegreya', 'serif', '400;500;600;700'],
  ['domine', 'Domine', 'serif', '400;500;600;700'],
  ['gelasio', 'Gelasio', 'serif', '400;500;600;700'],
  ['newsreader', 'Newsreader', 'serif', '300;400;500;600;700'],
  ['literata', 'Literata', 'serif', '300;400;500;600;700'],
  ['ibm-plex-serif', 'IBM Plex Serif', 'serif', '300;400;500;600;700'],
  ['cardo', 'Cardo', 'serif', '400;700'],
  ['vollkorn', 'Vollkorn', 'serif', '400;500;600;700'],
  ['cormorant-plain', 'Cormorant', 'serif', '300;400;500;600;700'],
  ['old-standard', 'Old Standard TT', 'serif', '400;700'],
  ['crimson-text', 'Crimson Text', 'serif', '400;600;700'],
  ['brygada', 'Brygada 1918', 'serif', '400;500;600;700'],
  ['young-serif', 'Young Serif', 'serif', '400'],
  ['instrument-serif', 'Instrument Serif', 'serif', '400', true],

  // ---- slab
  ['roboto-slab', 'Roboto Slab', 'slab', '300;400;500;600;700'],
  ['bitter', 'Bitter', 'slab', '300;400;500;600;700'],
  ['zilla-slab', 'Zilla Slab', 'slab', '300;400;500;600;700'],
  ['aleo', 'Aleo', 'slab', '300;400;500;600;700'],
  ['crete-round', 'Crete Round', 'slab', '400'],

  // ---- display (headline-style faces that still read fine at body size)
  ['oswald', 'Oswald', 'display', '300;400;500;600;700'],
  ['dm-serif', 'DM Serif Display', 'display', '400'],
  ['abril', 'Abril Fatface', 'display', '400'],
  ['bricolage', 'Bricolage Grotesque', 'display', '300;400;500;600;700'],
  ['syne', 'Syne', 'display', '400;500;600;700'],
  ['unbounded', 'Unbounded', 'display', '300;400;500;600;700'],
  ['comfortaa', 'Comfortaa', 'display', '300;400;500;600;700'],
  ['righteous', 'Righteous', 'display', '400'],
  ['cinzel', 'Cinzel', 'display', '400;500;600;700'],
  ['barlow-condensed', 'Barlow Condensed', 'display', '300;400;500;600;700'],
  ['big-shoulders', 'Big Shoulders Display', 'display', '300;400;500;600;700'],

  // ---- mono
  ['jetbrains-mono', 'JetBrains Mono', 'mono', '400;600;700', true],
  ['ibm-plex-mono', 'IBM Plex Mono', 'mono', '300;400;500;600;700'],
  ['fira-code', 'Fira Code', 'mono', '300;400;500;600;700'],
  ['space-mono', 'Space Mono', 'mono', '400;700'],
  ['source-code', 'Source Code Pro', 'mono', '300;400;500;600;700'],
  ['roboto-mono', 'Roboto Mono', 'mono', '300;400;500;600;700'],
  ['dm-mono', 'DM Mono', 'mono', '300;400;500'],
  ['red-hat-mono', 'Red Hat Mono', 'mono', '300;400;500;600;700'],
  ['ubuntu-mono', 'Ubuntu Mono', 'mono', '400;700']
]

export const cvFonts = Object.fromEntries(
  list.map(([key, family, category, weights, preloaded = false]) => [
    key,
    { key, name: family, family, category, weights, preloaded, stack: `'${family}', ${fallback[category]}` }
  ])
)

export const cvFontList = Object.values(cvFonts)

export const DEFAULT_CV_FONT = 'sans'

export const cvFontCssUrl = (font) =>
  `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.family).replace(/%20/g, '+')}:wght@${font.weights}&display=swap`

// ---------- loading

const loading = new Map()

function addStylesheet(href, id) {
  return new Promise((resolve) => {
    if (document.getElementById(id)) return resolve()
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = href
    link.onload = () => resolve()
    link.onerror = () => resolve() // offline: the fallback stack takes over
    document.head.appendChild(link)
  })
}

// Resolves once the font's regular and bold faces (with Croatian letters) are ready to draw.
// The PDF export waits on this, so the PDF never comes out in a fallback font.
export function loadCvFont(key) {
  if (typeof document === 'undefined') return Promise.resolve()
  const font = cvFonts[key] || cvFonts[DEFAULT_CV_FONT]
  if (!loading.has(font.key)) {
    const job = (font.preloaded ? Promise.resolve() : addStylesheet(cvFontCssUrl(font), `cvfont-${font.key}`))
      .then(() => {
        if (!document.fonts?.load) return
        const sample = 'AaBbČčĆćĐđŠšŽž0123'
        const weights = font.weights.split(';')
        const bold = weights.includes('700') ? '700' : weights[weights.length - 1]
        return Promise.all([
          document.fonts.load(`400 16px '${font.family}'`, sample),
          document.fonts.load(`${bold} 16px '${font.family}'`, sample)
        ])
      })
      .catch(() => {})
    // Give up waiting after a while so a slow network never blocks the export.
    loading.set(font.key, Promise.race([job, new Promise((r) => setTimeout(r, 6000))]))
  }
  return loading.get(font.key)
}

// The picker shows every name in its own font. Instead of downloading ~100 full fonts it asks
// Google for just the letters of the names, and renames those faces so they never get mixed
// up with the real fonts used on the CV.
let previewJob = null
export const previewFamily = (font) => (font.preloaded ? font.family : `cvp ${font.family}`)

export function loadFontPreviews() {
  if (typeof document === 'undefined' || previewJob) return previewJob || Promise.resolve()
  const lazy = cvFontList.filter((f) => !f.preloaded)
  const letters = [...new Set(lazy.map((f) => f.name).join('') + 'Aa')].join('')
  const families = lazy.map((f) => `family=${encodeURIComponent(f.family).replace(/%20/g, '+')}`).join('&')
  const url = `https://fonts.googleapis.com/css2?${families}&text=${encodeURIComponent(letters)}&display=swap`
  previewJob = fetch(url)
    .then((r) => (r.ok ? r.text() : ''))
    .then((css) => {
      if (!css) return
      const style = document.createElement('style')
      style.id = 'cvfont-previews'
      style.textContent = css.replace(/font-family:\s*'([^']+)'/g, (_, name) => `font-family: 'cvp ${name}'`)
      document.head.appendChild(style)
    })
    .catch(() => {
      previewJob = null
    })
  return previewJob
}
