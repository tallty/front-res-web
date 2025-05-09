<script lang="ts">
import { defineComponent, toRefs, PropType, computed } from 'vue';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';
import useApiSelections from '@/components/global/ta-component/ta-template-form-core/useApiSelections';

const TaRadioGroup = defineComponent({
  name: 'TaRadioGroup',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
    value: { type: [String, Number, Object], default: undefined },
    disabled: { type: Boolean, default: false },
    size: { type: String, default: 'large' },
    path: { type: String, default: '' },
    ransackStr: { type: String, default: '' },
    options: { type: Array, default: undefined },
    attrs: { type: Array as PropType<string[]>, default: () => ['name'] },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => {
        emit('update:value', val);
        emit('syncValue', props.item, val);
      },
    });

    const { options, findLabel } = useApiSelections(props);

    return {
      ...toRefs(props),
      localValue,
      options,
      findLabel,
    };
  },
});
export default TaRadioGroup;
</script>

<template lang="pug">
.ta-radio-group
  template(v-if='!disabled')
    a-radio-group(
      v-model:value='localValue',
      :name='item.key',
      :disabled='disabled',
      :options='options',
      :size='size'
    )
  template(v-else)
    .value {{ findLabel(localValue) }}
</template>

<style lang="stylus" scoped>
.ta-radio-group
  >>>.ant-radio-wrapper
      margin-right 16px
      margin-bottom 16px
  >>>.ant-radio
    font-size 16px

    .ant-radio-input
      width 16px
      height 16px
    .ant-radio-inner
      border-color #D1D5DB
      background #F9FAFB
  >>>.ant-radio-checked
    .ant-radio-inner
      border-width: 4px
      border-color $primary-color
  >>>.ant-radio-inner::after
    display none !important
</style>
