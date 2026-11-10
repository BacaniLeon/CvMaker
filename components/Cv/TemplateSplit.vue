<template>
  <div class="tp">
    <header class="tp__head">
      <div class="tp__left" :style="{ background: v.accent }">
        <div v-if="v.p.photo" class="tp__photo" :style="{ backgroundImage: `url(${v.p.photo})` }" />
        <div>
          <h1 class="tp__name" :class="{ 'is-placeholder': !v.p.fullName }">{{ v.p.fullName || 'Your Name' }}</h1>
          <p class="tp__title" :class="{ 'is-placeholder': !v.p.title }">{{ v.p.title || 'Professional title' }}</p>
        </div>
      </div>
      <div class="tp__right" :style="{ background: v.accentTint }">
        <p v-for="c in v.contact" :key="c.icon" class="tp__contact">
          <AppIcon :name="c.icon" :size="13" :color="v.accent" :stroke="2.1" /><span>{{ c.text }}</span>
        </p>
      </div>
    </header>

    <div class="tp__cols">
      <div class="tp__col">
        <section v-if="v.summary" class="tp__section">
          <h2 class="tp__h"><b :style="{ color: v.accent }">{{ num('summary') }}</b>{{ v.t.profile }}</h2>
          <CvRichText :text="v.summary" :dot="v.accent" />
        </section>
        <section v-if="v.experience.length" class="tp__section">
          <h2 class="tp__h"><b :style="{ color: v.accent }">{{ num('experience') }}</b>{{ v.t.experience }}</h2>
          <article v-for="e in v.experience" :key="e.id" class="tp__entry cv-keep">
            <p class="tp__date" :style="{ color: v.accent }">{{ e.dates }}</p>
            <h4 class="tp__role">{{ e.role }}</h4>
            <p class="tp__org">{{ [e.company, e.location].filter(Boolean).join(' · ') }}</p>
            <CvRichText :text="e.description" :dot="v.accent" />
          </article>
        </section>
        <i class="cv-end" />
      </div>
      <div class="tp__col">
        <section v-if="v.education.length" class="tp__section">
          <h2 class="tp__h"><b :style="{ color: v.accent }">{{ num('education') }}</b>{{ v.t.education }}</h2>
          <article v-for="e in v.education" :key="e.id" class="tp__entry cv-keep">
            <p class="tp__date" :style="{ color: v.accent }">{{ e.dates }}</p>
            <h4 class="tp__role">{{ e.degree }}</h4>
            <p class="tp__org">{{ [e.school, e.location].filter(Boolean).join(' · ') }}</p>
            <CvRichText :text="e.description" :dot="v.accent" />
          </article>
        </section>
        <section v-if="v.skills.length" class="tp__section">
          <h2 class="tp__h"><b :style="{ color: v.accent }">{{ num('skills') }}</b>{{ v.t.skills }}</h2>
          <div class="tp__chips"><span v-for="s in v.skills" :key="s" :style="{ borderColor: v.accentLine }">{{ s }}</span></div>
        </section>
        <section v-if="v.languages.length" class="tp__section">
          <h2 class="tp__h"><b :style="{ color: v.accent }">{{ num('languages') }}</b>{{ v.t.languages }}</h2>
          <p v-for="l in v.languages" :key="l.id" class="tp__kv"><strong>{{ l.name }}</strong><span>{{ l.level }}</span></p>
        </section>
        <section v-if="v.certifications.length" class="tp__section">
          <h2 class="tp__h"><b :style="{ color: v.accent }">{{ num('certifications') }}</b>{{ v.t.certifications }}</h2>
          <p v-for="c in v.certifications" :key="c.id" class="tp__cert cv-keep"><strong>{{ c.name }}</strong> {{ [c.issuer, c.date].filter(Boolean).join(' · ') }}</p>
        </section>
        <i class="cv-end" />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ v: { type: Object, required: true } })
// Number only the sections that are actually shown: 01, 02, …
const shown = computed(() =>
  [
    ['summary', props.v.summary],
    ['experience', props.v.experience.length],
    ['education', props.v.education.length],
    ['skills', props.v.skills.length],
    ['languages', props.v.languages.length],
    ['certifications', props.v.certifications.length]
  ].filter(([, has]) => has).map(([k]) => k)
)
const num = (key) => String(shown.value.indexOf(key) + 1).padStart(2, '0')
</script>

<style scoped>
.tp__head { display: flex; min-height: 170px; }
.tp__left { flex: 1.25; display: flex; align-items: center; gap: 20px; padding: 36px 34px 36px 46px; color: #fff; }
.tp__photo { width: 96px; height: 96px; flex-shrink: 0; border-radius: 50%; border: 4px solid rgba(255, 255, 255, 0.3); background-size: cover; background-position: center; }
.tp__name { font-size: 32px; font-weight: 800; line-height: 1.05; letter-spacing: -0.02em; }
.tp__title { margin-top: 6px; font-size: 14px; color: rgba(255, 255, 255, 0.85); }
.tp__right { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 26px 34px; }
.tp__contact { display: flex; align-items: center; gap: 9px; font-size: 11.5px; margin-bottom: 7px; word-break: break-word; }
.tp__cols { display: grid; grid-template-columns: 1fr 1fr; gap: 34px; padding: 30px 46px 36px; }
.tp__col { min-width: 0; }
.tp__section { margin-bottom: 22px; }
.tp__h { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; padding-bottom: 7px; border-bottom: 1px solid #e6e7eb; font-size: 15px; font-weight: 700; color: #13151b; }
.tp__h b { font-size: 12px; font-weight: 800; }
.tp__entry { margin-bottom: 14px; }
.tp__date { font-size: 10.5px; font-weight: 700; letter-spacing: 0.04em; }
.tp__role { font-size: 13.5px; font-weight: 700; color: #13151b; }
.tp__org { font-size: 12px; color: #5b6070; margin-bottom: 3px; }
.tp__chips { display: flex; flex-wrap: wrap; gap: 5px; }
.tp__chips span { font-size: 11px; padding: 3px 9px; border: 1px solid; border-radius: 4px; }
.tp__kv { display: flex; justify-content: space-between; gap: 10px; font-size: 12px; margin-bottom: 5px; }
.tp__kv strong { font-weight: 600; }
.tp__kv span { color: #6b7080; }
.tp__cert { font-size: 12px; margin-bottom: 6px; color: #5b6070; }
.tp__cert strong { font-weight: 600; color: #13151b; }
</style>
