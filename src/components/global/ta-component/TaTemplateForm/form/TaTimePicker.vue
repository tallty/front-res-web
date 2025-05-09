<script lang="ts">
import { defineComponent, toRefs, PropType, computed, ref } from 'vue';
import {
  FormItemSize,
  TaTemplateFormItem,
} from '@/components/global/ta-component/ta-template-form-core/types';
import dayjs, { Dayjs } from 'dayjs';

const TaTimePicker = defineComponent({
  name: 'TaTimePicker',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
    value: { type: [String, Object] as PropType<string | Dayjs>, default: '' },
    disabled: { type: Boolean, default: false },
    size: { type: String as PropType<FormItemSize>, default: () => 'regular' },
  },
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
      set: val => emit('update:value', val),
    });

    const viewerValue = computed(() => {
      const value = dayjs(localValue.value || undefined);
      return value.isValid() ? value.format('HH:mm:ss') : null;
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
      viewerValue,
      calPadding,
      flag,
    };
  },
});
export default TaTimePicker;
</script>

<template lang="pug">
.ta-time-picker(:class="{'warn-state': !flag}")
  template(v-if='!disabled')
    a-date-picker.picker(
      v-model:value='localValue',
      :name='item.key',
      :disabled='disabled',
      :placeholder='item.options.placeholder || `请选择${item.name}`',
      :style="{'--inputPadding': calPadding}"
      dropdownClassName='ant-time-picker-popup'
      format="HH:mm:ss",
      :flag="flag",
      show-time
    )
      template(#suffixIcon)
        TaIcon(type="ClockCircleOutlined")

  template(v-else)
    .value {{ viewerValue }}
</template>

<style lang="stylus">
.ant-time-picker-popup
  .ant-picker-date-panel
    // display: none
  .ant-picker-ranges
    padding 12px 12px 16px 12px
  .ant-picker-header-view
    text-align left
    font-size: 12px;
    font-weight: 500;
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
    font-size: 12px;
    font-weight: 500;
  .ant-picker-time-panel-cell-inner
    width: 80% !important
    margin: 4px auto !important
    border-radius: 8px !important
  .ant-picker-time-panel-column
    overflow-y: overlay !important
  .ant-picker-time-panel-column:hover
    overflow-y: overlay !important
</style>

<style lang="stylus" scoped>
.ta-time-picker
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
