<script lang="ts">
import { defineComponent, toRefs, PropType, Component, computed } from 'vue';
import { TaTemplateFormItem } from './types';
import useOptionsConfig from './useOptionsConfig';
import { useFormInject } from '../../../../components/global/ta-component/ta-template-form-core/useForm';

const TaTemplateFormNormalLayout: Component = defineComponent({
  name: 'TaTemplateFormNormalLayout',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    useDefaultTheme: { type: Boolean, default: false },
    top: { type: Boolean, default: false },
    isParentContainer: { type: Boolean, default: false },
  },
  setup(props) {
    const optionsReactive = computed(() => props.item.options);
    useOptionsConfig(optionsReactive);

    const { formComponent } = useFormInject();

    return {
      ...toRefs(props),
      formComponent,
      isNormalLayout: true,
    };
  },
  created() {
    if (this.formComponent.addField) {
      this.formComponent.addField(this);
    }
  },
  beforeUnmount() {
    if (this.formComponent.removeField) {
      this.formComponent.removeField(this);
    }
  },
});
export default TaTemplateFormNormalLayout;
</script>

<template lang="pug">
view.ta-template-form-normal-layout
  TaTemplateFormThemeCard(
    :item='item',
    :useDefaultTheme='useDefaultTheme',
    :isParentContainer='isParentContainer'
  )
    TaTemplateFormAccordion(:item='item', :top='top',:isParentContainer='item.type === "container_layout"')
      a-row.row
        a-col.col(
          v-for='field in item.fields',
          :key='field.key',
          :span='field.options?.span || 24'
        )
          template(v-if='field.type === "list"')
            TaTemplateFormListLayout(:item='field')
          template(v-else-if='field.type === "condition"')
            TaTemplateFormConditionLayout(:item='field')
          template(
            v-else-if='field.type === "layout" || field.type === "key_layout" || field.type === "container_layout"'
          )
            TaTemplateFormNormalLayoutCopy(:item='field', :isParentContainer='item.type === "container_layout"')
          template(v-else)
            TaTemplateFormField(:item='field')
</template>

<style lang="stylus">
.ta-template-form-normal-layout
  width 100%
  .row
    width 100%
    height 100%
</style>
