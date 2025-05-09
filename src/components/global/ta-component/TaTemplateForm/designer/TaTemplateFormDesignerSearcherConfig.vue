<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue';
import { searcherTemplate } from './searcherTemplate';

const TaTemplateFormDesignerSearcherConfig = defineComponent({
  name: 'TaTemplateFormDesignerSearcherConfig',
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
      searcherTemplate,
    };
  },
});
export default TaTemplateFormDesignerSearcherConfig;
</script>

<template lang="pug">
.ta-template-designer-searcher-config
  TaTemplateForm(v-model:modelValue='localValue', :template='searcherTemplate', :useDefaultTheme='false')
</template>

<style lang="stylus" scoped>
.ta-template-designer-searcher-config
  margin 0 20px
</style>
