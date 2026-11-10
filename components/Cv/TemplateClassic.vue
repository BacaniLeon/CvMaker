<template>
  <div class="tc">
    <header class="tc__header">
      <div v-if="v.p.photo" class="tc__photo" :style="{ backgroundImage: `url(${v.p.photo})` }" />
      <h1 class="tc__name" :class="{ 'is-placeholder': !v.p.fullName }">{{ v.p.fullName || 'Your Name' }}</h1>
      <p class="tc__title" :style="{ color: v.accent }" :class="{ 'is-placeholder': !v.p.title }">
        {{ v.p.title || 'Professional title' }}
      </p>
      <p v-if="v.contact.length" class="tc__contact">
        <template v-for="(c, i) in v.contact" :key="c.icon">
          <span v-if="i" class="tc__sep" :style="{ background: v.accent }" />
          <span>{{ c.text }}</span>
        </template>
      </p>
    </header>

    <section v-if="v.summary" class="tc__section">
      <h2 class="tc__heading"><span :style="{ color: v.accent }">{{ v.t.profile }}</span><i :style="{ background: v.accentLine }" /></h2>
      <CvRichText :text="v.summary" :dot="v.accent" />
    </section>

    <section v-if="v.experience.length" class="tc__section">
      <h2 class="tc__heading"><span :style="{ color: v.accent }">{{ v.t.experience }}</span><i :style="{ background: v.accentLine }" /></h2>
      <article v-for="e in v.experience" :key="e.id" class="tc__entry cv-keep">
        <div class="tc__row">
          <h4 class="tc__role">{{ e.role }}<span v-if="e.company" class="tc__org">, {{ e.company }}</span></h4>
          <span class="tc__date">{{ e.dates }}</span>
        </div>
        <p v-if="e.location" class="tc__loc">{{ e.location }}</p>
        <CvRichText :text="e.description" :dot="v.accent" />
      </article>
    </section>

    <section v-if="v.education.length" class="tc__section">
      <h2 class="tc__heading"><span :style="{ color: v.accent }">{{ v.t.education }}</span><i :style="{ background: v.accentLine }" /></h2>
      <article v-for="e in v.education" :key="e.id" class="tc__entry cv-keep">
        <div class="tc__row">
          <h4 class="tc__role">{{ e.degree }}<span v-if="e.school" class="tc__org">, {{ e.school }}</span></h4>
          <span class="tc__date">{{ e.dates }}</span>
        </div>
        <p v-if="e.location" class="tc__loc">{{ e.location }}</p>
        <CvRichText :text="e.description" :dot="v.accent" />
      </article>
    </section>

    <div class="tc__grid">
      <section v-if="v.skills.length" class="tc__section cv-keep">
        <h2 class="tc__heading"><span :style="{ color: v.accent }">{{ v.t.skills }}</span><i :style="{ background: v.accentLine }" /></h2>
        <p class="tc__inline">{{ v.skills.join('  ·  ') }}</p>
      </section>
      <section v-if="v.languages.length" class="tc__section cv-keep">
        <h2 class="tc__heading"><span :style="{ color: v.accent }">{{ v.t.languages }}</span><i :style="{ background: v.accentLine }" /></h2>
        <p v-for="l in v.languages" :key="l.id" class="tc__lang">
          <strong>{{ l.name }}</strong><span v-if="l.level"> — {{ l.level }}</span>
        </p>
      </section>
    </div>

    <section v-if="v.certifications.length" class="tc__section">
      <h2 class="tc__heading"><span :style="{ color: v.accent }">{{ v.t.certifications }}</span><i :style="{ background: v.accentLine }" /></h2>
      <div v-for="c in v.certifications" :key="c.id" class="tc__row tc__cert cv-keep">
        <span><strong>{{ c.name }}</strong><span v-if="c.issuer" class="tc__org">, {{ c.issuer }}</span></span>
        <span class="tc__date">{{ c.date }}</span>
      </div>
    </section>
    <i class="cv-end" />
  </div>
</template>

<script setup>
defineProps({ v: { type: Object, required: true } })
</script>

<style scoped>
.tc {
  padding: 52px 64px 44px;
}
.tc__header {
  text-align: center;
  margin-bottom: 28px;
}
.tc__photo {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  margin: 0 auto 16px;
  background-size: cover;
  background-position: center;
}
.tc__name {
  font-size: 32px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: #11131a;
  line-height: 1.15;
}
.tc__title {
  margin-top: 4px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.04em;
}
.tc__contact {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 4px 10px;
  font-size: 11.5px;
  color: #4b5160;
}
.tc__sep {
  width: 4px;
  height: 4px;
  border-radius: 50%;
}
.tc__section {
  margin-bottom: 20px;
}
.tc__heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.tc__heading i {
  flex: 1;
  height: 1px;
}
.tc__entry {
  margin-bottom: 13px;
}
.tc__row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
}
.tc__role {
  font-size: 13.5px;
  font-weight: 650;
  color: #11131a;
}
.tc__org {
  font-weight: 400;
  color: #4b5160;
}
.tc__date {
  flex-shrink: 0;
  font-size: 11.5px;
  color: #6b7180;
  font-style: italic;
  white-space: nowrap;
}
.tc__loc {
  font-size: 11.5px;
  color: #6b7180;
  margin-bottom: 3px;
}
.tc__grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 0 36px;
}
.tc__inline {
  line-height: 1.75;
}
.tc__lang {
  margin-bottom: 3px;
}
.tc__lang strong,
.tc__cert strong {
  font-weight: 600;
}
.tc__cert {
  margin-bottom: 5px;
}
</style>
