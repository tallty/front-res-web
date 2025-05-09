<script lang="ts">
import { defineComponent, toRefs } from 'vue';

const TaCapsuleButton = defineComponent({
  name: 'TaCapsuleButton',
  components: {},
  props: {
    value: { type: String, default: 'copy' },
    text: { type: String, default: '' },
    desc: { type: String, default: '' },
    viceText: { type: String, default: '' },
    viceDesc: { type: String, default: '' },
  },
  emits: ['click', 'viceClick'],
  setup(props, { emit }) {
    const viceClick = () => {
      emit('viceClick');
    };

    const click = () => {
      emit('click');
    };

    return {
      ...toRefs(props),
      viceClick,
      click,
    };
  },
});
export default TaCapsuleButton;
</script>

<template lang="pug">
.com-capsule-button.flex-center(v-if='viceText && text')
  .left.item(@click='viceClick')
    a-tooltip
      template(#title)
        .tip {{ viceDesc || viceText }}
      div {{ viceText }}
  .right.item(@click='click')
    a-tooltip
      template(#title)
        .tip {{ desc || text }}
      div {{ text }}
.com-capsule-button.com-capsule-button-single(v-else)
  //- .empty
  .all.item(v-if='text', @click='click')
    a-tooltip
      template(#title)
        .tip {{ desc || text }}
      div {{ text }}
</template>

<style lang="stylus" scoped>
.com-capsule-button
  cursor pointer
  display inline-grid
  grid-template-columns 1fr 1fr
  .item
    flex 1
    width 100%
    padding 0 1rem
    height 35px
    line-height 35px
    text-align center
    font-size 14px
    border $primary-color 1px solid
  .left
    color $primary-color
    background #fff
    min-width 65px
    border-radius 20px 0px 0px 20px
  .right
    color #fff
    background $primary-color
    min-width 65px
    border-radius 0px 20px 20px 0px
  .all
    float right
    color #fff
    background $primary-color
    border-radius 20px
.com-capsule-button-single
  display flex
  align-items center
</style>
