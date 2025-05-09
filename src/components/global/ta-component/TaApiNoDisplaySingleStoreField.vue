<script lang="ts">
import { ref, defineComponent, toRefs, PropType, computed } from 'vue';
import { TaTemplateFormTableItem } from './ta-template-form-core/types';

const TaApiNoDisplaySingleStoreField = defineComponent({
  name: 'TaApiNoDisplaySingleStoreField',
  components: {},
  props: {
    value: { type: Number, default: null },
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
    const localValue = computed<number[]>({
      get: () => [props.value],
      set: val => emit('update:value', val[0] || null),
    });

    const openComp = ref<any>(null);

    const onOk = () => emit('ok');

    const open = () => openComp.value.open();

    return {
      ...toRefs(props),
      openComp,
      onOk,
      localValue,
      open,
    };
  },
});
export default TaApiNoDisplaySingleStoreField;
</script>

<template lang="pug">
.ta-api-no-display-single-store-field
  TaApiNoDisplayStoreField(
    ref='openComp',
    v-bind='$props',
    v-model:value='localValue',
    @ok='onOk',
  )
</template>

<style lang="stylus" scoped></style>
