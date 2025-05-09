<script lang="ts">
import { ref, defineComponent, toRefs, PropType } from 'vue';
import { computed } from '@vue/reactivity';
import { DataFormFormSettingInterface } from '../ta-template-form-core/data_form/types';
import { TaTemplateFormSelect } from '../ta-template-form-core/types';

const TaFormSettingDesignerDialog = defineComponent({
  name: 'TaFormSettingDesignerDialog',
  components: {},
  props: {
    value: {
      type: Object as PropType<DataFormFormSettingInterface>,
      default: undefined,
    },
    disabled: { type: Boolean, default: false },
    title: { type: String, default: '表单配置' },
    dataFormOptions: { type: Array as PropType<TaTemplateFormSelect[]>, default: undefined },
  },
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
export default TaFormSettingDesignerDialog;
</script>

<template lang="pug">
.ta-form-setting-designer-dialog
  template(v-if='!disabled')
    slot(:open='onShowDialog')
      .flex.space-x-2
        a-button(type='primary', @click='onShowDialog') 编辑
        TaJsonImportExport(v-model:value='localValue')

TaNoPaddingDrawer(
  v-model:visible='visible',
  v-if='!disabled',
  title='表单字段',
  width='100%',
  class='full-modal',
  @ok='onCloseDialog'
)
  TaFormSettingDesigner.p-0.h-full.w-full(ref='designer', v-model:value='localValue', v-bind='$props')
</template>

<style lang="stylus" scoped></style>
