<template>
  <div class="tpa">
    <aside class="tpa__side" :style="{ background: v.accentTint }">
      <div v-if="v.p.photo" class="tpa__photo" :style="{ backgroundImage: `url(${v.p.photo})` }" />
      <div v-else class="tpa__blob" :style="{ background: v.accentSoft, color: v.accentDark }">{{ v.initials }}</div>

      <section v-if="v.contact.length" class="tpa__block">
        <h3 class="tpa__sh" :style="{ color: v.accentDark }">{{ v.t.contact }}</h3>
        <p v-for="c in v.contact" :key="c.icon" class="tpa__contact">
          <span class="tpa__ic"><AppIcon :name="c.icon" :size="11" :color="v.accent" :stroke="2.2" /></span><span>{{ c.text }}</span>
        </p>
      </section>
      <section v-if="v.skills.length" class="tpa__block">
        <h3 class="tpa__sh" :style="{ color: v.accentDark }">{{ v.t.skills }}</h3>
        <div class="tpa__chips"><span v-for="s in v.skills" :key="s" :style="{ color: v.accentDark }">{{ s }}</span></div>
      </section>
      <section v-if="v.languages.length" class="tpa__block">
        <h3 class="tpa__sh" :style="{ color: v.accentDark }">{{ v.t.languages }}</h3>
        <p v-for="l in v.languages" :key="l.id" class="tpa__item"><strong>{{ l.name }}</strong><span>{{ l.level }}</span></p>
      </section>
      <section v-if="v.certifications.length" class="tpa__block">
        <h3 class="tpa__sh" :style="{ color: v.accentDark }">{{ v.t.certifications }}</h3>
        <p v-for="c in v.certifications" :key="c.id" class="tpa__item cv-keep"><strong>{{ c.name }}</strong><span>{{ [c.issuer, c.date].filter(Boolean).join(' · ') }}</span></p>
      </section>
      <i class="cv-end" />
    </aside>

    <main class="tpa__main">
      <header class="tpa__head">
        <p class="tpa__hello" :style="{ color: v.accent }">{{ v.t.hello }}</p>
        <h1 class="tpa__name" :class="{ 'is-placeholder': !v.p.fullName }">{{ v.p.fullName || 'Your Name' }}</h1>
        <p class="tpa__title" :class="{ 'is-placeholder': !v.p.title }">
          <span :style="{ background: v.accentSoft }">{{ v.p.title || 'Professional title' }}</span>
        </p>
      </header>

      <section v-if="v.summary" class="tpa__section">
        <h2 class="tpa__h" :style="{ background: v.accentSoft, color: v.accentDark }">{{ v.t.profile }}</h2>
        <CvRichText :text="v.summary" :dot="v.accent" />
      </section>
      <section v-if="v.experience.length" class="tpa__section">
        <h2 class="tpa__h" :style="{ background: v.accentSoft, color: v.accentDark }">{{ v.t.experience }}</h2>
        <article v-for="e in v.experience" :key="e.id" class="tpa__entry cv-keep">
          <div class="tpa__row">
            <h4 class="tpa__role">{{ e.role }}</h4>
            <span class="tpa__date">{{ e.dates }}</span>
          </div>
          <p class="tpa__org" :style="{ color: v.accent }">{{ [e.company, e.location].filter(Boolean).join(' · ') }}</p>
          <CvRichText :text="e.description" :dot="v.accent" />
        </article>
      </section>
      <section v-if="v.education.length" class="tpa__section">
        <h2 class="tpa__h" :style="{ background: v.accentSoft, color: v.accentDark }">{{ v.t.education }}</h2>
        <article v-for="e in v.education" :key="e.id" class="tpa__entry cv-keep">
          <div class="tpa__row">
            <h4 class="tpa__role">{{ e.degree }}</h4>
            <span class="tpa__date">{{ e.dates }}</span>
          </div>
          <p class="tpa__org" :style="{ color: v.accent }">{{ [e.school, e.location].filter(Boolean).join(' · ') }}</p>
          <CvRichText :text="e.description" :dot="v.accent" />
        </article>
      </section>
      <i class="cv-end" />
    </main>
  </div>
</template>

<script setup>
defineProps({ v: { type: Object, required: true } })
</script>

<style scoped>
.tpa { display: flex; min-height: inherit; }
.tpa__side { width: 240px; flex-shrink: 0; padding: 44px 26px 36px; }
.tpa__photo { width: 140px; height: 140px; margin: 0 auto 28px; border-radius: 42% 58% 55% 45% / 48% 42% 58% 52%; background-size: cover; background-position: center; border: 5px solid #fff; }
.tpa__blob { display: flex; align-items: center; justify-content: center; width: 120px; height: 120px; margin: 0 auto 28px; border-radius: 42% 58% 55% 45% / 48% 42% 58% 52%; font-size: 36px; font-weight: 700; }
.tpa__block { margin-bottom: 24px; }
.tpa__sh { font-size: 12px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px; }
.tpa__contact { display: flex; align-items: center; gap: 8px; font-size: 11.5px; margin-bottom: 7px; word-break: break-word; }
.tpa__ic { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; flex-shrink: 0; border-radius: 50%; background: #fff; }
.tpa__chips { display: flex; flex-wrap: wrap; gap: 5px; }
.tpa__chips span { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 14px; background: #fff; }
.tpa__item { font-size: 12px; margin-bottom: 8px; }
.tpa__item strong { display: block; font-weight: 650; }
.tpa__item span { display: block; font-size: 11px; color: #6b7080; }
.tpa__main { flex: 1; min-width: 0; padding: 48px 42px 40px; }
.tpa__head { margin-bottom: 26px; }
.tpa__hello { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
.tpa__name { font-size: 36px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.08; color: #1b1d26; }
.tpa__title { margin-top: 10px; font-size: 15px; font-weight: 600; color: #2b2e3a; }
.tpa__title span { padding: 3px 10px; border-radius: 8px; }
.tpa__section { margin-bottom: 22px; }
.tpa__h { display: inline-block; padding: 4px 14px; margin-bottom: 12px; border-radius: 20px; font-size: 13px; font-weight: 700; }
.tpa__entry { margin-bottom: 14px; }
.tpa__row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.tpa__role { font-size: 14px; font-weight: 700; color: #1b1d26; }
.tpa__date { flex-shrink: 0; font-size: 11px; color: #6b7080; white-space: nowrap; }
.tpa__org { font-size: 12px; font-weight: 600; margin-bottom: 3px; }
</style>
