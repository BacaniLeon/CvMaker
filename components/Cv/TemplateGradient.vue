<template>
  <div class="tr">
    <header class="tr__head" :style="{ background: `linear-gradient(120deg, ${v.accent} 0%, ${v.accentDark} 100%)` }">
      <div class="tr__head-text">
        <h1 class="tr__name" :class="{ 'is-placeholder': !v.p.fullName }">{{ v.p.fullName || 'Your Name' }}</h1>
        <p class="tr__title" :class="{ 'is-placeholder': !v.p.title }">{{ v.p.title || 'Professional title' }}</p>
      </div>
      <div class="tr__circle tr__circle--a" />
      <div class="tr__circle tr__circle--b" />
    </header>
    <div v-if="v.p.photo" class="tr__photo" :style="{ backgroundImage: `url(${v.p.photo})` }" />

    <div class="tr__cols">
      <main class="tr__main">
        <section v-if="v.summary" class="tr__section">
          <h2 class="tr__h"><span :style="{ background: `linear-gradient(90deg, ${v.accent}, ${v.accentLight})` }" />{{ v.t.profile }}</h2>
          <CvRichText :text="v.summary" :dot="v.accent" />
        </section>
        <section v-if="v.experience.length" class="tr__section">
          <h2 class="tr__h"><span :style="{ background: `linear-gradient(90deg, ${v.accent}, ${v.accentLight})` }" />{{ v.t.experience }}</h2>
          <article v-for="e in v.experience" :key="e.id" class="tr__entry cv-keep">
            <div class="tr__row">
              <h4 class="tr__role">{{ e.role }}</h4>
              <span class="tr__date" :style="{ color: v.accent }">{{ e.dates }}</span>
            </div>
            <p class="tr__org">{{ [e.company, e.location].filter(Boolean).join(' · ') }}</p>
            <CvRichText :text="e.description" :dot="v.accent" />
          </article>
        </section>
        <section v-if="v.education.length" class="tr__section">
          <h2 class="tr__h"><span :style="{ background: `linear-gradient(90deg, ${v.accent}, ${v.accentLight})` }" />{{ v.t.education }}</h2>
          <article v-for="e in v.education" :key="e.id" class="tr__entry cv-keep">
            <div class="tr__row">
              <h4 class="tr__role">{{ e.degree }}</h4>
              <span class="tr__date" :style="{ color: v.accent }">{{ e.dates }}</span>
            </div>
            <p class="tr__org">{{ [e.school, e.location].filter(Boolean).join(' · ') }}</p>
            <CvRichText :text="e.description" :dot="v.accent" />
          </article>
        </section>
        <i class="cv-end" />
      </main>
      <aside class="tr__side" :class="{ 'has-photo': v.p.photo }">
        <section v-if="v.contact.length" class="tr__section">
          <h2 class="tr__h"><span :style="{ background: `linear-gradient(90deg, ${v.accent}, ${v.accentLight})` }" />{{ v.t.contact }}</h2>
          <p v-for="c in v.contact" :key="c.icon" class="tr__contact">
            <span class="tr__ic" :style="{ background: v.accentTint }"><AppIcon :name="c.icon" :size="11" :color="v.accent" :stroke="2.2" /></span>
            <span>{{ c.text }}</span>
          </p>
        </section>
        <section v-if="v.skills.length" class="tr__section">
          <h2 class="tr__h"><span :style="{ background: `linear-gradient(90deg, ${v.accent}, ${v.accentLight})` }" />{{ v.t.skills }}</h2>
          <div class="tr__chips"><span v-for="s in v.skills" :key="s" :style="{ background: v.accentTint, color: v.accentDark }">{{ s }}</span></div>
        </section>
        <section v-if="v.languages.length" class="tr__section">
          <h2 class="tr__h"><span :style="{ background: `linear-gradient(90deg, ${v.accent}, ${v.accentLight})` }" />{{ v.t.languages }}</h2>
          <p v-for="l in v.languages" :key="l.id" class="tr__item"><strong>{{ l.name }}</strong><span>{{ l.level }}</span></p>
        </section>
        <section v-if="v.certifications.length" class="tr__section">
          <h2 class="tr__h"><span :style="{ background: `linear-gradient(90deg, ${v.accent}, ${v.accentLight})` }" />{{ v.t.certifications }}</h2>
          <p v-for="c in v.certifications" :key="c.id" class="tr__item cv-keep"><strong>{{ c.name }}</strong><span>{{ [c.issuer, c.date].filter(Boolean).join(' · ') }}</span></p>
        </section>
        <i class="cv-end" />
      </aside>
    </div>
  </div>
</template>

<script setup>
defineProps({ v: { type: Object, required: true } })
</script>

<style scoped>
.tr { position: relative; }
.tr__head { position: relative; overflow: hidden; height: 190px; padding: 52px 50px 0; color: #fff; }
.tr__head-text { position: relative; z-index: 1; max-width: 480px; }
.tr__name { font-size: 38px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.05; }
.tr__title { margin-top: 8px; font-size: 15px; font-weight: 500; color: rgba(255, 255, 255, 0.85); }
.tr__circle { position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.08); }
.tr__circle--a { width: 260px; height: 260px; right: -60px; top: -110px; }
.tr__circle--b { width: 160px; height: 160px; right: 150px; bottom: -110px; }
.tr__photo { position: absolute; z-index: 2; top: 120px; right: 56px; width: 132px; height: 132px; border-radius: 50%; border: 5px solid #fff; background-size: cover; background-position: center; }
.tr__cols { display: flex; gap: 34px; padding: 30px 50px 36px; }
.tr__main { flex: 1; min-width: 0; }
.tr__side { width: 200px; flex-shrink: 0; }
.tr__side.has-photo { padding-top: 92px; }
.tr__section { margin-bottom: 22px; }
.tr__h { display: flex; align-items: center; gap: 10px; margin-bottom: 11px; font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #13151b; }
.tr__h span { width: 26px; height: 4px; border-radius: 2px; }
.tr__entry { margin-bottom: 14px; }
.tr__row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.tr__role { font-size: 13.5px; font-weight: 700; color: #13151b; }
.tr__date { flex-shrink: 0; font-size: 11px; font-weight: 700; white-space: nowrap; }
.tr__org { font-size: 12px; color: #5b6070; margin-bottom: 3px; }
.tr__contact { display: flex; align-items: center; gap: 8px; font-size: 11.5px; margin-bottom: 7px; word-break: break-word; }
.tr__ic { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; flex-shrink: 0; border-radius: 50%; }
.tr__chips { display: flex; flex-wrap: wrap; gap: 5px; }
.tr__chips span { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 12px; }
.tr__item { font-size: 12px; margin-bottom: 8px; }
.tr__item strong { display: block; font-weight: 650; }
.tr__item span { display: block; font-size: 11px; color: #6b7080; }
</style>
