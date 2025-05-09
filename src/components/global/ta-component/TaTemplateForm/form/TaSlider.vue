<script lang="ts">
import { defineComponent, toRefs, PropType, computed } from 'vue';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';

const TaSlider = defineComponent({
  name: 'TaSlider',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => {} },
    value: { type: Number, default: undefined },
    disabled: { type: Boolean, default: false },
    max: { type: Number, default: 100 },
    min: { type: Number, default: 0 },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const localValue = computed({
      get: () => {
        return props.value;
      },
      set: val => emit('update:value', val),
    });

    const maxNumber = computed(() => {
      if (props.item.options?.max === 0) {
        return 0;
      } else if (props.item.options?.max) {
        return props.item.options?.max;
      } else {
        return props.max;
      }
    });

    const minNumber = computed(() => {
      if (props.item.options?.min === 0) {
        return 0;
      } else if (props.item.options?.min) {
        return props.item.options?.min;
      } else {
        return props.min;
      }
    });

    return {
      ...toRefs(props),
      localValue,
      maxNumber,
      minNumber,
    };
  },
});
export default TaSlider;
</script>

<template lang="pug">
.ta-slider
  a-row.row
    a-col.col(:span="20")
      a-slider.slider(v-model:value='localValue' :min='minNumber' :max='maxNumber', :disabled='disabled')
    a-col.col(:span='2')
      a-input-number.number(v-model:value='localValue' :min='minNumber' :max='maxNumber', :disabled='disabled')
</template>
<style lang="stylus" scoped>
.ta-slider
  .ant-slider
    margin-right 1.5rem
    >>>.ant-slider-step
      height 8px
    >>>.ant-slider-rail
      height 8px
      background-color #E5E7EB
    >>>.ant-slider-track
      height 8px
      background-color $primary-color
    >>>.ant-slider-handle
      width 20px
      height 20px
      margin-top -7px
      border 2px solid #E5E7EB
  .ant-slider-disabled
    >>>.ant-slider-rail
        background-color #E5E7EB !important
</style>
