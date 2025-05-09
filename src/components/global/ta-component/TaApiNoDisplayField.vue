<script lang="ts">
import { ref, defineComponent, toRefs, PropType, computed } from 'vue';
import { TaTemplateFormTableItem, TaTemplateFormItem } from './ta-template-form-core/types';
import { TaSelectableFieldProps } from './TaTemplateForm/form/selectable/TaSelectableField.vue';

const TaApiNoDisplayField = defineComponent({
  name: 'TaApiNoDisplayField',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    value: { type: Number, default: null },
    path: { type: String, default: '' },
    ransackStr: { type: String, default: '' },
    ...TaSelectableFieldProps,
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const openFunc = ref<() => void>(() => {});

    const onEmptyMounted = (open: () => void) => {
      openFunc.value = open;
    };

    const onOk = () => emit('ok');
    const onCancel = () => emit('cancel');

    const open = () => openFunc.value();
    const comp = ref<any>(null);

    return {
      ...toRefs(props),
      onEmptyMounted,
      onOk,
      localValue,
      open,
      comp,
      onCancel,
    };
  },
});
export default TaApiNoDisplayField;
</script>

<template lang="pug">
.ta-api-no-display-field
  TaApiField(
    v-bind='$props',
    ref='comp',
    v-model:value='localValue',
    @ok='onOk',
    @cancel='onCancel',
  )
    template(#display='{ open }')
      TaSelectableFieldEmptyPlaceholder(:open='open', @mounted='onEmptyMounted')

    template(#modal-header)
      slot(name='modal-header')

    template(#right-actions)
      slot(name='right-actions')

    template(#modal-footer-left)
      slot(name='modal-footer-left')

    template(#card='{ record, index, no, isActive, actions }')
      slot(
        name='card',
        :record='record',
        :index='record',
        :no='no',
        :isActive='isActive',
        :actions='actions'
      )
</template>

<style lang="stylus" scoped></style>
