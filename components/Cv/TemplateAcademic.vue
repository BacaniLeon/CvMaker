<template>
  <div class="tc2">
    <header class="tc2__head">
      <div>
        <h1 class="tc2__name" :class="{ 'is-placeholder': !v.p.fullName }">{{ v.p.fullName || 'Your Name' }}</h1>
        <p class="tc2__title" :style="{ color: v.accent }" :class="{ 'is-placeholder': !v.p.title }">{{ v.p.title || 'Professional title' }}</p>
      </div>
      <div class="tc2__right">
        <div v-if="v.p.photo" class="tc2__photo" :style="{ backgroundImage: `url(${v.p.photo})` }" />
        <ul v-if="v.contact.length" class="tc2__contact">
          <li v-for="c in v.contact" :key="c.icon">{{ c.text }}</li>
        </ul>
      </div>
    </header>

    <section v-if="v.summary" class="tc2__section">
      <div class="tc2__hrow"><span /><h2 class="tc2__h" :style="{ color: v.accent }">{{ v.t.profile }}</h2></div>
      <div class="tc2__grid"><span /><CvRichText :text="v.summary" :dot="v.accent" /></div>
    </section>

    <section v-if="v.experience.length" class="tc2__section">
      <div class="tc2__hrow"><span /><h2 class="tc2__h" :style="{ color: v.accent }">{{ v.t.experience }}</h2></div>
      <article v-for="e in v.experience" :key="e.id" class="tc2__grid tc2__entry cv-keep">
        <span class="tc2__date">{{ e.dates }}</span>
        <div>
          <h4 class="tc2__role">{{ e.role }}<em v-if="e.company">, {{ e.company }}</em></h4>
          <p v-if="e.location" class="tc2__loc">{{ e.location }}</p>
          <CvRichText :text="e.description" :dot="v.accent" />
        </div>
      </article>
    </section>

    <section v-if="v.education.length" class="tc2__section">
      <div class="tc2__hrow"><span /><h2 class="tc2__h" :style="{ color: v.accent }">{{ v.t.education }}</h2></div>
      <article v-for="e in v.education" :key="e.id" class="tc2__grid tc2__entry cv-keep">
        <span class="tc2__date">{{ e.dates }}</span>
        <div>
          <h4 class="tc2__role">{{ e.degree }}<em v-if="e.school">, {{ e.school }}</em></h4>
          <p v-if="e.location" class="tc2__loc">{{ e.location }}</p>
          <CvRichText :text="e.description" :dot="v.accent" />
        </div>
      </article>
    </section>

    <section v-if="v.certifications.length" class="tc2__section">
      <div class="tc2__hrow"><span /><h2 class="tc2__h" :style="{ color: v.accent }">{{ v.t.certifications }}</h2></div>
      <div v-for="c in v.certifications" :key="c.id" class="tc2__grid tc2__entry cv-keep">
        <span class="tc2__date">{{ c.date }}</span>
        <p><strong>{{ c.name }}</strong><em v-if="c.issuer">, {{ c.issuer }}</em></p>
      </div>
    </section>

    <section v-if="v.skills.length || v.languages.length" class="tc2__section cv-keep">
      <div class="tc2__hrow"><span /><h2 class="tc2__h" :style="{ color: v.accent }">{{ v.t.skills }}</h2></div>
      <div v-if="v.skills.length" class="tc2__grid tc2__entry">
        <span class="tc2__date">{{ v.t.skills }}</span>
        <p>{{ v.skills.join(', ') }}</p>
      </div>
      <div v-if="v.languages.length" class="tc2__grid tc2__entry">
        <span class="tc2__date">{{ v.t.languages }}</span>
        <p>{{ v.languages.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join(', ') }}</p>
      </div>
    </section>
    <i class="cv-end" />
  </div>
</template>

<script setup>
defineProps({ v: { type: Object, required: true } })
</script>

<style scoped>
.tc2 { padding: 52px 58px 42px; }
.tc2__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 26px; }
.tc2__name { font-family: 'Lora', Georgia, serif; font-size: 34px; font-weight: 500; color: #15161c; line-height: 1.1; }
.tc2__title { margin-top: 6px; font-family: 'Lora', Georgia, serif; font-size: 15px; font-style: italic; }
.tc2__right { display: flex; align-items: flex-start; gap: 16px; }
.tc2__photo { width: 78px; height: 96px; flex-shrink: 0; background-size: cover; background-position: center; }
.tc2__contact { list-style: none; margin: 0; padding: 0; text-align: right; font-size: 11.5px; color: #4b5060; line-height: 1.7; }
.tc2__section { margin-bottom: 16px; }
.tc2__hrow { display: grid; grid-template-columns: 112px 1fr; gap: 18px; margin-bottom: 8px; }
.tc2__hrow span { height: 6px; margin-top: 8px; background: #e7e8ec; }
.tc2__h { font-family: 'Lora', Georgia, serif; font-size: 17px; font-weight: 500; padding-bottom: 3px; border-bottom: 1px solid #d9dbe1; }
.tc2__grid { display: grid; grid-template-columns: 112px 1fr; gap: 18px; }
.tc2__entry { margin-bottom: 10px; }
.tc2__date { text-align: right; font-size: 11px; color: #6b7080; padding-top: 2px; }
.tc2__role { font-size: 13.5px; font-weight: 650; color: #15161c; }
.tc2__role em, .tc2__entry em { font-weight: 400; font-style: italic; color: #4b5060; }
.tc2__entry strong { font-weight: 600; }
.tc2__loc { font-size: 11.5px; color: #6b7080; margin-bottom: 2px; }
</style>
