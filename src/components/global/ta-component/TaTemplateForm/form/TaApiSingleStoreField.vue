<script lang="ts">
import { defineComponent, toRefs, PropType, computed } from 'vue';
import { TaTemplateFormTableItem, TaTemplateFormItem } from '../../ta-template-form-core/types';
import { VObject } from '@/lib/vails/model';
import { TaSelectableFieldProps } from './selectable/TaSelectableField.vue';
import { TaIndexTreeItem } from '../../TaIndexView/ta-index-view-core/types';

const TaApiSingleStoreField = defineComponent({
  name: 'TaApiSingleStoreField',
  components: {},
  props: {
    value: { type: Object, default: () => ({}) },
    path: { type: String, required: true },
    ransackStr: { type: String, default: '' },
    ...TaSelectableFieldProps,
  },
  setup(props, { emit }) {
    const localValue = computed<VObject>({
      get: () => [props.value],
      set: val => emit('update:value', val[0] || null),
    });

    const onExpand = (expanded: boolean, record: VObject, item: TaIndexTreeItem) => {
      emit('expand', expanded, record, item);
    };

    return {
      ...toRefs(props),
      localValue,
      onExpand,
    };
  },
});
export default TaApiSingleStoreField;
</script>

<template lang="pug">
.ta-api-single-store-field
  TaApiStoreField(
    v-bind='$props'
    v-model:value='localValue',
    @expand='onExpand',
  )
</template>

<style lang="stylus" scoped></style>
