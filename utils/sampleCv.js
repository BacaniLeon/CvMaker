// Demo content for the landing page previews.
export const sampleCvData = {
  meta: { template: 'modern', accent: '#3943B7', font: 'sans', language: 'en' },
  personal: {
    fullName: 'Ana Horvat',
    title: 'Senior Frontend Developer',
    email: 'ana.horvat@mail.com',
    phone: '+385 91 234 5678',
    location: 'Zagreb, Croatia',
    website: 'anahorvat.dev',
    linkedin: 'linkedin.com/in/anahorvat'
  },
  summary:
    'Frontend developer with 6 years of experience building fast, accessible products with Vue and Nuxt. I care about clean interfaces, performance budgets and helping teams ship with confidence.',
  experience: [
    {
      role: 'Senior Frontend Developer',
      company: 'Northwind Labs',
      location: 'Zagreb',
      start: '03/2022',
      current: true,
      description:
        '- Led the rebuild of the customer dashboard in Nuxt, cutting load time by 42%\n- Set up the component library used by 4 product teams\n- Mentored three junior developers'
    },
    {
      role: 'Frontend Developer',
      company: 'Blue Harbor Studio',
      location: 'Split',
      start: '06/2019',
      end: '02/2022',
      description: '- Built marketing sites and web apps for 20+ clients\n- Introduced automated visual testing'
    }
  ],
  education: [
    {
      degree: 'BSc Computer Science',
      school: 'Zagreb University of Applied Sciences',
      start: '2015',
      end: '2019',
      description: 'Thesis: building a browser-based CV editor.'
    }
  ],
  skills: ['Vue.js', 'Nuxt', 'TypeScript', 'SCSS', 'Accessibility', 'Figma', 'Testing'],
  languages: [
    { name: 'Croatian', level: 'Native' },
    { name: 'English', level: 'C1' },
    { name: 'German', level: 'B1' }
  ],
  certifications: [{ name: 'Web Accessibility Specialist', issuer: 'IAAP', date: '2023' }]
}
