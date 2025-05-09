<script lang="ts">
import { defineComponent, toRefs, computed, PropType, ref, onMounted, nextTick } from 'vue';
import { TaTemplateFormStepsStep } from '@/components/global/ta-component/ta-template-form-core/types';

const TaTemplateFormModal = defineComponent({
  name: 'TaTemplateFormModal',
  components: {},
  props: {
    title: { type: String, default: '编辑' },
    visible: { type: Boolean, default: false },
    record: { type: Object, default: undefined },
    modelValue: { type: Object, default: undefined }, // steps 时无用。
    template: { type: Object, required: true, default: () => ({}) },
    disabled: { type: Boolean, default: false },
    context: { type: Object, default: () => ({}) },
    steps: { type: Array as PropType<TaTemplateFormStepsStep[]>, default: () => [] },
  },
  emits: ['update:visible', 'confirm', 'cancel'],
  setup(props, { emit }) {
    const localVisible = computed({
      get: () => props.visible,
      set: val => emit('update:visible', val),
    });

    const onConfirm = () => {
      (form.value?.validate?.() || Promise.resolve()).then(() => {
        emit('confirm', localVisible);
        localVisible.value = false;
      });
    };

    const form = ref<any>(null);

    const onCancel = () => {
      emit('cancel');
      localVisible.value = false;
    };

    return {
      ...toRefs(props),
      localVisible,
      form,
      onConfirm,
      onCancel,
    };
  },
});
export default TaTemplateFormModal;
</script>

<template lang="pug">
TaNoPaddingModal(
  :visible='localVisible',
  :title='title',
  :bodyStyle='{ overflow: "auto", height: "fit-content" }',
  :modalContentStyle='{ "border-radius": "0.75rem", overflow: "hidden" }',
  width='50vw',
  @cancel='onCancel',
  @ok='onConfirm',
)
  .overflow-y-auto.form-shell
    slot(name='formTop',:record='record')
    template(v-if='steps.length == 0')
      TaTemplateForm.h-fit.px-6(
        v-if='!disabled',
        ref='form',
        v-model:modelValue='modelValue',
        :template='template',
        :steps='steps',
        :context='context',
        :record='record'
      )
      TaTemplateFormViewer.h-fit.px-6(
        v-else,
        :modelValue='modelValue',
        :template='template',
        :steps='steps',
        :context='context',
        :record='record'
      )
    template(v-else)
      TaTemplateFormSteps.w-full.steps-no-auto-height(
        ref='form',
        v-model:values='record.formData',
        :steps='steps',
        :record='record'
        :disabled='disabled'
        :isPlane='true'
        :context='context',
        :actionable='false',
      )
</template>

<style lang="stylus" scoped>
.form-shell
  max-height 70vh
.steps-no-auto-height
  >>> .form
    width 100% !important
    margin 0 !important
  >>> .ta-template-form-steps__shell
    height auto
  >>> .content
    height auto
</style>
