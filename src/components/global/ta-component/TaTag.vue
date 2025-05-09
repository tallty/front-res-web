<script lang="ts">
import { ref, defineComponent, toRefs } from 'vue';

const TaTag = defineComponent({
  name: 'TaTag',
  components: {},
  props: {
    icon: { type: String, default: '' },
    color: { type: String, default: '' },
    background: { type: String, default: '' },
  },
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
export default TaTag;
</script>

<template lang="pug">
.ta-tag.text-sm.rounded.py-1.px-3
  TaIcon.icon(v-if='icon', :type='icon')
  slot
</template>

<style lang="stylus" scoped>
.ta-tag
  background-color $primary-color
  color white
  background-color v-bind(background)
  color v-bind(color)
  width fit-content
  display flex
  align-items center
  .icon
    margin-right 4px
</style>
