<script lang="ts">
import { defineComponent, toRefs } from 'vue';

const TaIconTooltip = defineComponent({
  components: {},
  name: 'TaIconTooltip',
  props: {
    icon: { type: String, default: 'copy' },
    tips: { type: String, default: '' },
    // theme: { type: String as PropType<'outlined' | 'filled' | 'twoTone'>, default: 'outlined' },
    type: { type: String, default: 'default' },
    disabled: { type: Boolean, default: false },
    danger: { type: Boolean, default: false },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const onClick = (...args: any) => {
      emit('click', ...args);
    };

    return {
      ...toRefs(props),
      onClick,
    };
  },
});

export default TaIconTooltip;
</script>

<template lang="pug">
.ta-icon-tooltip.flex-center
  a-tooltip
    template(#title, v-if='tips') {{ tips }}
    slot(name='custom')
      a-button.icon-button(
        :type='type', 
        :disabled='disabled',
        @click.stop='onClick',
        :class="{ 'icon-button-danger': danger }"
      )
        TaIcon.icon(:type='icon', style='font-size: 14px')
</template>

<style lang="stylus" scoped>
.icon-button
  display inline-flex
  justify-content center
  align-items center
  overflow hidden
  margin-left 10px
  padding 0px
  height unset
  border none
  background none
  color #A6A6A6
  vertical-align -2px
  vertical-align sub
  font-size 16px
  line-height 16px
  &:first-child
    margin-left 0
  &:hover
    background none
    color $primary-color
.icon-button-danger
  &:hover
    color $error-color
.ta-icon-tooltip
  >>> .ant-btn:focus
    background none
</style>
