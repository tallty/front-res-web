<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

const TaTagField = defineComponent({
  name: 'TaTagField',
  props: {
    value: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const inputValue = ref('');
    const inputVisible = ref(false);

    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    if (typeof localValue.value === 'string') {
      localValue.value = [localValue.value];
    }

    const onClose = (index: number) => {
      localValue.value.splice(index, 1);
    };

    const onInputConfirm = () => {
      let tags = props.value || [];
      if (inputValue.value && tags.indexOf(inputValue.value) === -1) {
        tags = [...tags, inputValue.value];
      }
      inputVisible.value = false;
      inputValue.value = '';
      localValue.value = tags;
    };

    const onInputChange = (e: any) => {
      inputValue.value = e.target.value;
    };

    const onShowInput = () => {
      inputVisible.value = true;
    };

    return {
      inputValue,
      inputVisible,
      onClose,
      onInputConfirm,
      onInputChange,
      onShowInput,
    };
  },
});

export default TaTagField;
</script>

<template lang="pug">
.tag-fields
  template(v-for="(tag, index) in value", :key="tag")
    a-tag(closable="true" @close="() => onClose(index)")
      | {{ tag }}
  a-input(
    v-if="inputVisible"
    type="text"
    size="small"
    :style="{ width: '78px' }"
    :value="inputValue"
    @change="onInputChange"
    @blur="onInputConfirm"
    @keyup.enter="onInputConfirm"
  )
  a-tag(v-else-if='!disabled' style="background: #fff; borderStyle: dashed;" @click="onShowInput")
    TaIcon(type="PlusOutlined")
    span 新建
</template>

<style lang="stylus" scoped></style>
