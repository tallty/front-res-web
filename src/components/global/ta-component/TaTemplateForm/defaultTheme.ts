import { ref } from 'vue';

const defaultTheme = ref<any>(null);
try {
  defaultTheme.value = require('../../defaultTheme').default;
} catch {
  console.log('no default theme found');
}

export default defaultTheme;
