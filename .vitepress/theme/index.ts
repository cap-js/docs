import DefaultTheme from 'vitepress/theme';
import { EnhanceAppContext } from 'vitepress';
import Layout from './Layout.vue';
import IndexList from './components/IndexList.vue';
import ImplVariantsHint from './components/implvariants/ImpVariantsHint.vue';
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
    ctx.app.component('Since', Since)
  }
}