<template>
  <div class="tm">
    <aside class="tm__side" :style="{ background: v.accent }">
      <div v-if="v.p.photo" class="tm__photo" :style="{ backgroundImage: `url(${v.p.photo})` }" />

      <section v-if="v.contact.length" class="tm__block">
        <h3 class="tm__side-title">{{ v.t.contact }}</h3>
        <ul class="tm__contact">
          <li v-for="c in v.contact" :key="c.icon">
            <AppIcon :name="c.icon" :size="13" color="rgba(255,255,255,0.75)" :stroke="2" />
            <span>{{ c.text }}</span>
          </li>
        </ul>
      </section>

      <section v-if="v.skills.length" class="tm__block">
        <h3 class="tm__side-title">{{ v.t.skills }}</h3>
        <div class="tm__chips">
          <span v-for="s in v.skills" :key="s" class="tm__chip">{{ s }}</span>
        </div>
      </section>

      <section v-if="v.languages.length" class="tm__block">
        <h3 class="tm__side-title">{{ v.t.languages }}</h3>
        <ul class="tm__plain">
          <li v-for="l in v.languages" :key="l.id">
            <strong>{{ l.name }}</strong><span v-if="l.level"> · {{ l.level }}</span>
          </li>
        </ul>
      </section>

      <section v-if="v.certifications.length" class="tm__block">
        <h3 class="tm__side-title">{{ v.t.certifications }}</h3>
        <ul class="tm__plain">
          <li v-for="c in v.certifications" :key="c.id" class="cv-keep">
            <strong>{{ c.name }}</strong>
            <span v-if="c.issuer || c.date" class="tm__muted">{{ [c.issuer, c.date].filter(Boolean).join(' · ') }}</span>
          </li>
        </ul>
      </section>
      <i class="cv-end" />
    </aside>

    <main class="tm__main">
      <header class="tm__header">
        <h1 class="tm__name" :class="{ 'is-placeholder': !v.p.fullName }">{{ v.p.fullName || 'Your Name' }}</h1>
        <p class="tm__title" :style="{ color: v.accent }" :class="{ 'is-placeholder': !v.p.title }">
          {{ v.p.title || 'Professional title' }}
        </p>
      </header>

      <section v-if="v.summary" class="tm__section">
        <h2 class="tm__heading" :style="{ color: v.accent, borderColor: v.accentLine }">{{ v.t.profile }}</h2>
        <CvRichText :text="v.summary" :dot="v.accent" />
      </section>

      <section v-if="v.experience.length" class="tm__section">
        <h2 class="tm__heading" :style="{ color: v.accent, borderColor: v.accentLine }">{{ v.t.experience }}</h2>
        <article v-for="e in v.experience" :key="e.id" class="tm__entry cv-keep">
          <div class="tm__entry-head">
            <div>
              <h4 class="tm__role">{{ e.role }}</h4>
              <p class="tm__org">{{ [e.company, e.location].filter(Boolean).join(' · ') }}</p>
            </div>
            <span v-if="e.dates" class="tm__date" :style="{ background: v.accentSoft, color: v.accent }">{{ e.dates }}</span>
          </div>
          <CvRichText :text="e.description" :dot="v.accent" />
        </article>
      </section>

      <section v-if="v.education.length" class="tm__section">
        <h2 class="tm__heading" :style="{ color: v.accent, borderColor: v.accentLine }">{{ v.t.education }}</h2>
        <article v-for="e in v.education" :key="e.id" class="tm__entry cv-keep">
          <div class="tm__entry-head">
            <div>
              <h4 class="tm__role">{{ e.degree }}</h4>
              <p class="tm__org">{{ [e.school, e.location].filter(Boolean).join(' · ') }}</p>
            </div>
            <span v-if="e.dates" class="tm__date" :style="{ background: v.accentSoft, color: v.accent }">{{ e.dates }}</span>
          </div>
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
.tm {
  display: flex;
  min-height: inherit;
}
.tm__side {
  width: 250px;
  flex-shrink: 0;
  padding: 44px 26px;
  color: #fff;
}
.tm__photo {
  width: 132px;
  height: 132px;
  border-radius: 50%;
  margin: 0 auto 30px;
  background-size: cover;
  background-position: center;
  border: 4px solid rgba(255, 255, 255, 0.25);
}
.tm__block {
  margin-bottom: 26px;
}
.tm__side-title {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.7);
}
.tm__contact,
.tm__plain {
  list-style: none;
  margin: 0;
  padding: 0;
}
.tm__contact li {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-bottom: 8px;
  font-size: 11.5px;
  word-break: break-word;
}
.tm__contact li :deep(svg) {
  margin-top: 2px;
}
.tm__plain li {
  margin-bottom: 7px;
  font-size: 11.5px;
}
.tm__plain strong {
  font-weight: 600;
}
.tm__muted {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  font-size: 10.5px;
}
.tm__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tm__chip {
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.16);
}
.tm__main {
  flex: 1;
  min-width: 0;
  padding: 48px 42px 40px;
}
.tm__header {
  margin-bottom: 26px;
}
.tm__name {
  font-size: 34px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #11131a;
}
.tm__title {
  margin-top: 6px;
  font-size: 15px;
  font-weight: 500;
}
.tm__section {
  margin-bottom: 22px;
}
.tm__heading {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding-bottom: 6px;
  margin-bottom: 12px;
  border-bottom: 1.5px solid;
}
.tm__entry {
  margin-bottom: 14px;
}
.tm__entry-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 4px;
}
.tm__role {
  font-size: 13.5px;
  font-weight: 650;
  color: #11131a;
}
.tm__org {
  color: #5b6170;
  font-size: 12px;
}
.tm__date {
  flex-shrink: 0;
  font-size: 10.5px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
  white-space: nowrap;
}
</style>
