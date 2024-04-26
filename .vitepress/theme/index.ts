import DefaultTheme from 'vitepress/theme';
import { EnhanceAppContext } from 'vitepress';
import Layout from './Layout.vue';
import IndexList from './components/IndexList.vue';
import ImplVariantsHint from './components/implvariants/ImpVariantsHint.vue';
import Alpha from './components/Alpha.vue';
import Beta from './components/Beta.vue';
import Concept from './components/Concept.vue'
import Since from './components/Since.vue';

import './custom.scss'

/**
 * @type {import('vitepress/theme')}
 */
export default {
  extends: DefaultTheme,
  Layout: Layout,
  enhanceApp(ctx: EnhanceAppContext) {
    ctx.app.component('IndexList', IndexList)
    ctx.app.component('ImplVariantsHint', ImplVariantsHint)
    ctx.app.component('Alpha', Alpha)
    ctx.app.component('Beta', Beta)
    ctx.app.component('Concept', Concept)
    ctx.app.component('Since', Since)
  }
}