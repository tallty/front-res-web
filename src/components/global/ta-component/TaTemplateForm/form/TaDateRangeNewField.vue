<script lang="ts">
import { defineComponent, toRefs, PropType, computed, ref } from 'vue';
import {
  FormItemSize,
  RangePickerType,
  TaTemplateFormItem,
} from '@/components/global/ta-component/ta-template-form-core/types';
import dayjs, { Dayjs } from 'dayjs';

const TaDateRangeNewField = defineComponent({
  name: 'TaDateRangeNewField',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
    // value: { type: Array as PropType<string[]>, default: () => [] },
    disabled: { type: Boolean, default: false },
    format: { type: String, default: 'YYYY-MM-DD HH:mm:ss' },
    showTime: { type: Boolean, default: false },
    mode: { type: Array || String, default: () => '' },
    start_at: { type: String, default: null },
    end_at: { type: String, default: null },
    size: { type: String as PropType<FormItemSize>, default: () => 'regular' },
    widgetType: { type: String as PropType<RangePickerType>, default: () => 'date' },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () =>
        [props.start_at, props.end_at].map((v: string) => {
          if (props.format === 'HH:mm:ss' || props.format === 'hh:mm:ss') {
            const today = dayjs().format('YYYY-MM-DD');
            const fullDate = `${today} ${v}`;
            return v
              ? dayjs(fullDate, props.format).isValid()
                ? dayjs(fullDate, props.format)
                : null
              : null;
          }
          return v ? (dayjs(v, props.format).isValid() ? dayjs(v, props.format) : null) : null;
        }) || [],
      set: (val: (Dayjs | null)[] | null) => {
        emit(
          'update:start_at',
          val === null ? undefined : dayjs(val[0]!)?.format(props.format) || null,
        );
        emit(
          'update:end_at',
          val === null ? undefined : dayjs(val[1]!)?.format(props.format) || null,
        );
      },
    });

    const finalSize = computed(() => {
      if (props.item?.options?.size) {
        return props.item.options.size;
      }
      return props.size;
    });

    const calPadding = computed(() => {
      switch (finalSize.value) {
        case 'regular':
          return '11px 16px';
        case 'small':
          return '7px 16px';
        case 'large':
          return '15px 16px';
        default:
          return '11px 16px';
      }
    });

    // 组件验证状态
    // 通过flag 改变css 的部分样式 【仅有部分组件需要 如input类型类的，需要改变边框 css样式型的】
    const flag = ref(true);
    const validate = async () => {
      if (props.item?.options?.required) {
        if (props.start_at && props.end_at) {
          flag.value = true;
          return Promise.resolve();
        } else {
          flag.value = false;
          return Promise.reject(`请输入${props.item?.name}`);
        }
      } else {
        flag.value = true;
        return Promise.resolve();
      }
    };

    return {
      ...toRefs(props),
      localValue,
      validate,
      dayjs,
      calPadding,
      flag,
    };
  },
});
export default TaDateRangeNewField;
</script>

<template lang="pug">
.ta-date-range-field(:class="{'warn-state': !flag}")
  template(v-if='!disabled')
    template(v-if="widgetType === 'date'")
      a-range-picker.picker(
        v-model:value='localValue',
        :name='item.key',
        :disabled='disabled',
        :placeholder='item.options.placeholder || `请选择${item.name}`',
        :showTime='showTime',
        :mode='mode'
        :format='item?.format || format || "YYYY-MM-DD HH:mm:ss"',
        dropdownClassName='ant-range-picker-popup'
        :style="{'--inputPadding': calPadding}"
      )
    template(v-if="widgetType === 'time'")
      a-time-range-picker.picker(
        v-model:value='localValue',
        :name='item.key',
        :disabled='disabled',
        :placeholder='item.options.placeholder || `请选择${item.name}`',
        :showTime='showTime',
        :format='item?.format || format || "YYYY-MM-DD HH:mm:ss"',
        dropdownClassName='ant-range-picker-popup'
        :style="{'--inputPadding': calPadding}"
      )
  template(v-else)
    .value {{ localValue.map(obj => obj?.format(format) || '空').join(' ~ ') }}
</template>

<style lang="stylus">
.ant-range-picker-popup
  // .ant-picker-cell
  .ant-picker-cell-in-range::before
    background #F3F4F6
  // .ant-picker-cell-inner

  .ant-picker-cell-in-view.ant-picker-cell-range-start
    border-top-left-radius 8px
    border-bottom-left-radius 8px
    .ant-picker-cell-inner
      background $primary-color !important
      border-radius 8px 0 0 8px !important

  .ant-picker-cell-range-start::before
    // background $primary-color !important

  .ant-picker-cell-in-view.ant-picker-cell-range-end
    border-top-right-radius 8px
    border-bottom-right-radius 8px
    .ant-picker-cell-inner
      background $primary-color !important
      border-radius 0 8px 8px 0 !important

  .ant-picker-cell-range-end::before
    // background $primary-color !important
  .ant-picker-cell-today
    .ant-picker-cell-inner::before
      border-radius 8px !important
</style>

<style lang="stylus" scoped>
.ta-date-range-field
  .picker
    width 100%
    padding var(--inputPadding) !important
    border-radius 8px
    background #F9FAFB !important
    color #111928
  >>>.ant-picker-separator
    display flex !important
  >>>.ant-picker-input
    height 20px !important
    input
      color #111928
      height 20px !important
  >>>.ant-picker-clear
    margin-right 5px

.warn-state
  .picker
    background #FDF2F2 !important
    color: #E02424

  >>>.ant-picker-input
    input
      color #E02424
    input::placeholder
      color #E02424
</style>
