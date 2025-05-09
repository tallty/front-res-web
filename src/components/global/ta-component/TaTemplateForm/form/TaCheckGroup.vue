<script lang="ts">
import { defineComponent, toRefs, PropType, computed } from 'vue';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';
import useApiSelections from '@/components/global/ta-component/ta-template-form-core/useApiSelections';

const TaCheckGroup = defineComponent({
  name: 'TaCheckGroup',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
    value: { type: [String, Number, Object], required: true },
    disabled: { type: Boolean, default: false },
    size: { type: String, default: 'large' },
    multiple: { type: Boolean, default: false },

    path: { type: String, default: '' },
    ransackStr: { type: String, default: '' },
    attrs: { type: Array as PropType<string[]>, default: () => ['name'] },
    options: { type: Array, default: undefined },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => (Array.isArray(props.value) ? props.value : [props.value]),
      set: val => {
        let value = val;
        if (!props.multiple) {
          const oldValue = [...localValue.value];
          value = val.filter((i: string) => !oldValue.includes(i));
        }

        emit('update:value', value);
        emit('syncValue', props.item, value);
      },
    });

    const { options, findLabel } = useApiSelections(props);

    const checkOptions = computed(() => {
      if (props.item?.options?.select_max && props.multiple) {
        const disabled = localValue.value.length === props.item.options.select_max;
        return (options.value || []).map((option: any) => {
          return {
            label: option.label,
            value: option.value,
            disabled: localValue.value.includes(option.value) ? false : disabled,
          };
        });
      }
      return options.value;
    });

    return {
      ...toRefs(props),
      localValue,
      options,
      findLabel,
      checkOptions,
    };
  },
});
export default TaCheckGroup;
</script>

<template lang="pug">
.ta-check-group
  template(v-if='!disabled')
    a-checkbox-group(
      class='!text-xl',
      v-model:value='localValue',
      :name='item.key',
      :disabled='disabled',
      :options='checkOptions',
      :size='size'
    )
  template(v-else)
    .value {{ findLabel(localValue) || localValue.map(val => findLabel(val)).join('、') }}
</template>

<style lang="stylus" scoped>
.ta-check-group
  width 100%
  >>>.ant-checkbox-group-item
    margin-right 16px
    .ant-checkbox-inner
      border: 0.5px solid  #D1D5DB;
      background: #F9FAFB
  >>>.ant-checkbox-checked
    .ant-checkbox-inner
      border-color: $primary-color;
      background: $primary-color;
</style>
