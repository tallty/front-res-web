<script lang="ts">
import { defineComponent, toRefs, PropType, computed, ref, provide } from 'vue';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';
import { VObject } from '@/lib/vails/model';
import { useFormProvide } from '../ta-template-form-core/useForm';

const TaTemplateFormListLayoutTableItem = defineComponent({
  name: 'TaTemplateFormListLayoutTableItem',
  components: {},
  props: {
    template: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    record: { type: Object as PropType<VObject>, default: () => ({}) },
    isList: { type: Boolean, default: false },
  },
  created() {
    useFormProvide(this);
  },
  setup(props) {
    provide('isViewer', true);

    const field = ref<any>(null);
    const hidden = computed(() => field.value?.hidden);
    const fieldValue = computed(() => field.value?.value);
    const value = computed(() => props.record);

    return {
      ...toRefs(props),
      field,
      value,
      fieldValue,
      hidden,
    };
  },
});
export default TaTemplateFormListLayoutTableItem;
</script>

<template lang="pug">
.ta-template-form-list-layout-table-item
  TaTemplateFormListLayout(v-if='isList', ref='field', :item='template', :needTableActions='false')
  TaTemplateFormField(v-else, ref='field', :item='template')
</template>

<style lang="stylus" scoped></style>
