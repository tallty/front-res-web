<script lang="ts">
import { ref, defineComponent, toRefs } from 'vue';
const componentName = defineComponent({
  name: 'ComTypeLabel',
  components: {},
  props: {
    label: { type: String, default: '' },
    style: { type: Object, default: () => ({}) },
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
.com-type-label(:style='style') {{ label }}
</template>

<style lang="stylus" scoped>
.com-type-label
  display inline-block
  padding 0 2px
  // width: 34px;
  height: 20px;
  background: #FFFFFF;
  border-radius: 4px;
  border: 1px solid $primary-color;
  font-size: 12px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color $primary-color
  text-align center
  line-height 20px
</style>
