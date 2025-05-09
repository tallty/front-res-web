<script lang="ts">
import { ref, defineComponent, toRefs, PropType, computed } from 'vue';
import { TaTemplateFormModelKeyConfiguration } from '../../ta-template-form-core/types';

const TaTemplateFormDesignerModelKeyConfigurationConfig = defineComponent({
  name: 'TaTemplateFormDesignerModelKeyConfigurationConfig',
  components: {},
  props: {
    value: { type: Array as PropType<TaTemplateFormModelKeyConfiguration[]>, default: () => [] },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    return {
      ...toRefs(props),
      localValue,
    };
  },
});
export default TaTemplateFormDesignerModelKeyConfigurationConfig;
</script>

<template lang="pug">
.ta-template-form-designer-model-key-configuration-config.space-y-2
  .configuration-item.border.rounded.relative.px-2.py-4(v-for='(configuration, index) in localValue')
    .absolute.-top-2.right-2.bg-primary.text-white.px-1.rounded {{ configuration.label }}
    .content.space-y-2
      .flex.items-center
        .label.flex-shrink-0 描述语：
        a-input.value(v-model:value='localValue[index].custom_label')
      .flex.items-center
        .label.flex-shrink-0 关键字：
        a-input.value(v-model:value='localValue[index].model_key')



</template>

<style lang="stylus" scoped>
.bg-primary
  background $primary-color
</style>
