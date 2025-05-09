<script lang="ts">
import { defineComponent, toRefs, computed, ref } from 'vue';

// json editor 的值 无法响应式更改，及时同步了还需要激活输入框才能更改，
// 所以就有了该组件
const TaJsonEditorWithButton = defineComponent({
  name: 'TaJsonEditorWithButton',
  components: {},
  props: {
    value: { type: Object, default: () => ({}) },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const visible = ref(false);
    const valueCache = ref(localValue.value);

    const onOpen = () => {
      valueCache.value = localValue.value;
      visible.value = true;
    };

    const onOk = () => {
      localValue.value = valueCache.value;
      visible.value = false;
    };

    return {
      ...toRefs(props),
      localValue,
      visible,
      valueCache,
      onOpen,
      onOk,
    };
  },
});
export default TaJsonEditorWithButton;
</script>

<template lang="pug">
.ta-json-editor-with-button
  a-button(type='primary', @click='onOpen')
    | 编辑
  a-modal(v-model:visible='visible', @ok='onOk', @cancel='() => visible = false')
    TaJsonEditor(v-if='visible', v-model:value='valueCache')
</template>

<style lang="stylus" scoped>
// .ta-json-editor-with-button
</style>
