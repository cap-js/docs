import DefaultTheme from 'vitepress/theme';

import './custom.scss'
// @ts-ignore
import Layout from './Layout.vue';
// @ts-ignore
import IndexList from './components/IndexList.vue';

/**
 * @type {import('vitepress/theme')}
 */
export default {
  extends: DefaultTheme,
  Layout: Layout,
  enhanceApp(ctx:any) {
    ctx.app.component('IndexList', IndexList)
  }
}