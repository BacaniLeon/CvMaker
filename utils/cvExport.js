// PDF / JSON export. Every exported PDF carries the editable CV data as an embedded
// file attachment, so uploading that PDF later restores the CV exactly.

export const EMBEDDED_FILENAME = 'cvmaker-data.json'

const slug = (s) =>
  (s || 'cv').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'cv'

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportJson(cv) {
  const data = JSON.stringify({ ...cv, exportedAt: new Date().toISOString() }, null, 2)
  downloadBlob(new Blob([data], { type: 'application/json' }), `${slug(cv.personal.fullName)}-cv.json`)
}

export async function exportPdf(element, liveCv) {
  // Snapshot now: rendering takes a few seconds and the user may keep typing meanwhile.
  const cv = JSON.parse(JSON.stringify(liveCv))
  if (document.fonts?.ready) await document.fonts.ready

  const html2pdf = (await import('html2pdf.js')).default
  const rendered = await html2pdf()
    .set({
      margin: 0,
      image: { type: 'jpeg', quality: 0.97 },
      html2canvas: { scale: 2.5, useCORS: true, backgroundColor: '#ffffff', logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
      pagebreak: { mode: ['css'], avoid: ['.cv-keep'] }
    })
    .from(element)
    .outputPdf('arraybuffer')

  const { PDFDocument } = await import('pdf-lib')
  const doc = await PDFDocument.load(rendered)
  const name = cv.personal.fullName.trim()
  const now = new Date()
  doc.setTitle(name ? `${name} – CV` : 'CV')
  if (name) doc.setAuthor(name)
  doc.setSubject(cv.personal.title || 'Curriculum vitae')
  doc.setCreator('CV Maker')
  doc.setProducer('CV Maker')
  doc.setKeywords(['cvmaker', 'editable'])
  await doc.attach(new TextEncoder().encode(JSON.stringify(cv)), EMBEDDED_FILENAME, {
    mimeType: 'application/json',
    description: 'Editable CV Maker data. Upload this PDF to CV Maker to continue editing.',
    creationDate: now,
    modificationDate: now
  })
  const bytes = await doc.save()
  downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `${slug(name)}-cv.pdf`)
}

// Downscales an uploaded photo so drafts stay small enough for localStorage.
export function readPhoto(file, max = 480) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Please choose an image file.'))
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read that image.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not read that image.'))
      img.onload = () => {
        const ratio = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.88))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
