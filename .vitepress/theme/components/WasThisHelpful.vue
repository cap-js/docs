<template>
  <div class="helpful-container">
    <p v-if="!feedbackSent">Was this page helpful?</p>
    <div v-if="!feedbackSent" class="button-row">
      <button
        :class="{ selected: selection === 'positive' }"
        @click="handlePositive"
      >
        👍
      </button>
      <button
        :class="{ selected: selection === 'negative' }"
        @click="handleNegative"
      >
        👎
      </button>
    </div>

    <p v-if="feedbackSent" class="thank-you">Thank you for your feedback!</p>

    <div class="feedback-section" v-if="feedbackSelected && !feedbackSent">
      <div class="textarea-container">
        <textarea
          ref="feedbackInput"
          v-model="feedbackText"
          :placeholder="placeholderText"
          :maxlength="charLimit"
          class="feedback-textarea"
        ></textarea>
        <p class="char-count">{{ feedbackText.length }}/140</p>
      </div>

      <div class="send-feedback">
        <button class="feedback-button" @click="sendFeedback">Send</button>
      </div>
    </div>

    <p class="more-feedback" v-if="feedbackSelected">
      More to say?
      <a href="https://github.com/cap-js/docs/issues" target="_blank">
        Report an issue.
      </a>
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'

const charLimit = 140
const feedbackText = ref('')
const feedbackSelected = ref(false)
const feedbackSent = ref(false)
const selection = ref(null)

const handlePositive = () => {
  if (selection.value === 'positive') return
  if (typeof window !== 'undefined' && window._paq) {
    window._paq.push(['trackEvent', 'Feedback', 'Positive', window.location.href])
  }
  feedbackSelected.value = true
  selection.value = 'positive'
}

const handleNegative = () => {
  if (selection.value === 'negative') return
  if (typeof window !== 'undefined' && window._paq) {
    window._paq.push(['trackEvent', 'Feedback', 'Negative', window.location.href])
  }
  feedbackSelected.value = true
  selection.value = 'negative'
}

const sendFeedback = () => {
  if (typeof window !== 'undefined' && window._paq) {
    const category = 'Feedback Message'
    const action = selection.value === 'positive' ? 'Positive' : 'Negative'
    const name = window.location.href + ': ' + feedbackText.value.trim()

    window._paq.push(['trackEvent', category, action, name])
    feedbackSent.value = true
  }
}

const placeholderText = computed(() => {
  if (selection.value === 'positive') return 'What did you like about the page?'
  if (selection.value === 'negative') return 'What did you miss on this page?'
  return ''
})

watchEffect(() => {
  feedbackText.value = ''
  feedbackSelected.value = false
  feedbackSent.value = false
  selection.value = null
})
</script>

<style scoped>
.helpful-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
}

p {
  margin: 0;
}

.button-row {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
}

button {
  cursor: pointer;
  border: 1px solid var(--vp-c-divider);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background: none;
}

button:hover {
  border-color: var(--vp-c-brand-1);
}

button.selected {
  border-color: var(--vp-c-brand-1);
  font-weight: bold;
}

.feedback-button {
  background-color: #3b82f7;
  border: none;
  font-weight: 600;
  transition: opacity 0.2s;
  min-width: 100px;
}

.feedback-button:hover, .feedback-button.selected {
  border: none;
  opacity: 0.8;
}

.feedback-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 500px;
  gap: 0.5rem;
  margin-top: 1rem;
  position: relative;
}

.textarea-container {
  position: relative;
  width: 100%;
}

.feedback-textarea {
  font-family: var(--vp-font-family);
  font-size: 14px;
  font-weight: 500;
  width: 100%;
  height: 90px;
  padding: 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  resize: none;
}

.char-count {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  padding: 0 0.3rem;
  border-radius: 3px;
}

.send-feedback {
  color: white;
  text-align: center;
}

.thank-you {
  margin-top: 1rem;
  font-size: 1rem;
  color: var(--vp-c-success);
}

.more-feedback {
  margin-top: 2rem;
  text-align: center;
}

.more-feedback a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.more-feedback a:hover {
  text-decoration: underline;
}
</style>
