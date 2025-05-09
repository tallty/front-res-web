<script lang="ts">
import { defineComponent, toRefs, PropType, computed } from 'vue';
import { VObject } from '@/lib/vails';
import { TaTriggerType, TaTrigger } from '../types';
import { TaTemplateFormSelect } from '../../ta-template-form-core/types';

export const TaTriggerTypeConfigMapping: VObject = {
  [TaTriggerType.ActiveRecord]: {
    label: '生成对象',
    icon: 'PlusSquareOutlined',
  },
  [TaTriggerType.DataFormRecordMethod]: {
    label: '链接对象方法',
    icon: 'MacCommandOutlined',
  },
  [TaTriggerType.Function]: {
    label: '类方法',
    icon: 'FunctionOutlined',
  },
  [TaTriggerType.SourceMethod]: {
    label: '关联对象方法',
    icon: 'LinkOutlined',
  },
  [TaTriggerType.BpmCreateInstance]: {
    label: '创建工作流',
    icon: 'BranchesOutlined',
  },
  [TaTriggerType.BpmCreateToken]: {
    label: '创建工作流节点',
    icon: 'NodeIndexOutlined',
  },
  [TaTriggerType.BpmSmsNotify]: {
    label: '工作流短信通知',
    icon: 'MessageOutlined',
  },
  [TaTriggerType.PerfUnitDefine]: {
    label: '生成指标定义',
    icon: 'InfoOutlined',
  },
};

const TaTriggerEditor = defineComponent({
  name: 'TaTriggerEditor',
  components: {},
  props: {
    value: { type: Object as PropType<TaTrigger>, required: true },
    disabled: { type: Boolean, default: false },
    dataFormOptions: { type: Array as PropType<TaTemplateFormSelect[]>, default: () => [] },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const onChangeType = ({ key }: any) => {
      localValue.value.type = key;
    };

    return {
      ...toRefs(props),
      localValue,
      onChangeType,
      TaTriggerTypeConfigMapping,
      TaTriggerType,
    };
  },
});
export default TaTriggerEditor;
</script>

<template lang="pug">
.ta-trigger-editor.flex.items-center.h-full
  .trigger-label.flex-shrink-0.flex
    a-dropdown.switch.cursor-pointer
      .flex.items-center.justify-center.bg-primary.w-10.min-h-10.rounded-l
        TaIcon.text-white(
          v-if='TaTriggerTypeConfigMapping[localValue.type]?.icon',
          :type='TaTriggerTypeConfigMapping[localValue.type]?.icon'
          color='white',
        )
        .text-white.text-xs(v-else) 请选择
      template(#overlay)
        a-menu(@click='onChangeType')
          a-menu-item(v-for='(option, key) in TaTriggerTypeConfigMapping', :key='key')
            .flex.items-center
              TaIcon(:type='option.icon')
              span.ml-1 {{ option.label }}

  .trigger-content.items-center.flex.max-w-100.bg-primary-100.h-10
    template(v-if='value.type === TaTriggerType.ActiveRecord')
      TaTriggerActiveRecordEditor.px-2(
        v-model:value='localValue',
        :disabled='disabled',
        :dataFormOptions='dataFormOptions'
      )
    template(v-else-if='value.type === TaTriggerType.DataFormRecordMethod')
      TaTriggerDataFormRecordMethodEditor.px-2(
        v-model:value='localValue',
        :disabled='disabled',
      )
    template(v-else-if='value.type === TaTriggerType.Function')
      TaTriggerFunctionEditor.px-2(
        v-model:value='localValue',
        :disabled='disabled',
      )
    template(v-else-if='value.type === TaTriggerType.SourceMethod')
      TaTriggerSourceMethodEditor.px-2(
        v-model:value='localValue',
        :disabled='disabled',
      )
    template(v-else-if='value.type === TaTriggerType.BpmSmsNotify')
      TaTriggerBpmSmsNotifyEditor.px-2(
        v-model:value='localValue',
        :disabled='disabled',
      )
    template(v-else-if='value.type === TaTriggerType.BpmCreateInstance')
      TaTriggerBpmCreateInstanceEditor.px-2(
        v-model:value='localValue',
        :disabled='disabled',
      )
    template(v-else-if='value.type === TaTriggerType.BpmCreateToken')
      TaTriggerBpmCreateTokenEditor.px-2(
        v-model:value='localValue',
        :disabled='disabled',
      )
    template(v-else-if='value.type === TaTriggerType.PerfUnitDefine')
      TaTriggerPerfUnitDefineEditor.px-2(
        v-model:value='localValue',
        :disabled='disabled',
      )
</template>

<style lang="stylus" scoped>
.bg-primary
  background $primary-color
.bg-primary-100
  background lighten($primary-color, 80%)
</style>
