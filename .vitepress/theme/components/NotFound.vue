<template>
  <div v-if="newPath" class="NotFound vp-doc">
    <h1 class="title">URL has changed</h1>
    <p>You are being redirected to <a :href="newPath">{{ newPath }}</a></p>
  </div>
  <div v-else class="NotFound">
    <p class="code">404</p>
    <h1 class="title">PAGE NOT FOUND</h1>
    <div class="divider" />
    <blockquote class="quote">
      But if you don't change your direction, and if you keep looking, you may end up where you are heading.
    </blockquote>

    <div class="action">
      <a class="link" :href="withBase(root)" aria-label="go to home">
        Take me home
      </a>
    </div>
  </div>
</template>

<script setup>

import { useRoute, useData, withBase } from 'vitepress'
import { onMounted, ref } from 'vue'
const { frontmatter, site } = useData()
const route = useRoute()

const base = site.value.base
const path = route.path.slice(base.length)
const newPath = ref()
const root = ref('/')

onMounted(async () => {
  const redirects = await fetch(withBase('redirects.json'))
  const redirectTo = await redirects.json()
  newPath.value = target(path)
  if (newPath.value) {
    let newURL
    if (newPath.value.startsWith('http')) {
      newURL = new URL(newPath.value)
    } else {
      newPath.value = withBase(newPath.value)
      newURL = new URL(window.location.toString())
      newURL.pathname = newPath.value
    }
    window.location.replace(newURL) // avoids this temp. page in history
  }
  function target(from) {
    const to = redirectTo[from]
    if (to) return target(to)  // resolve direct chains
    return from
  }
})

</script>

<style scoped>
.NotFound {
  padding: 64px 24px 96px;
  text-align: center;
}

@media (min-width: 768px) {
  .NotFound {
    padding: 96px 32px 168px;
  }
}

.code {
  line-height: 64px;
  font-size: 64px;
  font-weight: 600;
}

.title {
  padding-top: 12px;
  letter-spacing: 2px;
  line-height: 20px;
  font-size: 20px;
  font-weight: 700;
}

.divider {
  margin: 24px auto 18px;
  width: 64px;
  height: 1px;
  background-color: var(--vp-c-divider);
}

.quote {
  margin: 0 auto;
  max-width: 256px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.action {
  padding-top: 20px;
}

.link {
  display: inline-block;
  border: 1px solid var(--vp-c-brand);
  border-radius: 16px;
  padding: 3px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-brand);
  transition: border-color 0.25s, color 0.25s;
}

.link:hover {
  border-color: var(--vp-c-brand-dark);
  color: var(--vp-c-brand-dark);
}
</style>
