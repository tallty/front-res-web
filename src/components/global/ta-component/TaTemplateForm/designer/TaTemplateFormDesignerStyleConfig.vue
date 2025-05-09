<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue';
import { styleTemplate } from './styleTemplate';

const TaTemplateFormDesignerStyleConfig = defineComponent({
  name: 'TaTemplateFormDesignerStyleConfig',
  components: {},
  props: {
    value: { type: Object, default: null },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    return {
      ...toRefs(props),
      localValue,
      styleTemplate,
    };
  },
});
export default TaTemplateFormDesignerStyleConfig;
</script>

<template lang="pug">
.ta-template-designer-style-config
  TaTemplateForm(v-model:modelValue='localValue', :template='styleTemplate', :useDefaultTheme='false')
</template>

<style lang="stylus" scoped>
.ta-template-designer-style-config
  margin 0 20px
</style>
