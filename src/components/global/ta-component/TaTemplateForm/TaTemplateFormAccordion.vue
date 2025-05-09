<script lang="ts">
import { defineComponent, toRefs, PropType, provide, ref, computed } from 'vue';
import { TaTemplateFormItem } from '../ta-template-form-core/types';
import useAccordion from '../ta-template-form-core/useAccordion';

const TaTemplateFormAccordion = defineComponent({
  name: 'TaTemplateFormAccordion',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    isParentContainer: { type: Boolean, default: false },
  },
  setup(props) {
    const { fieldComponents, addField, removeField, collapseStats } = useAccordion();

    const collapsed = ref(
      props.item.options?.collapse && !props.item.options?.collapse_default_open,
    );

    const height = computed(() => (collapsed.value ? '0' : 'fit-content'));
    const isContainerCollapse = computed(() => {
      return props.item?.options?.collapse;
    });
    return {
      ...toRefs(props),
      fieldComponents,
      addField,
      removeField,
      collapseStats,
      collapsed,
      height,
      isContainerCollapse,
    };
  },
  created() {
    provide('accordion', this);
  },
});
export default TaTemplateFormAccordion;
</script>

<template lang="pug">
.ta-template-form-accordion(:class='isContainerCollapse ? "bg-white rounded-xl mt-4" :undefined')
  .flex.items-center.cursor-pointer.text-gray-900.font-medium.p-4.border-b-1(
    v-if='item.options?.collapse'
    @click='() => collapsed = !collapsed',
  )
    span.text-base {{ item.name }}
    span(v-if='item.options?.collapse_stats') {{ collapseStats }}
    TaIcon.transform.mr-1(type='solid/chevron-up', :class='{ "rotate-180": !collapsed }')
  .ta-template-form-accordion-body.overflow-hidden(:class='isContainerCollapse && !collapsed ? "bg-white p-4 rounded-b-xl" :undefined')
    template(v-if='isParentContainer')
      .bg-gray-100.h-fit.rounded-xl.ta-template-form-accordion-body-isparentContainer
        slot
    template(v-else-if='item.type === "condition"')
      .bg-transparent
        slot
    template(v-else)
      slot
</template>

<style lang="stylus" scoped>
.ta-template-form-accordion-body
  height v-bind(height)
</style>
