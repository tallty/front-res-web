<script lang="ts">
import { ref, defineComponent, toRefs } from 'vue';
export default defineComponent({
  name: 'ComTypeText',
  props: {
    type: { type: String, default: '' },
    text: { type: String, default: '' },
    color: { type: String, default: '' },
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
.type-box.flex
  .type(v-if='type') {{ type }}
  .text.label.text-block.text-bold(:style='{ color }', v-if='text') {{ text }}
</template>

<style lang="stylus" scoped>
.type
  background: #FAFAFA;
  border-radius: 4px;
  border: 1px solid #E5E5E5;
  margin-right 6px
  color #A6A6A6
  font-size 12px
  padding 2px 4px
</style>
