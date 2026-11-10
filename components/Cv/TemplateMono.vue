<template>
  <div class="tmo">
    <header class="tmo__head">
      <div>
        <h1 class="tmo__name" :class="{ 'is-placeholder': !v.p.fullName }">{{ v.p.fullName || 'Your Name' }}</h1>
        <p class="tmo__title" :class="{ 'is-placeholder': !v.p.title }">{{ v.p.title || 'Professional title' }}</p>
      </div>
      <div v-if="v.p.photo" class="tmo__photo" :style="{ backgroundImage: `url(${v.p.photo})` }" />
    </header>
    <p v-if="v.contact.length" class="tmo__contact">
      <span v-for="c in v.contact" :key="c.icon">{{ c.text }}</span>
    </p>

    <section v-if="v.summary" class="tmo__section">
      <h2 class="tmo__h">{{ v.t.profile }}</h2>
      <CvRichText :text="v.summary" dot="#111" />
    </section>

    <section v-if="v.experience.length" class="tmo__section">
      <h2 class="tmo__h">{{ v.t.experience }}</h2>
      <article v-for="e in v.experience" :key="e.id" class="tmo__entry cv-keep">
        <div class="tmo__row">
          <h4 class="tmo__role">{{ e.role }}</h4>
          <span class="tmo__date">{{ e.dates }}</span>
        </div>
        <p class="tmo__org">{{ [e.company, e.location].filter(Boolean).join(' / ') }}</p>
        <CvRichText :text="e.description" dot="#111" />
      </article>
    </section>

    <section v-if="v.education.length" class="tmo__section">
      <h2 class="tmo__h">{{ v.t.education }}</h2>
      <article v-for="e in v.education" :key="e.id" class="tmo__entry cv-keep">
        <div class="tmo__row">
          <h4 class="tmo__role">{{ e.degree }}</h4>
          <span class="tmo__date">{{ e.dates }}</span>
        </div>
        <p class="tmo__org">{{ [e.school, e.location].filter(Boolean).join(' / ') }}</p>
        <CvRichText :text="e.description" dot="#111" />
      </article>
    </section>

    <div class="tmo__grid">
      <section v-if="v.skills.length" class="tmo__section cv-keep">
        <h2 class="tmo__h">{{ v.t.skills }}</h2>
        <p v-for="s in v.skills" :key="s" class="tmo__small">{{ s }}</p>
      </section>
      <section v-if="v.languages.length" class="tmo__section cv-keep">
        <h2 class="tmo__h">{{ v.t.languages }}</h2>
        <p v-for="l in v.languages" :key="l.id" class="tmo__small"><strong>{{ l.name }}</strong> — {{ l.level }}</p>
      </section>
      <section v-if="v.certifications.length" class="tmo__section cv-keep">
        <h2 class="tmo__h">{{ v.t.certifications }}</h2>
        <p v-for="c in v.certifications" :key="c.id" class="tmo__small"><strong>{{ c.name }}</strong><br />{{ [c.issuer, c.date].filter(Boolean).join(', ') }}</p>
      </section>
    </div>
    <i class="cv-end" />
  </div>
</template>

<script setup>
defineProps({ v: { type: Object, required: true } })
</script>

<style scoped>
.tmo { padding: 0 56px 42px; border-top: 14px solid #111; color: #111; }
.tmo__head { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; padding-top: 40px; }
.tmo__name { font-size: 42px; font-weight: 800; letter-spacing: 0.02em; line-height: 1; text-transform: uppercase; }
.tmo__title { margin-top: 10px; font-size: 14px; font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase; color: #555; }
.tmo__photo { width: 92px; height: 92px; flex-shrink: 0; background-size: cover; background-position: center; border: 2px solid #111; }
.tmo__contact { display: flex; flex-wrap: wrap; gap: 4px 0; margin: 18px 0 24px; padding: 9px 0; border-top: 2px solid #111; border-bottom: 2px solid #111; font-size: 11.5px; font-weight: 500; }
.tmo__contact span { padding: 0 14px; border-left: 1px solid #111; }
.tmo__contact span:first-child { padding-left: 0; border-left: 0; }
.tmo__section { margin-bottom: 20px; }
.tmo__h { display: inline-block; margin-bottom: 11px; padding: 3px 10px; background: #111; color: #fff; font-size: 11.5px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; }
.tmo__entry { margin-bottom: 13px; }
.tmo__row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.tmo__role { font-size: 14px; font-weight: 800; }
.tmo__date { flex-shrink: 0; font-size: 11px; font-weight: 700; white-space: nowrap; }
.tmo__org { font-size: 12px; font-weight: 500; color: #555; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.06em; }
.tmo__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; }
.tmo__small { font-size: 12px; margin-bottom: 4px; }
.tmo__small strong { font-weight: 700; }
</style>
