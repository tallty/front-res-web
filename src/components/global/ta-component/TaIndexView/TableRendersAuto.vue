<script lang="ts">
import { defineComponent, toRefs, PropType, computed } from 'vue';
import {
  TaTemplateFormItem,
  TaTemplateFormSelect,
  TaTemplateFormColumnAttribute,
} from '../ta-template-form-core/types';

const TableRendersAuto = defineComponent({
  name: 'TableRendersAuto',
  components: {},
  inheritAttrs: false,
  props: {
    value: { type: [String, Number, Object, Array, Boolean], default: '' },
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    column: { type: Object as PropType<TaTemplateFormColumnAttribute>, default: () => ({}) },
  },
  setup(props, { slots }) {
    const formattedValue = computed(() => {
      if (props.item?.options?.select) {
        const label = props.item?.options?.select.find(
          (i: TaTemplateFormSelect) =>
            (props.value && props.value === i.value) || props.value === i.label,
        )?.label;

        if (label) return label;
      }
      return props.value;
    });

    // const slotEmpty = computed(
    //   () => slots.default && (slots.default()[0].children as any[]).length > 0,
    // );

    return {
      ...toRefs(props),
      formattedValue,
      // slotEmpty,
    };
  },
});
export default TableRendersAuto;
</script>

<template lang="pug">
//- slot(v-if='slotEmpty')
//- TaCellValueFormatter(v-else, :value='formattedValue', :column='column')
slot
  TaCellValueFormatter(:value='formattedValue', :column='column')
</template>

<style lang="stylus" scoped></style>
