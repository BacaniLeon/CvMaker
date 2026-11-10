<template>
  <div class="ti">
    <aside class="ti__side">
      <div class="ti__photo-wrap" :style="{ borderColor: v.accent }">
        <div v-if="v.p.photo" class="ti__photo" :style="{ backgroundImage: `url(${v.p.photo})` }" />
        <div v-else class="ti__initials">{{ v.initials }}</div>
      </div>

      <section v-if="v.contact.length" class="ti__block">
        <h3 class="ti__sh"><span :style="{ background: v.accent }" />{{ v.t.contact }}</h3>
        <p v-for="c in v.contact" :key="c.icon" class="ti__contact">
          <span class="ti__ic" :style="{ background: v.accent }"><AppIcon :name="c.icon" :size="11" color="#ffffff" :stroke="2.2" /></span>
          <span>{{ c.text }}</span>
        </p>
      </section>

      <section v-if="v.languages.length" class="ti__block">
        <h3 class="ti__sh"><span :style="{ background: v.accent }" />{{ v.t.languages }}</h3>
        <div v-for="l in v.languages" :key="l.id" class="ti__lang">
          <span>{{ l.name }}</span>
          <span v-if="l.dots" class="ti__dots"><i v-for="n in 5" :key="n" :style="{ background: n <= l.dots ? v.accent : 'rgba(255,255,255,0.18)' }" /></span>
          <span v-else class="ti__muted">{{ l.level }}</span>
        </div>
      </section>

      <section v-if="v.skills.length" class="ti__block">
        <h3 class="ti__sh"><span :style="{ background: v.accent }" />{{ v.t.skills }}</h3>
        <div class="ti__chips"><span v-for="s in v.skills" :key="s">{{ s }}</span></div>
      </section>
      <i class="cv-end" />
    </aside>

    <main class="ti__main">
      <header class="ti__head">
        <h1 class="ti__name" :class="{ 'is-placeholder': !v.p.fullName }">{{ v.p.fullName || 'Your Name' }}</h1>
        <p class="ti__title" :style="{ color: v.accent }" :class="{ 'is-placeholder': !v.p.title }">{{ v.p.title || 'Professional title' }}</p>
      </header>

      <section v-if="v.summary" class="ti__section">
        <h2 class="ti__h"><span class="ti__hic" :style="{ background: v.accent }"><AppIcon name="user" :size="14" color="#ffffff" :stroke="2.2" /></span>{{ v.t.profile }}</h2>
        <CvRichText :text="v.summary" :dot="v.accent" />
      </section>

      <section v-if="v.experience.length" class="ti__section">
        <h2 class="ti__h"><span class="ti__hic" :style="{ background: v.accent }"><AppIcon name="briefcase" :size="14" color="#ffffff" :stroke="2.2" /></span>{{ v.t.experience }}</h2>
        <article v-for="e in v.experience" :key="e.id" class="ti__entry cv-keep">
          <i class="ti__node" :style="{ borderColor: v.accent }" />
          <p class="ti__date" :style="{ color: v.accent }">{{ e.dates }}</p>
          <h4 class="ti__role">{{ e.role }}</h4>
          <p class="ti__org">{{ [e.company, e.location].filter(Boolean).join(' · ') }}</p>
          <CvRichText :text="e.description" :dot="v.accent" />
        </article>
      </section>

      <section v-if="v.education.length" class="ti__section">
        <h2 class="ti__h"><span class="ti__hic" :style="{ background: v.accent }"><AppIcon name="cap" :size="14" color="#ffffff" :stroke="2.2" /></span>{{ v.t.education }}</h2>
        <article v-for="e in v.education" :key="e.id" class="ti__entry cv-keep">
          <i class="ti__node" :style="{ borderColor: v.accent }" />
          <p class="ti__date" :style="{ color: v.accent }">{{ e.dates }}</p>
          <h4 class="ti__role">{{ e.degree }}</h4>
          <p class="ti__org">{{ [e.school, e.location].filter(Boolean).join(' · ') }}</p>
          <CvRichText :text="e.description" :dot="v.accent" />
        </article>
      </section>

      <section v-if="v.certifications.length" class="ti__section">
        <h2 class="ti__h"><span class="ti__hic" :style="{ background: v.accent }"><AppIcon name="award" :size="14" color="#ffffff" :stroke="2.2" /></span>{{ v.t.certifications }}</h2>
        <div class="ti__certs">
          <p v-for="c in v.certifications" :key="c.id" class="ti__cert cv-keep" :style="{ borderColor: v.accentLine }">
            <strong>{{ c.name }}</strong><span>{{ [c.issuer, c.date].filter(Boolean).join(' · ') }}</span>
          </p>
        </div>
      </section>
      <i class="cv-end" />
    </main>
  </div>
</template>

<script setup>
defineProps({ v: { type: Object, required: true } })
</script>

<style scoped>
.ti { display: flex; min-height: inherit; }
.ti__side { width: 248px; flex-shrink: 0; padding: 44px 26px 36px; background: #1e2230; color: #e7e9f0; }
.ti__photo-wrap { width: 146px; height: 146px; margin: 0 auto 30px; padding: 5px; border-radius: 50%; border: 3px solid; }
.ti__photo { width: 100%; height: 100%; border-radius: 50%; background-size: cover; background-position: center; }
.ti__initials { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; border-radius: 50%; background: #2c3142; font-size: 40px; font-weight: 700; color: #fff; }
.ti__block { margin-bottom: 26px; }
.ti__sh { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 12px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #fff; }
.ti__sh span { width: 14px; height: 3px; border-radius: 2px; }
.ti__contact { display: flex; align-items: center; gap: 9px; font-size: 11.5px; margin-bottom: 8px; word-break: break-word; }
.ti__ic { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; flex-shrink: 0; border-radius: 50%; }
.ti__lang { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 12px; margin-bottom: 9px; }
.ti__dots { display: flex; gap: 4px; }
.ti__dots i { width: 9px; height: 9px; border-radius: 50%; }
.ti__muted { font-size: 11px; color: #a3a8b8; }
.ti__chips { display: flex; flex-wrap: wrap; gap: 5px; }
.ti__chips span { font-size: 11px; padding: 3px 9px; border-radius: 12px; background: rgba(255, 255, 255, 0.1); }
.ti__main { flex: 1; min-width: 0; padding: 46px 40px 40px; }
.ti__head { margin-bottom: 26px; padding-bottom: 20px; border-bottom: 1px solid #e7e8ec; }
.ti__name { font-size: 34px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.08; color: #1e2230; }
.ti__title { margin-top: 6px; font-size: 15px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.ti__section { margin-bottom: 22px; }
.ti__h { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; font-size: 15px; font-weight: 800; color: #1e2230; }
.ti__hic { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; }
.ti__entry { position: relative; margin-left: 13px; padding: 0 0 12px 22px; border-left: 2px solid #e7e8ec; }
.ti__node { position: absolute; left: -7px; top: 2px; width: 12px; height: 12px; border-radius: 50%; border: 3px solid; background: #fff; }
.ti__date { font-size: 10.5px; font-weight: 700; letter-spacing: 0.04em; }
.ti__role { font-size: 13.5px; font-weight: 700; color: #1e2230; }
.ti__org { font-size: 12px; color: #5b6070; margin-bottom: 3px; }
.ti__certs { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ti__cert { padding: 8px 10px; border: 1px solid; border-radius: 8px; font-size: 12px; }
.ti__cert strong { display: block; font-weight: 650; }
.ti__cert span { display: block; font-size: 11px; color: #6b7080; }
</style>
