<template>
  <div class="tq">
    <header class="tq__card tq__head">
      <div v-if="v.p.photo" class="tq__photo" :style="{ backgroundImage: `url(${v.p.photo})` }" />
      <div v-else class="tq__initials" :style="{ background: v.accent }">{{ v.initials }}</div>
      <div class="tq__id">
        <h1 class="tq__name" :class="{ 'is-placeholder': !v.p.fullName }">{{ v.p.fullName || 'Your Name' }}</h1>
        <p class="tq__title" :style="{ color: v.accent }" :class="{ 'is-placeholder': !v.p.title }">{{ v.p.title || 'Professional title' }}</p>
        <div v-if="v.contact.length" class="tq__contact">
          <span v-for="c in v.contact" :key="c.icon" :style="{ background: v.accentTint }">
            <AppIcon :name="c.icon" :size="11" :color="v.accent" :stroke="2.2" />{{ c.text }}
          </span>
        </div>
      </div>
    </header>

    <section v-if="v.summary" class="tq__card">
      <h2 class="tq__h"><i :style="{ background: v.accent }" />{{ v.t.profile }}</h2>
      <CvRichText :text="v.summary" :dot="v.accent" />
    </section>

    <div class="tq__cols">
      <div class="tq__main">
        <section v-if="v.experience.length" class="tq__card">
          <h2 class="tq__h"><i :style="{ background: v.accent }" />{{ v.t.experience }}</h2>
          <article v-for="e in v.experience" :key="e.id" class="tq__entry cv-keep">
            <div class="tq__row">
              <h4 class="tq__role">{{ e.role }}</h4>
              <span class="tq__date" :style="{ background: v.accentTint, color: v.accentDark }">{{ e.dates }}</span>
            </div>
            <p class="tq__org">{{ [e.company, e.location].filter(Boolean).join(' · ') }}</p>
            <CvRichText :text="e.description" :dot="v.accent" />
          </article>
        </section>
        <section v-if="v.education.length" class="tq__card">
          <h2 class="tq__h"><i :style="{ background: v.accent }" />{{ v.t.education }}</h2>
          <article v-for="e in v.education" :key="e.id" class="tq__entry cv-keep">
            <div class="tq__row">
              <h4 class="tq__role">{{ e.degree }}</h4>
              <span class="tq__date" :style="{ background: v.accentTint, color: v.accentDark }">{{ e.dates }}</span>
            </div>
            <p class="tq__org">{{ [e.school, e.location].filter(Boolean).join(' · ') }}</p>
            <CvRichText :text="e.description" :dot="v.accent" />
          </article>
        </section>
        <i class="cv-end" />
      </div>
      <div class="tq__side">
        <section v-if="v.skills.length" class="tq__card">
          <h2 class="tq__h"><i :style="{ background: v.accent }" />{{ v.t.skills }}</h2>
          <div class="tq__chips"><span v-for="s in v.skills" :key="s">{{ s }}</span></div>
        </section>
        <section v-if="v.languages.length" class="tq__card">
          <h2 class="tq__h"><i :style="{ background: v.accent }" />{{ v.t.languages }}</h2>
          <div v-for="l in v.languages" :key="l.id" class="tq__lang">
            <div class="tq__lang-top"><strong>{{ l.name }}</strong><span>{{ l.level }}</span></div>
            <div v-if="l.dots" class="tq__bar"><i :style="{ width: `${l.dots * 20}%`, background: v.accent }" /></div>
          </div>
        </section>
        <section v-if="v.certifications.length" class="tq__card">
          <h2 class="tq__h"><i :style="{ background: v.accent }" />{{ v.t.certifications }}</h2>
          <p v-for="c in v.certifications" :key="c.id" class="tq__cert cv-keep"><strong>{{ c.name }}</strong><span>{{ [c.issuer, c.date].filter(Boolean).join(' · ') }}</span></p>
        </section>
        <i class="cv-end" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ v: { type: Object, required: true } })
</script>

<style scoped>
.tq { min-height: inherit; padding: 28px; background: #f1f2f5; }
.tq__card { background: #fff; border-radius: 12px; padding: 18px 20px; margin-bottom: 14px; }
.tq__head { display: flex; align-items: center; gap: 20px; padding: 22px; }
.tq__photo { width: 96px; height: 96px; flex-shrink: 0; border-radius: 50%; background-size: cover; background-position: center; }
.tq__initials { display: flex; align-items: center; justify-content: center; width: 86px; height: 86px; flex-shrink: 0; border-radius: 50%; color: #fff; font-size: 30px; font-weight: 700; }
.tq__id { flex: 1; min-width: 0; }
.tq__name { font-size: 30px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; color: #12141a; }
.tq__title { margin-top: 4px; font-size: 14px; font-weight: 600; }
.tq__contact { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.tq__contact span { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 12px; font-size: 10.5px; }
.tq__h { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 13px; font-weight: 700; color: #12141a; }
.tq__h i { width: 4px; height: 14px; border-radius: 2px; }
.tq__cols { display: flex; gap: 14px; }
.tq__main { flex: 1; min-width: 0; }
.tq__side { width: 220px; flex-shrink: 0; }
.tq__entry { margin-bottom: 13px; }
.tq__entry:last-child { margin-bottom: 0; }
.tq__row { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.tq__role { font-size: 13.5px; font-weight: 650; color: #12141a; }
.tq__date { flex-shrink: 0; padding: 2px 8px; border-radius: 10px; font-size: 10.5px; font-weight: 600; white-space: nowrap; }
.tq__org { font-size: 12px; color: #5b6070; margin-bottom: 3px; }
.tq__chips { display: flex; flex-wrap: wrap; gap: 5px; }
.tq__chips span { font-size: 11px; padding: 3px 9px; border-radius: 6px; background: #f1f2f5; }
.tq__lang { margin-bottom: 10px; font-size: 12px; }
.tq__lang-top { display: flex; justify-content: space-between; gap: 8px; }
.tq__lang-top strong { font-weight: 600; }
.tq__lang-top span { font-size: 11px; color: #6b7080; }
.tq__bar { height: 5px; margin-top: 4px; border-radius: 3px; background: #eceef2; overflow: hidden; }
.tq__bar i { display: block; height: 100%; border-radius: 3px; }
.tq__cert { font-size: 12px; margin-bottom: 8px; }
.tq__cert strong { display: block; font-weight: 600; }
.tq__cert span { display: block; font-size: 11px; color: #6b7080; }
</style>
