<template>
  <div class="ts">
    <header class="ts__head">
      <span class="ts__square" :style="{ background: v.accent }" />
      <div class="ts__head-main">
        <h1 class="ts__name" :class="{ 'is-placeholder': !v.p.fullName }">{{ v.p.fullName || 'Your Name' }}</h1>
        <p class="ts__title" :class="{ 'is-placeholder': !v.p.title }">{{ v.p.title || 'Professional title' }}</p>
      </div>
      <div v-if="v.p.photo" class="ts__photo" :style="{ backgroundImage: `url(${v.p.photo})` }" />
    </header>

    <div v-if="v.contact.length" class="ts__row">
      <h2 class="ts__label" :style="{ color: v.accent }">{{ v.t.contact }}</h2>
      <div class="ts__contact"><span v-for="c in v.contact" :key="c.icon">{{ c.text }}</span></div>
    </div>

    <div v-if="v.summary" class="ts__row">
      <h2 class="ts__label" :style="{ color: v.accent }">{{ v.t.profile }}</h2>
      <div class="ts__lead"><CvRichText :text="v.summary" :dot="v.accent" /></div>
    </div>

    <div v-if="v.experience.length" class="ts__row">
      <h2 class="ts__label" :style="{ color: v.accent }">{{ v.t.experience }}</h2>
      <div>
        <article v-for="e in v.experience" :key="e.id" class="ts__entry cv-keep">
          <p class="ts__date">{{ e.dates }}</p>
          <h4 class="ts__role">{{ e.role }}<span v-if="e.company"> — {{ e.company }}</span></h4>
          <p v-if="e.location" class="ts__loc">{{ e.location }}</p>
          <CvRichText :text="e.description" :dot="v.accent" />
        </article>
      </div>
    </div>

    <div v-if="v.education.length" class="ts__row">
      <h2 class="ts__label" :style="{ color: v.accent }">{{ v.t.education }}</h2>
      <div>
        <article v-for="e in v.education" :key="e.id" class="ts__entry cv-keep">
          <p class="ts__date">{{ e.dates }}</p>
          <h4 class="ts__role">{{ e.degree }}<span v-if="e.school"> — {{ e.school }}</span></h4>
          <CvRichText :text="e.description" :dot="v.accent" />
        </article>
      </div>
    </div>

    <div v-if="v.skills.length" class="ts__row cv-keep">
      <h2 class="ts__label" :style="{ color: v.accent }">{{ v.t.skills }}</h2>
      <div class="ts__cols3"><span v-for="s in v.skills" :key="s">{{ s }}</span></div>
    </div>

    <div v-if="v.languages.length" class="ts__row cv-keep">
      <h2 class="ts__label" :style="{ color: v.accent }">{{ v.t.languages }}</h2>
      <div class="ts__cols3"><span v-for="l in v.languages" :key="l.id"><strong>{{ l.name }}</strong> {{ l.level }}</span></div>
    </div>

    <div v-if="v.certifications.length" class="ts__row cv-keep">
      <h2 class="ts__label" :style="{ color: v.accent }">{{ v.t.certifications }}</h2>
      <div>
        <p v-for="c in v.certifications" :key="c.id" class="ts__cert"><strong>{{ c.name }}</strong> {{ [c.issuer, c.date].filter(Boolean).join(', ') }}</p>
      </div>
    </div>
    <i class="cv-end" />
  </div>
</template>

<script setup>
defineProps({ v: { type: Object, required: true } })
</script>

<style scoped>
.ts { padding: 50px 54px 40px; color: #111; }
.ts__head { display: flex; align-items: flex-start; gap: 18px; padding-bottom: 22px; margin-bottom: 18px; border-bottom: 3px solid #111; }
.ts__square { width: 22px; height: 22px; margin-top: 10px; flex-shrink: 0; }
.ts__head-main { flex: 1; }
.ts__name { font-size: 44px; font-weight: 800; letter-spacing: -0.035em; line-height: 1; }
.ts__title { margin-top: 8px; font-size: 16px; font-weight: 500; color: #555; }
.ts__photo { width: 88px; height: 88px; flex-shrink: 0; background-size: cover; background-position: center; }
.ts__row { display: grid; grid-template-columns: 130px 1fr; gap: 20px; padding: 12px 0; border-bottom: 1px solid #e4e4e4; }
.ts__label { font-size: 10.5px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; padding-top: 2px; }
.ts__contact { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 16px; font-size: 12px; }
.ts__lead { font-size: 13px; line-height: 1.55; }
.ts__entry { margin-bottom: 12px; }
.ts__entry:last-child { margin-bottom: 0; }
.ts__date { font-size: 10.5px; font-weight: 700; letter-spacing: 0.05em; color: #777; }
.ts__role { font-size: 14px; font-weight: 700; }
.ts__role span { font-weight: 400; }
.ts__loc { font-size: 11.5px; color: #777; }
.ts__cols3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 14px; font-size: 12px; }
.ts__cols3 strong { font-weight: 700; }
.ts__cert { margin-bottom: 3px; }
.ts__cert strong { font-weight: 700; }
</style>
