<script lang="ts">
import {
  FormItemSize,
  TaTemplateFormItem,
} from '@/components/global/ta-component/ta-template-form-core/types';
import dayjs, { Dayjs } from 'dayjs';
import { PropType, computed, defineComponent, ref, toRefs } from 'vue';

const TaDateTimePicker = defineComponent({
  name: 'TaDateTimePicker',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
    value: { type: [String, Number, Object] as PropType<string | Dayjs>, default: null },
    disabled: { type: Boolean, default: false },
    size: { type: String as PropType<FormItemSize>, default: () => 'regular' },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => {
        if (!props.value) {
          return null;
        }
        const mo = dayjs(props.value);
        return mo.isValid() ? mo : null;
      },
      set: val => {
        if (val && dayjs(val).isValid()) {
          // 这里尝试直接传递 dayjs 对象的格式化字符串
          emit('update:value', dayjs(val).format('YYYY-MM-DD HH:mm:ss'));
        } else {
          emit('update:value', null);
        }
      },
    });

    const viewerValue = computed(() => {
      if (!localValue.value) {
        return null;
      }
      const value = dayjs(localValue.value || undefined);
      return value.isValid() ? value.format('YYYY-MM-DD HH:mm:ss') : null;
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
          return '10px 16px';
        case 'small':
          return '6px 16px';
        case 'large':
          return '14px 16px';
        default:
          return '10px 16px';
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
      dayjs,
      viewerValue,
      calPadding,
      validate,
      flag,
    };
  },
});
export default TaDateTimePicker;
</script>

<template lang="pug">
.ta-date-picker(:class='{ "warn-state": !flag }')
  template(v-if='!disabled')
    a-date-picker.picker(
      v-model:value='localValue',
      :name='item.key',
      :disabled='disabled',
      :placeholder='item.options.placeholder || `请选择${item.name}`',
      :format='item.format || "YYYY-MM-DD HH:mm:ss"',
      :showTime='{ defaultValue: dayjs("09:00:00", "HH:mm:ss") }',
      :style='{ "--inputPadding": calPadding }',
      :size='size',
      dropdownClassName='ant-date-time-picker-popup'
    )
  template(v-else)
    .value {{ viewerValue }}
</template>

<style lang="stylus">
.ant-date-time-picker-popup
  .ant-picker-cell-today
    .ant-picker-cell-inner::before
      border-radius 8px !important
  .ant-picker-cell-selected
    padding 0 !important
    .ant-picker-cell-inner
      color #fff
      background $primary-color
      width 36px
      height 30px
      line-height 30px
      border-radius 8px
      padding 0 !important
  .ant-picker-footer
    border-top 0 !important
    margin-bottom 8px
  .ant-picker-today-btn
    border-radius 8px !important
    border 1px solid $primary-color !important
    padding 8px 114px
    color $primary-color
.ant-picker-date-panel
  // display: none
.ant-picker-ranges
  padding 12px 12px 16px 12px
.ant-picker-header-view
  text-align left
  font-size 12px
  font-weight 500
  // line-height: 17px;
  color #111928
.ant-picker-ok
  .ant-btn-sm
    padding 5px 10px
    height 33px
    width 48px
    font-size 12px
.ant-picker-now-btn
  border-radius 8px !important
  border 1px solid $primary-color !important
  padding 8px 12px
  color $primary-color
  font-size 12px
  font-weight 500
.ant-picker-time-panel-cell-inner
  width 80% !important
  margin 4px auto !important
  border-radius 8px !important
.ant-picker-time-panel-column
  overflow-y overlay !important
.ant-picker-time-panel-column:hover
  overflow-y overlay !important
</style>
<style lang="stylus" scoped></style>

<style lang="stylus" scoped>
.ta-date-picker
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
    color #E02424
  >>>.ant-picker-input
    input
      color #E02424
    input::placeholder
      color #E02424
</style>
