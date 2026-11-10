<template>
  <div class="td">
    <header class="td__head">
      <div class="td__head-main">
        <p class="td__prompt"><span :style="{ color: v.accentLight }">~/cv</span> $ whoami</p>
        <h1 class="td__name" :class="{ 'is-placeholder': !v.p.fullName }">
          {{ v.p.fullName || 'Your Name' }}<span class="td__caret" :style="{ background: v.accentLight }" />
        </h1>
        <p class="td__title" :class="{ 'is-placeholder': !v.p.title }">// {{ v.p.title || 'Professional title' }}</p>
      </div>
      <div v-if="v.p.photo" class="td__photo" :style="{ backgroundImage: `url(${v.p.photo})` }" />
    </header>

    <div v-if="v.contact.length" class="td__contact">
      <span v-for="c in v.contact" :key="c.icon"><em :style="{ color: v.accent }">{{ keys[c.icon] }}:</em> "{{ c.text }}"</span>
    </div>

    <div class="td__body">
      <section v-if="v.summary" class="td__section">
        <h2 class="td__h"><span :style="{ color: v.accent }">#</span> {{ v.t.profile.toLowerCase() }}</h2>
        <CvRichText :text="v.summary" :dot="v.accent" />
      </section>

      <section v-if="v.experience.length" class="td__section">
        <h2 class="td__h"><span :style="{ color: v.accent }">#</span> {{ v.t.experience.toLowerCase() }}</h2>
        <article v-for="e in v.experience" :key="e.id" class="td__entry cv-keep">
          <div class="td__row">
            <h4 class="td__role">{{ e.role }} <span v-if="e.company" :style="{ color: v.accent }">@ {{ e.company }}</span></h4>
            <span class="td__date">{{ e.dates }}</span>
          </div>
          <p v-if="e.location" class="td__loc">{{ e.location }}</p>
          <CvRichText :text="e.description" :dot="v.accent" />
        </article>
      </section>

      <section v-if="v.skills.length" class="td__section cv-keep">
        <h2 class="td__h"><span :style="{ color: v.accent }">#</span> {{ v.t.skills.toLowerCase() }}</h2>
        <div class="td__tags"><code v-for="s in v.skills" :key="s" :style="{ borderColor: v.accentLine, color: v.accentDark, background: v.accentTint }">{{ s }}</code></div>
      </section>

      <section v-if="v.education.length" class="td__section">
        <h2 class="td__h"><span :style="{ color: v.accent }">#</span> {{ v.t.education.toLowerCase() }}</h2>
        <article v-for="e in v.education" :key="e.id" class="td__entry cv-keep">
          <div class="td__row">
            <h4 class="td__role">{{ e.degree }} <span v-if="e.school" :style="{ color: v.accent }">@ {{ e.school }}</span></h4>
            <span class="td__date">{{ e.dates }}</span>
          </div>
          <CvRichText :text="e.description" :dot="v.accent" />
        </article>
      </section>

      <div class="td__grid">
        <section v-if="v.languages.length" class="td__section cv-keep">
          <h2 class="td__h"><span :style="{ color: v.accent }">#</span> {{ v.t.languages.toLowerCase() }}</h2>
          <p v-for="l in v.languages" :key="l.id" class="td__kv"><span>{{ l.name }}</span><em>{{ l.level }}</em></p>
        </section>
        <section v-if="v.certifications.length" class="td__section cv-keep">
          <h2 class="td__h"><span :style="{ color: v.accent }">#</span> {{ v.t.certifications.toLowerCase() }}</h2>
          <p v-for="c in v.certifications" :key="c.id" class="td__kv"><span>{{ c.name }}</span><em>{{ [c.issuer, c.date].filter(Boolean).join(', ') }}</em></p>
        </section>
      </div>
      <i class="cv-end" />
    </div>
  </div>
</template>

<script setup>
defineProps({ v: { type: Object, required: true } })
const keys = { mail: 'email', phone: 'phone', pin: 'location', globe: 'web', linkedin: 'linkedin' }
</script>

<style scoped>
.td { --mono: 'JetBrains Mono', 'Consolas', 'Courier New', monospace; }
.td__head { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 36px 48px 30px; background: #0f172a; color: #e2e8f0; }
.td__prompt { font-family: var(--mono); font-size: 11.5px; color: #94a3b8; margin-bottom: 8px; }
.td__name { display: flex; align-items: center; gap: 6px; font-size: 32px; font-weight: 700; letter-spacing: -0.02em; color: #fff; line-height: 1.1; }
.td__caret { display: inline-block; width: 12px; height: 28px; }
.td__title { margin-top: 8px; font-family: var(--mono); font-size: 13px; color: #94a3b8; }
.td__photo { width: 96px; height: 96px; flex-shrink: 0; border-radius: 12px; background-size: cover; background-position: center; border: 2px solid #334155; }
.td__contact { display: flex; flex-wrap: wrap; gap: 4px 18px; padding: 12px 48px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; font-family: var(--mono); font-size: 10.5px; color: #334155; }
.td__contact em { font-style: normal; font-weight: 600; }
.td__body { padding: 26px 48px 36px; }
.td__section { margin-bottom: 20px; }
.td__h { font-family: var(--mono); font-size: 14px; font-weight: 700; margin-bottom: 10px; color: #0f172a; }
.td__entry { margin-bottom: 14px; padding-left: 14px; border-left: 2px solid #e2e8f0; }
.td__row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.td__role { font-size: 13.5px; font-weight: 650; color: #0f172a; }
.td__role span { font-weight: 550; }
.td__date { flex-shrink: 0; font-family: var(--mono); font-size: 10.5px; color: #64748b; white-space: nowrap; }
.td__loc { font-family: var(--mono); font-size: 10.5px; color: #64748b; margin-bottom: 3px; }
.td__tags { display: flex; flex-wrap: wrap; gap: 6px; }
.td__tags code { font-family: var(--mono); font-size: 11px; padding: 3px 8px; border: 1px solid; border-radius: 5px; }
.td__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
.td__kv { display: flex; justify-content: space-between; gap: 10px; font-size: 12px; margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px dashed #e2e8f0; }
.td__kv em { font-family: var(--mono); font-style: normal; font-size: 10.5px; color: #64748b; text-align: right; }
</style>
