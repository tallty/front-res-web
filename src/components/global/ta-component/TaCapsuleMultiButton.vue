<script lang="ts">
import { defineComponent, toRefs, PropType, computed } from 'vue';
import { VObject } from '@/lib/vails/model';

export interface TaCapsuleMultiButtonInterface {
  key: string;
  label?: string;
  callback?: () => void;
  hover?: boolean;
}

const TaCapsuleMultiButton = defineComponent({
  name: 'TaCapsuleMultiButton',
  components: {},
  props: {
    activeKey: { type: String, default: '' },
    buttons: { type: Array as PropType<TaCapsuleMultiButtonInterface[]>, default: () => [] },
    shadow: { type: Boolean, default: false },
    size: { type: String as PropType<'large' | 'middle' | 'small'>, default: 'middle' },
  },
  setup(props) {
    const height = computed(() => {
      return (
        ({
          large: '36px',
          middle: '24px',
          small: '12px',
        } as VObject)[props.size] || '24px'
      );
    });

    const fontSize = computed(() => {
      return (
        ({
          large: '18px',
          middle: '12px',
          small: '6px',
        } as VObject)[props.size] || '12px'
      );
    });

    return {
      ...toRefs(props),
      height,
      fontSize,
    };
  },
});
export default TaCapsuleMultiButton;
</script>

<template lang="pug">
.ta-capsule-multi-button(:class='{ shadow, "padding-4": buttons.filter(item => !item.hover).length > 0 }')
  .item(
    v-for='item in buttons',
    :key='item.key',
    :class='{ [`ta-capsule-multi-button__${item.key}`]: true, "active-item": activeKey === item.key }',
    @click.stop='() => item.callback ? item.callback() : null'
  )
    slot(:name='item.key', :item='item')
      | {{ item.label }}
</template>

<style lang="stylus" scoped>
.ta-capsule-multi-button
  cursor pointer
  display flex
  background white
  border-radius v-bind(fontSize)
  // transition all 0.5s linear
  .item
    // width 100%
    flex-shrink 0
    flex-grow 1
    padding 0 8px
    height v-bind(height)
    display flex
    justify-content center
    align-items center
    font-size v-bind(fontSize)
    border-right 1px solid #D9D9D9
    color rgba(89, 89, 89, 0.65)
    &:last-child
      border-right 0px solid #D9D9D9
.shadow
  box-shadow 0px 0px 3px 2px #EFF3FD
.active-item
  font-weight 500
  color #262626 !important
.padding-4
  padding 4px
</style>
