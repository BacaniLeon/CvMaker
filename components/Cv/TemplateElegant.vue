<template>
  <div class="tg">
    <header class="tg__head">
      <h1 class="tg__name" :class="{ 'is-placeholder': !v.p.fullName }">{{ v.p.fullName || 'Your Name' }}</h1>
      <p class="tg__title" :style="{ color: v.accent }" :class="{ 'is-placeholder': !v.p.title }">{{ v.p.title || 'Professional title' }}</p>
      <div class="tg__rule" :style="{ borderColor: v.accentLine }" />
      <p v-if="v.contact.length" class="tg__contact">
        <template v-for="(c, i) in v.contact" :key="c.icon"><span v-if="i" class="tg__sep" :style="{ color: v.accent }">◆</span>{{ c.text }}</template>
      </p>
    </header>

    <section v-if="v.summary" class="tg__section">
      <h2 class="tg__h"><i :style="{ background: v.accentLine }" /><span>{{ v.t.profile }}</span><i :style="{ background: v.accentLine }" /></h2>
      <div class="tg__summary"><CvRichText :text="v.summary" :dot="v.accent" /></div>
    </section>

    <section v-if="v.experience.length" class="tg__section">
      <h2 class="tg__h"><i :style="{ background: v.accentLine }" /><span>{{ v.t.experience }}</span><i :style="{ background: v.accentLine }" /></h2>
      <article v-for="e in v.experience" :key="e.id" class="tg__entry cv-keep">
        <div class="tg__row">
          <h4 class="tg__role">{{ e.role }}</h4>
          <span class="tg__date">{{ e.dates }}</span>
        </div>
        <p class="tg__org">{{ [e.company, e.location].filter(Boolean).join(', ') }}</p>
        <CvRichText :text="e.description" :dot="v.accent" />
      </article>
    </section>

    <section v-if="v.education.length" class="tg__section">
      <h2 class="tg__h"><i :style="{ background: v.accentLine }" /><span>{{ v.t.education }}</span><i :style="{ background: v.accentLine }" /></h2>
      <article v-for="e in v.education" :key="e.id" class="tg__entry cv-keep">
        <div class="tg__row">
          <h4 class="tg__role">{{ e.degree }}</h4>
          <span class="tg__date">{{ e.dates }}</span>
        </div>
        <p class="tg__org">{{ [e.school, e.location].filter(Boolean).join(', ') }}</p>
        <CvRichText :text="e.description" :dot="v.accent" />
      </article>
    </section>

    <div class="tg__cols">
      <section v-if="v.skills.length" class="tg__section cv-keep">
        <h2 class="tg__h"><i :style="{ background: v.accentLine }" /><span>{{ v.t.skills }}</span><i :style="{ background: v.accentLine }" /></h2>
        <p class="tg__center">{{ v.skills.join(' · ') }}</p>
      </section>
      <section v-if="v.languages.length" class="tg__section cv-keep">
        <h2 class="tg__h"><i :style="{ background: v.accentLine }" /><span>{{ v.t.languages }}</span><i :style="{ background: v.accentLine }" /></h2>
        <p class="tg__center">
          <template v-for="(l, i) in v.languages" :key="l.id">{{ i ? ' · ' : '' }}{{ l.name }}<em v-if="l.level"> ({{ l.level }})</em></template>
        </p>
      </section>
    </div>

    <section v-if="v.certifications.length" class="tg__section">
      <h2 class="tg__h"><i :style="{ background: v.accentLine }" /><span>{{ v.t.certifications }}</span><i :style="{ background: v.accentLine }" /></h2>
      <p v-for="c in v.certifications" :key="c.id" class="tg__center cv-keep">
        <strong>{{ c.name }}</strong><em v-if="c.issuer || c.date"> — {{ [c.issuer, c.date].filter(Boolean).join(', ') }}</em>
      </p>
    </section>
    <i class="cv-end" />
  </div>
</template>

<script setup>
defineProps({ v: { type: Object, required: true } })
</script>

<style scoped>
.tg { padding: 56px 70px 44px; }
.tg__head { text-align: center; margin-bottom: 26px; }
.tg__name { font-family: 'Playfair Display', Georgia, serif; font-size: 38px; font-weight: 500; letter-spacing: 0.04em; color: #15161c; }
.tg__title { margin-top: 6px; font-size: 12.5px; font-weight: 600; letter-spacing: 0.28em; text-transform: uppercase; }
.tg__rule { width: 120px; height: 4px; margin: 16px auto 12px; border-top: 1px solid; border-bottom: 1px solid; }
.tg__contact { font-size: 11.5px; color: #555a68; }
.tg__sep { margin: 0 9px; font-size: 7px; vertical-align: 2px; }
.tg__section { margin-bottom: 20px; }
.tg__h { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; font-family: 'Playfair Display', Georgia, serif; font-size: 15px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: #15161c; }
.tg__h i { flex: 1; height: 1px; }
.tg__summary { text-align: center; font-style: italic; color: #3d4150; }
.tg__entry { margin-bottom: 13px; }
.tg__row { display: flex; justify-content: space-between; align-items: baseline; gap: 14px; }
.tg__role { font-family: 'Playfair Display', Georgia, serif; font-size: 15px; font-weight: 600; color: #15161c; }
.tg__date { flex-shrink: 0; font-size: 11px; letter-spacing: 0.06em; color: #6b7080; text-transform: uppercase; }
.tg__org { font-style: italic; color: #555a68; margin-bottom: 3px; }
.tg__cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0 30px; }
.tg__center { text-align: center; line-height: 1.75; }
.tg__center strong { font-weight: 600; }
.tg__center em { color: #6b7080; }
</style>
