<template>
  <div class="tk">
    <header class="tk__head">
      <h1 class="tk__name">
        <span :class="{ 'is-placeholder': !v.p.fullName }">{{ v.p.fullName || 'Your Name' }}</span>
        <span class="tk__title" :style="{ color: v.accent }" :class="{ 'is-placeholder': !v.p.title }">{{ v.p.title || 'Professional title' }}</span>
      </h1>
      <p v-if="v.contact.length" class="tk__contact">{{ v.contact.map((c) => c.text).join('  |  ') }}</p>
    </header>

    <section v-if="v.summary" class="tk__section">
      <h2 class="tk__h" :style="{ color: v.accent }">{{ v.t.profile }}</h2>
      <CvRichText :text="v.summary" dot="#333" />
    </section>

    <section v-if="v.experience.length" class="tk__section">
      <h2 class="tk__h" :style="{ color: v.accent }">{{ v.t.experience }}</h2>
      <article v-for="e in v.experience" :key="e.id" class="tk__entry cv-keep">
        <div class="tk__row">
          <p><strong>{{ e.role }}</strong><span v-if="e.company">, {{ e.company }}</span><span v-if="e.location" class="tk__muted"> — {{ e.location }}</span></p>
          <span class="tk__date">{{ e.dates }}</span>
        </div>
        <CvRichText :text="e.description" dot="#333" />
      </article>
    </section>

    <section v-if="v.education.length" class="tk__section">
      <h2 class="tk__h" :style="{ color: v.accent }">{{ v.t.education }}</h2>
      <article v-for="e in v.education" :key="e.id" class="tk__entry cv-keep">
        <div class="tk__row">
          <p><strong>{{ e.degree }}</strong><span v-if="e.school">, {{ e.school }}</span><span v-if="e.location" class="tk__muted"> — {{ e.location }}</span></p>
          <span class="tk__date">{{ e.dates }}</span>
        </div>
        <CvRichText :text="e.description" dot="#333" />
      </article>
    </section>

    <section v-if="v.skills.length || v.languages.length || v.certifications.length" class="tk__section cv-keep">
      <h2 class="tk__h" :style="{ color: v.accent }">{{ v.t.skills }} &amp; {{ v.t.languages }}</h2>
      <p v-if="v.skills.length" class="tk__line"><strong>{{ v.t.skills }}:</strong> {{ v.skills.join(', ') }}</p>
      <p v-if="v.languages.length" class="tk__line">
        <strong>{{ v.t.languages }}:</strong> {{ v.languages.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join(', ') }}
      </p>
      <p v-if="v.certifications.length" class="tk__line">
        <strong>{{ v.t.certifications }}:</strong>
        {{ v.certifications.map((c) => [c.name, c.issuer, c.date].filter(Boolean).join(', ')).join('; ') }}
      </p>
    </section>
    <i class="cv-end" />
  </div>
</template>

<script setup>
defineProps({ v: { type: Object, required: true } })
</script>

<style scoped>
.tk { padding: 38px 46px 34px; font-size: 11.5px; line-height: 1.45; color: #1a1c22; }
.tk__head { margin-bottom: 12px; }
.tk__name { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; font-size: 24px; font-weight: 700; letter-spacing: -0.01em; }
.tk__title { font-size: 14px; font-weight: 600; }
.tk__contact { margin-top: 4px; font-size: 11px; color: #444955; white-space: pre-wrap; }
.tk__section { margin-bottom: 11px; }
.tk__h { font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; padding-bottom: 3px; margin-bottom: 7px; border-bottom: 1.5px solid #1a1c22; }
.tk__entry { margin-bottom: 8px; }
.tk__row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.tk__row strong { font-weight: 700; }
.tk__muted { color: #5c6170; }
.tk__date { flex-shrink: 0; font-size: 10.5px; font-weight: 600; white-space: nowrap; }
.tk__line { margin-bottom: 3px; }
.tk__line strong { font-weight: 700; }
</style>
