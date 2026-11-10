<template>
  <div class="tb">
    <header class="tb__head">
      <div>
        <h1 class="tb__name" :class="{ 'is-placeholder': !v.p.fullName }">{{ v.p.fullName || 'Your Name' }}</h1>
        <span class="tb__underline" :style="{ background: v.accent }" />
        <p class="tb__title" :class="{ 'is-placeholder': !v.p.title }">{{ v.p.title || 'Professional title' }}</p>
      </div>
      <div v-if="v.p.photo" class="tb__photo" :style="{ backgroundImage: `url(${v.p.photo})`, borderColor: v.accent }" />
    </header>

    <div class="tb__cols">
      <main class="tb__main">
        <section v-if="v.summary" class="tb__section">
          <h2 class="tb__h" :style="{ background: v.accent }">{{ v.t.profile }}</h2>
          <CvRichText :text="v.summary" :dot="v.accent" />
        </section>
        <section v-if="v.experience.length" class="tb__section">
          <h2 class="tb__h" :style="{ background: v.accent }">{{ v.t.experience }}</h2>
          <article v-for="e in v.experience" :key="e.id" class="tb__entry cv-keep">
            <h4 class="tb__role">{{ e.role }}</h4>
            <p class="tb__meta"><strong :style="{ color: v.accent }">{{ e.company }}</strong><span v-if="e.dates">{{ e.dates }}</span><span v-if="e.location">{{ e.location }}</span></p>
            <CvRichText :text="e.description" :dot="v.accent" />
          </article>
        </section>
        <section v-if="v.education.length" class="tb__section">
          <h2 class="tb__h" :style="{ background: v.accent }">{{ v.t.education }}</h2>
          <article v-for="e in v.education" :key="e.id" class="tb__entry cv-keep">
            <h4 class="tb__role">{{ e.degree }}</h4>
            <p class="tb__meta"><strong :style="{ color: v.accent }">{{ e.school }}</strong><span v-if="e.dates">{{ e.dates }}</span></p>
            <CvRichText :text="e.description" :dot="v.accent" />
          </article>
        </section>
        <i class="cv-end" />
      </main>

      <aside class="tb__side">
        <section v-if="v.contact.length" class="tb__section">
          <h2 class="tb__h tb__h--dark">{{ v.t.contact }}</h2>
          <p v-for="c in v.contact" :key="c.icon" class="tb__contact">
            <AppIcon :name="c.icon" :size="13" :color="v.accent" :stroke="2.2" /><span>{{ c.text }}</span>
          </p>
        </section>
        <section v-if="v.skills.length" class="tb__section">
          <h2 class="tb__h tb__h--dark">{{ v.t.skills }}</h2>
          <div class="tb__chips"><span v-for="s in v.skills" :key="s" :style="{ background: v.accentSoft, color: v.accentDark }">{{ s }}</span></div>
        </section>
        <section v-if="v.languages.length" class="tb__section">
          <h2 class="tb__h tb__h--dark">{{ v.t.languages }}</h2>
          <p v-for="l in v.languages" :key="l.id" class="tb__item"><strong>{{ l.name }}</strong><span>{{ l.level }}</span></p>
        </section>
        <section v-if="v.certifications.length" class="tb__section">
          <h2 class="tb__h tb__h--dark">{{ v.t.certifications }}</h2>
          <p v-for="c in v.certifications" :key="c.id" class="tb__item cv-keep"><strong>{{ c.name }}</strong><span>{{ [c.issuer, c.date].filter(Boolean).join(' · ') }}</span></p>
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
.tb { padding: 46px 46px 40px; }
.tb__head { display: flex; justify-content: space-between; align-items: center; gap: 24px; margin-bottom: 30px; }
.tb__name { font-size: 48px; font-weight: 900; line-height: 0.95; letter-spacing: -0.03em; text-transform: uppercase; color: #101114; }
.tb__underline { display: block; width: 90px; height: 8px; margin: 14px 0 12px; }
.tb__title { font-size: 18px; font-weight: 600; color: #3a3e4a; }
.tb__photo { width: 112px; height: 112px; flex-shrink: 0; border-radius: 50%; border: 5px solid; background-size: cover; background-position: center; }
.tb__cols { display: flex; gap: 34px; }
.tb__main { flex: 1; min-width: 0; }
.tb__side { width: 210px; flex-shrink: 0; }
.tb__section { margin-bottom: 22px; }
.tb__h { display: inline-block; padding: 4px 12px; margin-bottom: 12px; border-radius: 4px; color: #fff; font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
.tb__h--dark { background: #101114; }
.tb__entry { margin-bottom: 15px; }
.tb__role { font-size: 15px; font-weight: 800; color: #101114; }
.tb__meta { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 11.5px; color: #6b7080; margin: 1px 0 4px; }
.tb__meta strong { font-weight: 700; }
.tb__contact { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 7px; font-size: 11.5px; word-break: break-word; }
.tb__contact :deep(svg) { margin-top: 2px; }
.tb__chips { display: flex; flex-wrap: wrap; gap: 6px; }
.tb__chips span { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; }
.tb__item { margin-bottom: 8px; font-size: 12px; }
.tb__item strong { display: block; font-weight: 700; }
.tb__item span { display: block; font-size: 11px; color: #6b7080; }
</style>
