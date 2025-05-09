<script lang="ts">
import { ref, defineComponent, toRefs, PropType, computed } from 'vue';
import { TaTemplateFormTableItem } from './ta-template-form-core/types';

const TaApiNoDisplayStoreField = defineComponent({
  name: 'TaApiNoDisplayStoreField',
  components: {},
  props: {
    value: { type: Array as PropType<number[]>, default: () => [] },
    path: { type: String, default: '' },
    attrs: { type: Array as PropType<string[]>, default: () => ['name'] },
    recordName: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    tableItems: { type: Array as PropType<TaTemplateFormTableItem[]>, required: true },
    callback: { type: Function, default: () => {} },
    ransackStr: { type: String, default: '{}' },
    display: { type: String as PropType<'tag' | 'table' | 'configurable'>, default: 'tag' },
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

    const open = () => openFunc.value();

    return {
      ...toRefs(props),
      onEmptyMounted,
      onOk,
      localValue,
      open,
    };
  },
});
export default TaApiNoDisplayStoreField;
</script>

<template lang="pug">
.ta-api-no-display-field
  TaApiStoreField(
    v-bind='$props',
    v-model:value='localValue',
    @ok='onOk',
  )
    template(#display='{ open }')
      TaSelectableFieldEmptyPlaceholder(:open='open', @mounted='onEmptyMounted')
</template>

<style lang="stylus" scoped></style>
