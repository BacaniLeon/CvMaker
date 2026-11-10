<template>
  <div class="tn">
    <header class="tn__header">
      <div>
        <h1 class="tn__name" :class="{ 'is-placeholder': !v.p.fullName }">{{ v.p.fullName || 'Your Name' }}</h1>
        <p class="tn__title" :class="{ 'is-placeholder': !v.p.title }">{{ v.p.title || 'Professional title' }}</p>
        <span class="tn__bar" :style="{ background: v.accent }" />
      </div>
      <div v-if="v.p.photo" class="tn__photo" :style="{ backgroundImage: `url(${v.p.photo})` }" />
    </header>

    <div class="tn__cols">
      <main class="tn__main">
        <section v-if="v.summary" class="tn__section">
          <h2 class="tn__heading" :style="{ color: v.accent }">{{ v.t.profile }}</h2>
          <CvRichText :text="v.summary" :dot="v.accent" />
        </section>

        <section v-if="v.experience.length" class="tn__section">
          <h2 class="tn__heading" :style="{ color: v.accent }">{{ v.t.experience }}</h2>
          <article v-for="e in v.experience" :key="e.id" class="tn__entry cv-keep">
            <p class="tn__date">{{ e.dates }}<span v-if="e.location"> · {{ e.location }}</span></p>
            <h4 class="tn__role">{{ e.role }}</h4>
            <p class="tn__org">{{ e.company }}</p>
            <CvRichText :text="e.description" :dot="v.accent" />
          </article>
        </section>

        <section v-if="v.education.length" class="tn__section">
          <h2 class="tn__heading" :style="{ color: v.accent }">{{ v.t.education }}</h2>
          <article v-for="e in v.education" :key="e.id" class="tn__entry cv-keep">
            <p class="tn__date">{{ e.dates }}<span v-if="e.location"> · {{ e.location }}</span></p>
            <h4 class="tn__role">{{ e.degree }}</h4>
            <p class="tn__org">{{ e.school }}</p>
            <CvRichText :text="e.description" :dot="v.accent" />
          </article>
        </section>
        <i class="cv-end" />
      </main>

      <aside class="tn__side">
        <section v-if="v.contact.length" class="tn__section">
          <h2 class="tn__heading" :style="{ color: v.accent }">{{ v.t.contact }}</h2>
          <p v-for="c in v.contact" :key="c.icon" class="tn__contact">
            <AppIcon :name="c.icon" :size="12" :color="v.accent" :stroke="2" />
            <span>{{ c.text }}</span>
          </p>
        </section>

        <section v-if="v.skills.length" class="tn__section">
          <h2 class="tn__heading" :style="{ color: v.accent }">{{ v.t.skills }}</h2>
          <div class="tn__chips">
            <span v-for="s in v.skills" :key="s" class="tn__chip" :style="{ borderColor: v.accentLine }">{{ s }}</span>
          </div>
        </section>

        <section v-if="v.languages.length" class="tn__section">
          <h2 class="tn__heading" :style="{ color: v.accent }">{{ v.t.languages }}</h2>
          <p v-for="l in v.languages" :key="l.id" class="tn__item">
            <strong>{{ l.name }}</strong><span v-if="l.level" class="tn__muted">{{ l.level }}</span>
          </p>
        </section>

        <section v-if="v.certifications.length" class="tn__section">
          <h2 class="tn__heading" :style="{ color: v.accent }">{{ v.t.certifications }}</h2>
          <p v-for="c in v.certifications" :key="c.id" class="tn__item cv-keep">
            <strong>{{ c.name }}</strong>
            <span v-if="c.issuer || c.date" class="tn__muted">{{ [c.issuer, c.date].filter(Boolean).join(' · ') }}</span>
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
.tn {
  padding: 56px 54px 44px;
}
.tn__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 34px;
}
.tn__name {
  font-size: 38px;
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: #11131a;
}
.tn__title {
  margin-top: 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #4b5160;
}
.tn__bar {
  display: block;
  width: 44px;
  height: 3px;
  margin-top: 16px;
  border-radius: 2px;
}
.tn__photo {
  width: 104px;
  height: 104px;
  flex-shrink: 0;
  border-radius: 14px;
  background-size: cover;
  background-position: center;
}
.tn__cols {
  display: flex;
  gap: 40px;
}
.tn__main {
  flex: 1;
  min-width: 0;
}
.tn__side {
  width: 200px;
  flex-shrink: 0;
}
.tn__section {
  margin-bottom: 24px;
}
.tn__heading {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.tn__entry {
  margin-bottom: 16px;
  padding-left: 14px;
  border-left: 1.5px solid #e6e7eb;
}
.tn__date {
  font-size: 10.5px;
  font-weight: 600;
  color: #8a8f9c;
  letter-spacing: 0.03em;
  margin-bottom: 2px;
}
.tn__role {
  font-size: 14px;
  font-weight: 650;
  color: #11131a;
}
.tn__org {
  color: #4b5160;
  margin-bottom: 4px;
}
.tn__contact {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 7px;
  font-size: 11.5px;
  word-break: break-word;
}
.tn__contact :deep(svg) {
  margin-top: 3px;
}
.tn__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.tn__chip {
  font-size: 11px;
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 6px;
}
.tn__item {
  margin-bottom: 7px;
  font-size: 12px;
}
.tn__item strong {
  display: block;
  font-weight: 600;
}
.tn__muted {
  display: block;
  font-size: 11px;
  color: #6b7180;
}
</style>
