<script lang="ts">
import { defineComponent, toRefs, PropType, computed } from 'vue';
import { TaIndexViewAction } from '../../TaIndexView/ta-index-view-core/types';
import actionTemplate from './actionTemplate';

const defaultActions: TaIndexViewAction[] = [
  { key: 'create', enabled: true },
  { key: 'update', enabled: true },
  { key: 'delete', enabled: true },
  { key: 'import', enabled: true },
  { key: 'export', enabled: true },
];

const TaTemplateFormDesignerActionConfig = defineComponent({
  name: 'TaTemplateFormDesignerActionConfig',
  components: {},
  props: {
    value: { type: Array as PropType<TaIndexViewAction[]>, default: null },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const localValue = computed({
      get: () => {
        if (!props.value) emit('update:value', defaultActions);
        return { actions: props.value };
      },
      set: val => emit('update:value', val.actions),
    });

    const onResetToDefault = () => {
      emit('update:value', defaultActions);
    };

    return {
      ...toRefs(props),
      actionTemplate,
      localValue,
      onResetToDefault,
    };
  },
});
export default TaTemplateFormDesignerActionConfig;
</script>

<template lang="pug">
.ta-template-designer-action-config
  .w-full.flex.justify-end.mb-4.px-4
    a-button(type='primary', @click='onResetToDefault') 恢复默认
  TaTemplateForm(v-model:modelValue='localValue', :template='actionTemplate')
</template>

<style lang="stylus" scoped>
.ta-template-designer-action-config
  margin 0 20px
</style>
