<script lang="ts">
import { ref, defineComponent, toRefs, computed } from 'vue';
import { cloneDeep } from 'lodash';

const TaActionCapsuleEditor = defineComponent({
  name: 'TaActionCapsuleEditor',
  components: {},
  props: {
    value: { type: Object, required: true },
    label: { type: String, default: '' },
    disableName: { type: Boolean, default: false },
    modelProps: { type: Object, default: () => ({}) },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: value => emit('update:value', value),
    });

    const formData = ref(cloneDeep(props.value));
    const visible = ref(false);

    const onOk = () => {
      localValue.value = cloneDeep(formData.value);
      visible.value = false;
    };

    const onClose = () => {
      formData.value = cloneDeep(localValue.value);
      visible.value = false;
    };

    return {
      ...toRefs(props),
      localValue,
      formData,
      visible,
      onOk,
      onClose,
    };
  },
});
export default TaActionCapsuleEditor;
</script>

<template lang="pug">
.ta-action-capsule-editor.cursor-pointer.ellipsis(
  @click.stop='() => visible = true'
)
  slot

  TaNoPaddingModal(
    v-model:visible='visible',
    v-bind='modelProps',
    @ok='onOk',
    @close='onClose'
  )
    template(#title)
      .flex.items-center
        .flex-shrink-0 {{ label }}
        .flex-shrink-0(v-if='!disableName') &nbsp;-&nbsp;
        TaInput.w-0.flex-grow.mr-6(
          v-if='!disableName',
          v-model:value='formData.name'
          :item='{ options: { placeholder: `请输入名称` }}'
        )

    slot(name='editor', :formData='formData', :updateFormData='val => formData = val')
</template>

<style lang="stylus" scoped></style>
