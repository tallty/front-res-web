<script lang="ts">
import { ref, defineComponent, toRefs } from 'vue';
const componentName = defineComponent({
  name: 'ComFirstLevel',
  components: {},
  props: {
    title: { type: String, default: '' },
    rightBtnArr: { type: Array, default: () => [] },
  },
  setup(props) {
    let msg = ref('');
    return {
      ...toRefs(props),
      msg,
    };
  },
});
export default componentName;
</script>

<template lang="pug">
.com-first-level
  ComFirstLevelHeader(:rightBtnArr='rightBtnArr', :title='title')
  .main-first-level
    slot
</template>

<style lang="stylus" scoped>
.main-first-level
  width 100%
.com-first-level
  padding  0 24px
</style>
