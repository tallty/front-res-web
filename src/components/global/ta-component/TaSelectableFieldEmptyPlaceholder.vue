<script lang="ts">
import { defineComponent, toRefs, onMounted } from 'vue';

const TaSelectableFieldEmptyPlaceholder = defineComponent({
  name: 'TaSelectableFieldEmptyPlaceholder',
  components: {},
  props: {
    open: { type: Function, required: true },
  },
  setup(props, { emit }) {
    onMounted(() => {
      emit('mounted', props.open);
    });

    return {
      ...toRefs(props),
    };
  },
});
export default TaSelectableFieldEmptyPlaceholder;
</script>

<template lang="pug">
.ta-selectable-field-empty-placeholder
</template>

<style lang="stylus" scoped></style>
