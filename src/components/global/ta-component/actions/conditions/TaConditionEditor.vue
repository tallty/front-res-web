<script lang="ts">
import { ref, defineComponent, toRefs, computed } from 'vue';
import { TaConditionType } from '../types';
import { VObject } from '@/lib/vails';

export const TaConditionTypeConfigMapping: VObject = {
  [TaConditionType.Lifecycle]: {
    label: '生命周期',
    icon: 'RetweetOutlined',
  },
  [TaConditionType.Group]: {
    label: '条件组',
    icon: 'GroupOutlined',
  },
  [TaConditionType.User]: {
    label: '用户条件',
    icon: 'UserOutlined',
  },
  [TaConditionType.Old]: {
    label: '值条件',
    icon: 'FileTextOutlined',
  },
  [TaConditionType.MultiBpmAction]: {
    label: '工作流操作',
    icon: 'ForkOutlined',
  },
};

const TaConditionEditor = defineComponent({
  name: 'TaConditionEditor',
  components: {},
  props: {
    value: { type: Object, default: () => ({}) },
    dataFormOptions: { type: Array, default: () => [] },
    activeDataFormOption: { type: Object, default: undefined },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const onChangeType = ({ key }: any) => {
      localValue.value.type = key;
    };

    const groupEditor = ref<any>(null);

    return {
      ...toRefs(props),
      localValue,
      TaConditionTypeConfigMapping,
      TaConditionType,
      onChangeType,
      groupEditor,
    };
  },
});
export default TaConditionEditor;
</script>

<template lang="pug">
.ta-condition-editor.pl-1.h-full.flex.items-center(
  :class='{ "bg-primary-100": !(value.type == TaConditionType.Group && !groupEditor) }'
)
  .condition-label.flex-shrink-0.flex
    a-dropdown.switch.cursor-pointer
      .flex.items-center.justify-center.bg-primary.w-10.min-h-10.rounded-l
        TaIcon.text-white(
          v-if='TaConditionTypeConfigMapping[localValue.type]?.icon',
          :type='TaConditionTypeConfigMapping[localValue.type]?.icon',
          color='white',
        )
        .text-white.text-xs(v-else) 请选择
      template(#overlay)
        a-menu(@click='onChangeType')
          a-menu-item(v-for='(option, key) in TaConditionTypeConfigMapping', :key='key')
            .flex.items-center
              TaIcon(:type='option.icon')
              span.ml-1 {{ option.label }}

  .condition-content.items-center.flex.max-w-100.w-fit.flex-shrink-0
    template(v-if='value.type === TaConditionType.Lifecycle')
      TaConditionLifecycleEditor.px-2(
        v-model:value='localValue',
        :disabled='disabled',
        :dataFormOptions='dataFormOptions'
      )

    template(v-else-if='value.type === TaConditionType.Group')
      slot(name='condition-group')
        TaConditionGroupEditor.px-2(
          ref='groupEditor'
          v-model:value='localValue',
          :disabled='disabled',
          :dataFormOptions='dataFormOptions'
        )

    template(v-else-if='value.type === TaConditionType.User')
      TaConditionUserEditor.px-2(
        v-model:value='localValue',
        :disabled='disabled',
      )

    template(v-else-if='value.type === TaConditionType.Old')
      TaConditionOldEditor.px-2(
        v-model:value='localValue',
        :disabled='disabled',
        :activeDataFormOption='activeDataFormOption',
      )

    template(v-else-if='value.type === TaConditionType.BpmAction')
      TaConditionBpmActionEditor.px-2(
        v-model:value='localValue',
        :disabled='disabled',
      )

    template(v-else-if='value.type === TaConditionType.MultiBpmAction')
      TaConditionMultiBpmActionEditor.px-2(
        v-model:value='localValue',
        :disabled='disabled',
      )
</template>

<style lang="stylus" scoped>
.w-fit
  width fit-content
.bg-primary
  background $primary-color
.bg-primary-100
  background lighten($primary-color, 80%)
</style>
