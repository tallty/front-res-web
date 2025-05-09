<script lang="ts">
import { defineComponent, toRefs, PropType, Component, watch } from 'vue';
import { TaTemplateFormItem } from './types';
import { useFormComponentCondition } from './useCondition';
import { useFormInject } from './useForm';

const TaTemplateFormConditionLayout: Component = defineComponent({
  name: 'TaTemplateFormConditionLayout',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => [] },
  },
  setup(props) {
    const { formComponent } = useFormInject();

    const { enableFields } = useFormComponentCondition(props, formComponent);

    return {
      enableFields,
      formComponent,
      ...toRefs(props),
    };
  },
});
export default TaTemplateFormConditionLayout;
</script>

<template lang="pug">
view.ta-template-form-condition-layout
  TaTemplateFormNormalLayout(:item='{ ...item, fields: enableFields }')
</template>

<style lang="stylus" scoped>
.ta-template-form-condition-layout
  width 100%
</style>
