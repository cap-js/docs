import DefaultTheme from 'vitepress/theme';
import { EnhanceAppContext } from 'vitepress';
import Layout from './Layout.vue';
import Asciinema from './components/Asciinema.vue'
import IndexList from './components/IndexList.vue';
import ImplVariantsHint from './components/implvariants/ImpVariantsHint.vue';

import './custom.scss'

/**
 * @type {import('vitepress/theme')}
 */
export default {
  extends: DefaultTheme,
  Layout: Layout,
  enhanceApp(ctx: EnhanceAppContext) {
    ctx.app.component('Asciinema', Asciinema)
    ctx.app.component('IndexList', IndexList)
    ctx.app.component('ImplVariantsHint', ImplVariantsHint)
  }
}