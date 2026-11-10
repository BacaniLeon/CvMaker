<template>
  <div class="ta">
    <main class="ta__main">
      <header class="ta__head">
        <h1 class="ta__name" :class="{ 'is-placeholder': !v.p.fullName }">{{ v.p.fullName || 'Your Name' }}</h1>
        <p class="ta__title" :style="{ color: v.accent }" :class="{ 'is-placeholder': !v.p.title }">{{ v.p.title || 'Professional title' }}</p>
      </header>

      <section v-if="v.summary" class="ta__section">
        <h2 class="ta__h">{{ v.t.profile }}</h2>
        <CvRichText :text="v.summary" :dot="v.accent" />
      </section>
      <section v-if="v.experience.length" class="ta__section">
        <h2 class="ta__h">{{ v.t.experience }}</h2>
        <article v-for="e in v.experience" :key="e.id" class="ta__entry cv-keep">
          <i class="ta__dot" :style="{ background: v.accent }" />
          <div class="ta__row">
            <h4 class="ta__role">{{ e.role }}</h4>
            <span class="ta__date" :style="{ color: v.accent }">{{ e.dates }}</span>
          </div>
          <p class="ta__org">{{ [e.company, e.location].filter(Boolean).join(' · ') }}</p>
          <CvRichText :text="e.description" :dot="v.accent" />
        </article>
      </section>
      <section v-if="v.education.length" class="ta__section">
        <h2 class="ta__h">{{ v.t.education }}</h2>
        <article v-for="e in v.education" :key="e.id" class="ta__entry cv-keep">
          <i class="ta__dot" :style="{ background: v.accent }" />
          <div class="ta__row">
            <h4 class="ta__role">{{ e.degree }}</h4>
            <span class="ta__date" :style="{ color: v.accent }">{{ e.dates }}</span>
          </div>
          <p class="ta__org">{{ [e.school, e.location].filter(Boolean).join(' · ') }}</p>
          <CvRichText :text="e.description" :dot="v.accent" />
        </article>
      </section>
      <i class="cv-end" />
    </main>

    <aside class="ta__side" :style="{ background: v.accentTint }">
      <div v-if="v.p.photo" class="ta__photo" :style="{ backgroundImage: `url(${v.p.photo})` }" />
      <section v-if="v.contact.length" class="ta__block">
        <h3 class="ta__sh" :style="{ color: v.accentDark }">{{ v.t.contact }}</h3>
        <p v-for="c in v.contact" :key="c.icon" class="ta__contact">
          <AppIcon :name="c.icon" :size="12" :color="v.accent" :stroke="2.2" /><span>{{ c.text }}</span>
        </p>
      </section>
      <section v-if="v.skills.length" class="ta__block">
        <h3 class="ta__sh" :style="{ color: v.accentDark }">{{ v.t.skills }}</h3>
        <div class="ta__chips"><span v-for="s in v.skills" :key="s" :style="{ borderColor: v.accentLine, color: v.accentDark }">{{ s }}</span></div>
      </section>
      <section v-if="v.languages.length" class="ta__block">
        <h3 class="ta__sh" :style="{ color: v.accentDark }">{{ v.t.languages }}</h3>
        <div v-for="l in v.languages" :key="l.id" class="ta__lang">
          <span>{{ l.name }}</span>
          <span v-if="l.dots" class="ta__dots"><i v-for="n in 5" :key="n" :style="{ background: n <= l.dots ? v.accent : v.accentLine }" /></span>
          <span v-else class="ta__muted">{{ l.level }}</span>
        </div>
      </section>
      <section v-if="v.certifications.length" class="ta__block">
        <h3 class="ta__sh" :style="{ color: v.accentDark }">{{ v.t.certifications }}</h3>
        <p v-for="c in v.certifications" :key="c.id" class="ta__cert cv-keep"><strong>{{ c.name }}</strong><span>{{ [c.issuer, c.date].filter(Boolean).join(' · ') }}</span></p>
      </section>
      <i class="cv-end" />
    </aside>
  </div>
</template>

<script setup>
defineProps({ v: { type: Object, required: true } })
</script>

<style scoped>
.ta { display: flex; min-height: inherit; }
.ta__main { flex: 1; min-width: 0; padding: 50px 38px 40px 50px; }
.ta__side { width: 236px; flex-shrink: 0; padding: 50px 26px 40px; }
.ta__head { margin-bottom: 26px; }
.ta__name { font-size: 34px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.08; color: #13151b; }
.ta__title { margin-top: 6px; font-size: 15px; font-weight: 600; }
.ta__section { margin-bottom: 22px; }
.ta__h { font-size: 16px; font-weight: 700; color: #13151b; margin-bottom: 12px; }
.ta__entry { position: relative; padding-left: 18px; margin-bottom: 14px; }
.ta__dot { position: absolute; left: 0; top: 6px; width: 8px; height: 8px; border-radius: 50%; }
.ta__row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.ta__role { font-size: 13.5px; font-weight: 650; color: #13151b; }
.ta__date { flex-shrink: 0; font-size: 11px; font-weight: 600; white-space: nowrap; }
.ta__org { font-size: 12px; color: #5b6070; margin-bottom: 3px; }
.ta__photo { width: 120px; height: 120px; margin: 0 auto 26px; border-radius: 22px; background-size: cover; background-position: center; }
.ta__block { margin-bottom: 24px; }
.ta__sh { font-size: 11px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 10px; }
.ta__contact { display: flex; align-items: flex-start; gap: 8px; font-size: 11.5px; margin-bottom: 7px; word-break: break-word; }
.ta__contact :deep(svg) { margin-top: 2px; }
.ta__chips { display: flex; flex-wrap: wrap; gap: 5px; }
.ta__chips span { font-size: 11px; font-weight: 550; padding: 3px 9px; border-radius: 12px; border: 1px solid; background: #fff; }
.ta__lang { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 12px; margin-bottom: 7px; }
.ta__dots { display: flex; gap: 3px; }
.ta__dots i { width: 8px; height: 8px; border-radius: 50%; }
.ta__muted { font-size: 11px; color: #6b7080; }
.ta__cert { font-size: 12px; margin-bottom: 8px; }
.ta__cert strong { display: block; font-weight: 600; }
.ta__cert span { display: block; font-size: 11px; color: #6b7080; }
</style>
