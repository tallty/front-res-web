<script lang="ts">
import { VModel } from '@/lib/vails';
import { defineComponent, toRefs, computed, PropType } from 'vue';
import {
  TaTemplateFormItem,
  TaTemplateFormStepsStep,
} from '@/components/global/ta-component/ta-template-form-core/types';
import { VObject } from '@/lib/vails/model';

// NOTE: 已弃用
const TaTemplateFormDrawer = defineComponent({
  name: 'TaTemplateFormDrawer',
  components: {},
  emits: [
    'update:visible',
    'update:editable',
    'afterSave',
    'afterDelete',
    'afterSaveAndCreateNext',
  ],
  props: {
    visible: { type: Boolean, default: false },
    template: {
      type: [Object, String] as PropType<TaTemplateFormItem | string>,
      required: true,
    },
    record: { type: Object as PropType<VModel & VObject>, default: () => ({}) },
    modelValue: { type: Object, default: null },
    title: { type: String, default: '表单' },
    editable: { type: Boolean, default: true },
    steps: { type: Array as PropType<TaTemplateFormStepsStep[]>, default: () => [] },
  },
  setup(props, { emit }) {
    const localVisible = computed({
      get: () => props.visible,
      set: val => emit('update:visible', val),
    });
    const localEditable = computed({
      get: () => props.editable,
      set: val => emit('update:editable', val),
    });

    const afterSave = () => {
      emit('afterSave');
    };

    const afterDelete = () => {
      emit('afterDelete');
    };

    const afterSaveAndCreateNext = () => {
      emit('afterSaveAndCreateNext');
    };

    return {
      ...toRefs(props),
      localVisible,
      localEditable,
      afterSave,
      afterDelete,
      afterSaveAndCreateNext,
    };
  },
});
export default TaTemplateFormDrawer;
</script>

<template lang="pug">
a-drawer(
  v-if='localVisible',
  v-model:visible='localVisible',
  :closeable='false',
  :title='title',
  width='800px'
)
  TaTemplateFormDetailSwitch(
    v-model:visible='localVisible',
    v-model:editable='localEditable',
    v-model='modelValue',
    :template='template',
    :steps='steps',
    :record='record',
    :title='title',
    @afterSave='afterSave',
    @afterDelete='afterDelete',
    @afterSaveAndCreateNext='afterSaveAndCreateNext'
  )
</template>

<style lang="stylus" scoped></style>
