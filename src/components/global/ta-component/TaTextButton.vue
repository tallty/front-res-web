<script lang="ts">
import { useRouter } from 'vue-router';

import { defineComponent, toRefs } from 'vue';

const TaTextButton = defineComponent({
  name: 'TaTextButton',
  props: {
    icon: { type: String, default: '' },
    rightIcon: { type: String, default: '' },
    theme: { type: String, default: '' },
    to: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const router = useRouter();
    const click = (e: Event) => {
      if (props.disabled || props.loading) {
        return;
      }
      if (props.to) {
        router.push(props.to);
        return;
      }
      emit('click', e);
    };

    return {
      ...toRefs(props),
      click,
    };
  },
});

export default TaTextButton;
</script>

<template lang="pug">
button.ta-text-button(@click='click', type='button', :disabled='disabled')
  TaIcon.icon.h-4.w-4(v-if='loading', type='LoadingOutlined')
  TaIcon.icon.h-4.w-4(v-if='icon', :type='icon', :theme='theme')
  span.ta-text-button__text
    slot
  TaIcon.icon.h-4.w-4(v-if='rightIcon', :type='rightIcon', :theme='theme')
</template>

<style lang="stylus" scoped>
.ta-text-button
  padding 0
  outline none
  border none
  background unset
  color $primary-color
  display inline-flex
  align-items center
  font-weight 400
  font-size 14px
  line-height 20px
  cursor pointer
  // &:last-child
  //   margin-left 14px
  &:hover
    color darken(($primary-color), 20%)
  &:disabled
    color #999999
    cursor not-allowed
  .icon
    margin 0 4px
</style>
