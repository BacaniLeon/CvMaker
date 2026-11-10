// Applies an import result to the shared CV state and tells the user what happened.

export function useCvImport() {
  const { replace } = useCv()
  const { toast } = useToast()

  function applyImport(result) {
    replace(result.cv)
    const messages = {
      embedded: { title: 'CV restored', text: 'Everything is exactly as you left it — keep editing.' },
      json: { title: 'Backup restored', text: 'Your CV is ready to edit.' },
      jsonresume: { title: 'Imported from JSON Resume', text: 'Have a quick look over each section.' },
      'linkedin-zip': {
        title: 'Built from your LinkedIn data',
        text: ['Add a photo and pick a template.', ...(result.notes || [])].join(' ')
      },
      'linkedin-pdf': {
        title: 'Built from your LinkedIn profile',
        text: 'Check each section, add your phone number and a photo, then pick a template.'
      }
    }
    const msg = messages[result.source] || {
      title: `Imported ${result.fileName || 'your CV'}`,
      text: ['We filled in what we could find — please check each section.', ...(result.notes || [])].join(' '),
      type: 'warning'
    }
    toast({ type: msg.type || 'success', timeout: msg.type ? 9000 : 5000, ...msg })
  }

  return { applyImport }
}
