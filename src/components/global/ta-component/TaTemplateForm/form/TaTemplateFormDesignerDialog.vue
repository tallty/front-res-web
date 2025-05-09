<script lang="ts">
import { defineComponent, toRefs, computed, ref } from 'vue';

const TaTemplateFormDesignerDialog = defineComponent({
  name: 'TaTemplateFormDesignerDialog',
  components: {},
  props: {
    value: { type: Object, default: () => ({}) },
    disabled: { type: Boolean, default: false },
    showOverview: { type: Boolean, default: true },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const visible = ref(false);
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const onShowDialog = () => (visible.value = true);
    const onCloseDialog = () => (visible.value = false);

    const designer = ref<any>(null);
    const validate = () => designer.value?.validate?.() || Promise.resolve();

    return {
      ...toRefs(props),
      visible,
      localValue,
      onShowDialog,
      onCloseDialog,
      designer,
      validate,
    };
  },
});
export default TaTemplateFormDesignerDialog;
</script>

<template lang="pug">
.ta-form-designer-dialog
  template(v-if='!disabled')
    slot(:open='onShowDialog')
      .flex.space-x-2
        a-button(type='primary', @click='onShowDialog') 编辑
        TaJsonImportExport(v-model:value='localValue')

  TaTemplateFormViewer(v-if='disabled && localValue && showOverview', :template='localValue', :record='{ formData: {} }')

TaNoPaddingDrawer(
  v-model:visible='visible',
  v-if='!disabled',
  title='表单字段',
  width='100%',
  class='full-modal',
  @ok='onCloseDialog'
)
  TaTemplateFormDesigner(ref='designer', v-model:value='localValue')
</template>

<style lang="stylus">
.full-modal
  .ant-modal
    max-width 100%
    top 0
    padding-bottom 0
    margin 0
  .ant-modal-content
    height 100vh
    display flex
    flex-direction column
  .ant-modal-body
    flex 1
    height 70vh
</style>
