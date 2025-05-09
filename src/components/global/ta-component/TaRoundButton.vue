<script lang="ts">
import { defineComponent, toRefs } from 'vue';

const TaRoundButton = defineComponent({
  name: 'TaRoundButton',
  components: {},
  props: {
    type: { type: String, default: null },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const onClick = () => {
      emit('click');
    };

    return {
      ...toRefs(props),
      onClick,
    };
  },
});
export default TaRoundButton;
</script>

<template lang="pug">
a-button.btn(shape='round', :type='type', @click='onClick')
  .text
    slot
</template>

<style lang="stylus" scoped>
.ta-round-button
  display inline-block
  height 26px
  padding 2px 6px
  .btn
    display block
    height 26px
    line-height 26px
    text-align center
    margin 0 auto
    border 1px solid #C3C6CE
    font-size 12px
    font-family PingFangSC-Regular, PingFang SC
    font-weight 400
    color #595959
    .text
      padding 0 10px
</style>
