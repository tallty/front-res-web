<script lang="ts">
import { defineComponent, toRefs, PropType, computed } from 'vue';
import {
  TaTemplateFormItem,
  TaTemplateFormRule,
} from '@/components/global/ta-component/ta-template-form-core/types';
import dayjs, { Dayjs } from 'dayjs';

const TaDateRangeField = defineComponent({
  name: 'TaDateRangeField',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
    value: { type: Array as PropType<string[]>, default: () => [] },
    disabled: { type: Boolean, default: false },
    format: { type: String, default: 'YYYY-MM-DD' },
    showTime: { type: Boolean, default: false },
    mode: { type: Array, default: () => ['date', 'date'] },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () =>
        props.value?.map((v: string) => (v ? (dayjs(v).isValid() ? dayjs(v) : null) : null)) || [],
      set: (val: (Dayjs | null)[] | null) => {
        emit(
          'update:value',
          val === null ? undefined : val.map(v => v?.format(props.format) || null) || [],
        );
      },
    });

    // 因为 a-range-picker 会保证选值必须选中两个，所以可以不验证

    // const validate = () => {
    //   return new Promise<void>((resolve, reject) => {
    //     if (props.item.rules.find((rule: TaTemplateFormRule) => rule.required)) {
    //       try {
    //         if (
    //           localValue.value.length === 2 &&
    //           localValue.value[0].isBefore(localValue.value[1])
    //         ) {
    //           resolve();
    //         } else {
    //           reject(`请选择正确的${props.item.name}`);
    //         }
    //       } catch {
    //         reject('时间范围错误');
    //       }
    //     } else {
    //       resolve();
    //     }
    //   });
    // };

    return {
      ...toRefs(props),
      localValue,
      // validate,
      dayjs,
    };
  },
});
export default TaDateRangeField;
</script>

<template lang="pug">
.ta-date-range-field
  template(v-if='!disabled')
    a-range-picker.picker(
      v-model:value='localValue',
      :name='item.key',
      :disabled='disabled',
      :placeholder='item.options.placeholder || `请选择${item.name}`',
      :showTime='showTime',
      :mode='mode'
    )
  template(v-else)
    .value {{ localValue.map(obj => obj?.format(format) || '空').join(' ~ ') }}
</template>

<style lang="stylus" scoped></style>
