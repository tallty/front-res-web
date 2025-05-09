<script lang="ts">
import { ref, defineComponent, toRefs } from 'vue';
export default defineComponent({
  name: 'ComIconNumber',
  props: {
    icon: { type: String, default: 'copy' },
    number: { type: Number, default: null },
  },
  setup(props) {
    let msg = ref('');
    return {
      ...toRefs(props),
      msg,
    };
  },
});
</script>

<template lang="pug">
.icon-number-box.flex
  TaIcon.icon(:type='icon')
  .number.label.text-gray {{ number || 0 }}
</template>

<style lang="stylus" scoped>
.icon-number-box
  width auto
.icon
  margin-right 7px
.number
  width 10px
</style>
