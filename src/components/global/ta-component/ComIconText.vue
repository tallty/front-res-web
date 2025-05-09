<script lang="ts">
import { defineComponent, toRefs } from 'vue';

export default defineComponent({
  name: 'ComIconText',
  props: {
    icon: { type: String, default: '' },
    text: { type: String, default: '' },
    size: { type: String, default: '' },
    fontWeight: { type: String, default: '' },
    click: { type: Function, default: null },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const iconTextClick = function () {
      emit('click');
    };
    return {
      ...toRefs(props),
      iconTextClick,
    };
  },
});
</script>

<template lang="pug">
.icon-text.hover(@click.stop='iconTextClick', :style='{ fontWeight, fontSize: size }')
  TaIcon.icon(:type='icon', v-if='icon')
  //- <a-icon type="fullscreen" />
  slot
    .text {{ text }}
</template>

<style lang="stylus" scoped>
.icon-text
  margin-right 20px
  display flex
  align-items center
  color $primary-color
.text
  margin-left 4px
  color $primary-color
</style>
