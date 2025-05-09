<script lang="ts">
import { defineComponent, toRefs, PropType, computed } from 'vue';
import { TaTemplateFormStepsStep } from '../ta-template-form-core/types';

const TaTemplateFormStepsDialog = defineComponent({
  name: 'TaTemplateFormStepsDialog',
  components: {},
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '' },
    record: { type: Object, default: () => ({}) },
    values: { type: Object, required: true },
    steps: { type: Array as PropType<TaTemplateFormStepsStep[]>, default: () => [] },
  },
  emits: ['update:visible', 'update:values', 'complete', 'cancel'],
  setup(props, { emit }) {
    const localVisible = computed({
      get: () => props.visible,
      set: val => emit('update:visible', val),
    });

    const localvalues = computed({
      get: () => props.values,
      set: val => emit('update:values', val),
    });

    const onCancel = () => {
      // 需要恢复状态
      emit('cancel');
      localVisible.value = false;
    };

    const onComplete = () => {
      emit('complete');
      localVisible.value = false;
    };

    return {
      ...toRefs(props),
      localvalues,
      localVisible,
      onCancel,
      onComplete,
    };
  },
});
export default TaTemplateFormStepsDialog;
</script>

<template lang="pug">
a-modal(
  v-model:visible='localVisible',
  :title='title',
  :footer='null'
  :width='900'
)
  TaTemplateFormSteps.steps-comp(
    v-if='localVisible',
    v-model:values='localvalues',
    :record='record'
    :steps='steps'
    @cancel='onCancel'
    @complete='onComplete'
  )
</template>

<style lang="stylus" scoped>
.steps-comp
  >>> .steps-content
    width 80%
  >>> .step-content
    width 60%
</style>
