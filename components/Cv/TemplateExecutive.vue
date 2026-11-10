<template>
  <div class="tx">
    <header class="tx__head" :style="{ background: v.accentDark }">
      <div class="tx__head-text">
        <h1 class="tx__name" :class="{ 'is-placeholder': !v.p.fullName }">{{ v.p.fullName || 'Your Name' }}</h1>
        <p class="tx__title" :class="{ 'is-placeholder': !v.p.title }">{{ v.p.title || 'Professional title' }}</p>
        <div v-if="v.contact.length" class="tx__contact">
          <span v-for="c in v.contact" :key="c.icon">
            <AppIcon :name="c.icon" :size="12" color="rgba(255,255,255,0.7)" :stroke="2" />{{ c.text }}
          </span>
        </div>
      </div>
      <div v-if="v.p.photo" class="tx__photo" :style="{ backgroundImage: `url(${v.p.photo})` }" />
    </header>

    <div class="tx__body">
      <main class="tx__main">
        <section v-if="v.summary" class="tx__section">
          <h2 class="tx__h" :style="{ color: v.accentDark }">{{ v.t.profile }}</h2>
          <CvRichText :text="v.summary" :dot="v.accent" />
        </section>
        <section v-if="v.experience.length" class="tx__section">
          <h2 class="tx__h" :style="{ color: v.accentDark }">{{ v.t.experience }}</h2>
          <article v-for="e in v.experience" :key="e.id" class="tx__entry cv-keep">
            <div class="tx__row">
              <h4 class="tx__role">{{ e.role }}</h4>
              <span class="tx__date">{{ e.dates }}</span>
            </div>
            <p class="tx__org" :style="{ color: v.accent }">{{ [e.company, e.location].filter(Boolean).join(' · ') }}</p>
            <CvRichText :text="e.description" :dot="v.accent" />
          </article>
        </section>
        <section v-if="v.education.length" class="tx__section">
          <h2 class="tx__h" :style="{ color: v.accentDark }">{{ v.t.education }}</h2>
          <article v-for="e in v.education" :key="e.id" class="tx__entry cv-keep">
            <div class="tx__row">
              <h4 class="tx__role">{{ e.degree }}</h4>
              <span class="tx__date">{{ e.dates }}</span>
            </div>
            <p class="tx__org" :style="{ color: v.accent }">{{ [e.school, e.location].filter(Boolean).join(' · ') }}</p>
            <CvRichText :text="e.description" :dot="v.accent" />
          </article>
        </section>
        <i class="cv-end" />
      </main>

      <aside class="tx__side">
        <section v-if="v.skills.length" class="tx__section">
          <h2 class="tx__h tx__h--side" :style="{ color: v.accentDark }">{{ v.t.skills }}</h2>
          <ul class="tx__list">
            <li v-for="s in v.skills" :key="s"><i :style="{ background: v.accent }" />{{ s }}</li>
          </ul>
        </section>
        <section v-if="v.languages.length" class="tx__section">
          <h2 class="tx__h tx__h--side" :style="{ color: v.accentDark }">{{ v.t.languages }}</h2>
          <p v-for="l in v.languages" :key="l.id" class="tx__item"><strong>{{ l.name }}</strong><span>{{ l.level }}</span></p>
        </section>
        <section v-if="v.certifications.length" class="tx__section">
          <h2 class="tx__h tx__h--side" :style="{ color: v.accentDark }">{{ v.t.certifications }}</h2>
          <p v-for="c in v.certifications" :key="c.id" class="tx__item cv-keep">
            <strong>{{ c.name }}</strong><span>{{ [c.issuer, c.date].filter(Boolean).join(' · ') }}</span>
          </p>
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
.tx { display: flex; flex-direction: column; min-height: inherit; }
.tx__head { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 40px 48px 34px; color: #fff; }
.tx__name { font-family: 'Playfair Display', Georgia, serif; font-size: 36px; font-weight: 600; line-height: 1.1; letter-spacing: 0.01em; }
.tx__title { margin-top: 6px; font-size: 14px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255, 255, 255, 0.78); }
.tx__contact { display: flex; flex-wrap: wrap; gap: 6px 18px; margin-top: 18px; font-size: 11.5px; color: rgba(255, 255, 255, 0.88); }
.tx__contact span { display: inline-flex; align-items: center; gap: 6px; }
.tx__photo { width: 108px; height: 108px; flex-shrink: 0; border-radius: 8px; background-size: cover; background-position: center; border: 3px solid rgba(255, 255, 255, 0.25); }
.tx__body { flex: 1; display: flex; }
.tx__main { flex: 1; min-width: 0; padding: 32px 36px 36px 48px; }
.tx__side { width: 220px; flex-shrink: 0; padding: 32px 28px; background: #f5f5f7; }
.tx__section { margin-bottom: 22px; }
.tx__h { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 600; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e3e3e8; }
.tx__h--side { font-size: 15px; }
.tx__entry { margin-bottom: 14px; }
.tx__row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.tx__role { font-size: 13.5px; font-weight: 650; color: #14161c; }
.tx__date { flex-shrink: 0; font-size: 11px; color: #6b7080; white-space: nowrap; }
.tx__org { font-size: 12px; font-weight: 550; margin-bottom: 4px; }
.tx__list { list-style: none; margin: 0; padding: 0; }
.tx__list li { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 12px; }
.tx__list i { width: 6px; height: 6px; flex-shrink: 0; }
.tx__item { margin-bottom: 8px; font-size: 12px; }
.tx__item strong { display: block; font-weight: 600; }
.tx__item span { display: block; font-size: 11px; color: #6b7080; }
</style>
