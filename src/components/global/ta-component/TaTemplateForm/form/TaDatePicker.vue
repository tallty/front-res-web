<script lang="ts">
import dayjs, { Dayjs } from 'dayjs';
import { defineComponent, toRefs, PropType, computed, ref } from 'vue';
import {
  FormItemSize,
  TaTemplateFormItem,
} from '@/components/global/ta-component/ta-template-form-core/types';
import useJudgeTimeDisable from '../../ta-template-form-core/useJudgeTimeDisable';

const TaDatePicker = defineComponent({
  name: 'TaDatePicker',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
    value: { type: [String, Object] as PropType<string | Dayjs>, required: true },
    disabled: { type: Boolean, default: false },
    defaultValue: { type: String, default: null },
    size: { type: String as PropType<FormItemSize>, default: () => 'regular' },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const localValue = computed({
      get: () => {
        if (!props.value) {
          return null;
        }
        if (props.value instanceof dayjs) {
          return props.value;
        }
        const mo = dayjs(props.value);
        return mo.isValid() ? mo : null;
      },
      set: val => {
        let result = null;
        if (val instanceof dayjs || (val && dayjs(val).isValid())) {
          result = (val as Dayjs).format('YYYY-MM-DD');
        }
        emit('update:value', result);
      },
    });

    const localDefaultValue = computed(() => {
      if (dayjs(props.defaultValue).isValid()) {
        return dayjs(props.defaultValue);
      } else {
        return null;
      }
    });

    const viewerValue = computed(() => {
      const value = dayjs(localValue.value || localDefaultValue.value || undefined);
      return value.isValid() ? value.format('YYYY-MM-DD') : null;
    });

    const { judgeTimeDisable } = useJudgeTimeDisable();

    const judgeDate = (time: Dayjs) => {
      return judgeTimeDisable(time, props.item);
    };

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
        if (props.value) {
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
      localDefaultValue,
      viewerValue,
      judgeDate,
      calPadding,
      flag,
    };
  },
});
export default TaDatePicker;
</script>

<template lang="pug">
.ta-date-picker-normal(:class="{'warn-state': !flag}")
  template(v-if='!disabled')
    a-date-picker.picker(
      v-model:value='localValue',
      :name='item.key',
      :disabled='disabled',
      :placeholder='item?.options?.placeholder || `请选择${item?.name}`',
      :size='size',
      :defaultValue='localDefaultValue'
      :disabledDate='judgeDate'
      :style="{'--inputPadding': calPadding}"
      dropdownClassName='ant-date-picker-popup'
    )
  template(v-else)
    .value {{ viewerValue }}
</template>

<style lang="stylus">
.ant-date-picker-popup
  .ant-picker-cell-today
    .ant-picker-cell-inner::before
      border-radius 8px !important
  .ant-picker-cell-selected
    padding 0 !important

    .ant-picker-cell-inner
      color: #fff
      background: $primary-color
      width: 36px
      height: 30px
      line-height: 30px
      border-radius: 8px

  .ant-picker-footer
    border-top 0 !important
    margin-bottom 8px

  .ant-picker-today-btn
    border-radius 8px !important
    border 1px solid $primary-color !important
    padding 8px 114px
    color $primary-color
</style>

<style lang="stylus" scoped>

.ta-date-picker-normal
  .picker
    width 100%
    padding var(--inputPadding) !important
    border-radius 8px
    background #F9FAFB !important
    color #111928

  >>>.ant-picker-input
    height 20px !important
    input
      color #111928
      height 20px !important


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
