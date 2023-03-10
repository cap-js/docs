import DefaultTheme from 'vitepress/theme';
import './custom.css'
// @ts-ignore
import Layout from './Layout.vue';

/**
 * @type {import('vitepress/theme')}
 */
export default {
  extends: DefaultTheme,
  Layout: Layout,
  enhanceApp(ctx:any) {
  }
}