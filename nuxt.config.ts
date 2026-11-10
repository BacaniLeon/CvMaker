// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: ['@/assets/styles/style.scss'],

  // The editor reads the draft from localStorage, so it only renders in the browser.
  routeRules: {
    '/cvmaker': { ssr: false }
  },

  app: {
    head: {
      title: 'CV Maker — build, import and re-edit your CV',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        {
          name: 'description',
          content: 'Free CV maker with live preview. Upload the CV you already have and keep editing — no sign-up, everything stays in your browser.'
        },
        { name: 'theme-color', content: '#f5f4f0' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&family=Lora:wght@400;500;600;700&family=Manrope:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap'
        }
      ]
    }
  },

  vite: {
    optimizeDeps: {
      include: ['html2pdf.js', 'pdf-lib', 'pdfjs-dist']
    }
  }
})
