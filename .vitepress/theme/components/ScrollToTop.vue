<template>
  <button v-show="visible" @click="scrollToTop"
    v-bind:class="{ fadeIn: enableFadeInClass, fadeOut: enableFadeOutClass }" class="scroll-to-top">
    <svg class="scroll-to-top-icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
      version="1.1" viewBox="-10 0 531 512">
      <title>Scroll to top</title>
      <g transform="matrix(1 0 0 -1 0 480)">
        <path fill="currentColor"
          d="M256 -32q53 0 99 20t81 55t55 81.5t20 99t-20 99t-55 81.5t-81 55t-99 20t-99.5 -20t-81.5 -55t-55 -81.5t-20 -99t20 -99t55 -81.5t81.5 -55t99.5 -20zM256 428q42 0 79 -16t65 -44t44 -65t16 -79t-16 -79.5t-44 -65.5t-65 -44t-79 -16t-79.5 16t-65.5 44t-44 65.5
t-16 79.5t16 79t44 65t65.5 44t79.5 16zM314 180q8 -8 18 -8t18 8t8 18t-8 18l-77 77q-8 8 -17.5 8t-17.5 -8l-77 -77q-8 -8 -8 -18t8 -18t18 -8t18 8l58 59z" />
      </g>
    </svg>
  </button>
</template>

<script>
export default {
  data() {
    return {
      enableFadeInClass: false,
      enableFadeOutClass: true,
      visible: true
    };
  },
  methods: {
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  },
  mounted() {
    window.addEventListener('scroll', () => {
      const isVisible = window.scrollY > 240;
      this.enableFadeInClass = isVisible;
      this.enableFadeOutClass = !isVisible;
    });
  },
};
</script>

<style scoped>
.scroll-to-top {
  position: fixed;
  bottom: 40px;
  right: 4%;
  z-index: 11;
}

.scroll-to-top:hover {
  opacity: 1;
}

.scroll-to-top-icon {
  cursor: pointer;
  width: 40px;
  color: #0092d1;
}

.fadeOut {
  visibility: hidden;
  opacity: 0;
  transition: visibility 0s linear 400ms, opacity 400ms;
}

.fadeIn {
  visibility: visible;
  opacity: 0.5;
  transition: visibility 0s linear 0s, opacity 400ms;
}
</style>
