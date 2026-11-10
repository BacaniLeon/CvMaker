<template>
  <div class="tl">
    <div class="tl__bar" :style="{ background: v.accent }" />
    <header class="tl__head">
      <div class="tl__id">
        <div v-if="v.p.photo" class="tl__photo" :style="{ backgroundImage: `url(${v.p.photo})` }" />
        <div>
          <h1 class="tl__name" :class="{ 'is-placeholder': !v.p.fullName }">{{ v.p.fullName || 'Your Name' }}</h1>
          <p class="tl__title" :style="{ color: v.accent }" :class="{ 'is-placeholder': !v.p.title }">{{ v.p.title || 'Professional title' }}</p>
        </div>
      </div>
      <ul v-if="v.contact.length" class="tl__contact">
        <li v-for="c in v.contact" :key="c.icon">{{ c.text }}<AppIcon :name="c.icon" :size="12" :color="v.accent" :stroke="2" /></li>
      </ul>
    </header>

    <section v-if="v.summary" class="tl__summary">
      <CvRichText :text="v.summary" :dot="v.accent" />
    </section>

    <section v-for="block in blocks" :key="block.key" class="tl__section">
      <h2 class="tl__h"><span :style="{ background: v.accent }" />{{ block.title }}</h2>
      <article v-for="e in block.items" :key="e.id" class="tl__item cv-keep">
        <div class="tl__when">{{ e.dates }}</div>
        <div class="tl__rail"><i :style="{ borderColor: v.accent }" /></div>
        <div class="tl__what">
          <h4 class="tl__role">{{ e.primary }}</h4>
          <p class="tl__org">{{ [e.secondary, e.location].filter(Boolean).join(' · ') }}</p>
          <CvRichText :text="e.description" :dot="v.accent" />
        </div>
      </article>
    </section>

    <div class="tl__grid">
      <section v-if="v.skills.length" class="cv-keep">
        <h2 class="tl__h"><span :style="{ background: v.accent }" />{{ v.t.skills }}</h2>
        <div class="tl__chips"><span v-for="s in v.skills" :key="s" :style="{ background: v.accentSoft, color: v.accentDark }">{{ s }}</span></div>
      </section>
      <section v-if="v.languages.length" class="cv-keep">
        <h2 class="tl__h"><span :style="{ background: v.accent }" />{{ v.t.languages }}</h2>
        <p v-for="l in v.languages" :key="l.id" class="tl__small"><strong>{{ l.name }}</strong> {{ l.level }}</p>
      </section>
      <section v-if="v.certifications.length" class="cv-keep">
        <h2 class="tl__h"><span :style="{ background: v.accent }" />{{ v.t.certifications }}</h2>
        <p v-for="c in v.certifications" :key="c.id" class="tl__small"><strong>{{ c.name }}</strong> {{ [c.issuer, c.date].filter(Boolean).join(', ') }}</p>
      </section>
    </div>
    <i class="cv-end" />
  </div>
</template>

<script setup>
const props = defineProps({ v: { type: Object, required: true } })
const blocks = computed(() =>
  [
    { key: 'exp', title: props.v.t.experience, items: props.v.experience.map((e) => ({ ...e, primary: e.role, secondary: e.company })) },
    { key: 'edu', title: props.v.t.education, items: props.v.education.map((e) => ({ ...e, primary: e.degree, secondary: e.school })) }
  ].filter((b) => b.items.length)
)
</script>

<style scoped>
.tl { padding: 0 50px 40px; }
.tl__bar { height: 8px; margin: 0 -50px 36px; }
.tl__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 22px; }
.tl__id { display: flex; align-items: center; gap: 18px; }
.tl__photo { width: 84px; height: 84px; border-radius: 50%; background-size: cover; background-position: center; flex-shrink: 0; }
.tl__name { font-size: 32px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; color: #12141a; }
.tl__title { margin-top: 4px; font-size: 15px; font-weight: 550; }
.tl__contact { list-style: none; margin: 0; padding: 0; text-align: right; font-size: 11.5px; color: #4b5060; }
.tl__contact li { display: flex; align-items: center; justify-content: flex-end; gap: 7px; margin-bottom: 4px; }
.tl__summary { margin-bottom: 22px; padding: 14px 16px; border-radius: 8px; background: #f6f7f9; }
.tl__section { margin-bottom: 18px; }
.tl__h { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px; color: #12141a; }
.tl__h span { width: 18px; height: 3px; border-radius: 2px; }
.tl__item { display: flex; }
.tl__when { width: 108px; flex-shrink: 0; padding-top: 1px; text-align: right; font-size: 11px; font-weight: 600; color: #6b7080; }
.tl__rail { position: relative; width: 34px; flex-shrink: 0; }
.tl__rail::before { content: ''; position: absolute; left: 16px; top: 0; bottom: 0; width: 2px; background: #e5e7eb; }
.tl__rail i { position: absolute; left: 11px; top: 3px; width: 12px; height: 12px; border-radius: 50%; border: 3px solid; background: #fff; }
.tl__what { flex: 1; min-width: 0; padding-bottom: 14px; }
.tl__role { font-size: 13.5px; font-weight: 650; color: #12141a; }
.tl__org { font-size: 12px; color: #5b6070; margin-bottom: 3px; }
.tl__grid { display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 24px; margin-top: 6px; }
.tl__chips { display: flex; flex-wrap: wrap; gap: 5px; }
.tl__chips span { font-size: 11px; font-weight: 550; padding: 3px 9px; border-radius: 12px; }
.tl__small { font-size: 12px; margin-bottom: 5px; }
.tl__small strong { font-weight: 600; }
</style>
