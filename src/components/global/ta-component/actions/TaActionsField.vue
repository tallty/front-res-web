<script lang="ts">
import { ref, defineComponent, toRefs, computed, onMounted, watch } from 'vue';
import { cloneDeep } from 'lodash';

const TaActionsField = defineComponent({
  name: 'TaActionsField',
  components: {},
  props: {
    value: { type: Object, default: () => ({}) },
    disabled: { type: Boolean, default: false },
    dataFormOptions: { type: Array, default: () => [] },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const onDelete = (index: number) => {
      const result = cloneDeep(localValue.value);
      result.splice(index, 1);
      localValue.value = result;
    };

    const onAdd = () => {
      const result = cloneDeep(localValue.value);
      result.push({
        pipeline: {},
        condition: {},
        trigger: {},
      });
      localValue.value = result;
    };

    return {
      ...toRefs(props),
      localValue,
      onDelete,
      onAdd,
    };
  },
});
export default TaActionsField;
</script>

<template lang="pug">
.ta-actions-field.actions.overflow-auto.space-y-4.mt-2(v-if='localValue')
  TaActionEditor(
    v-for='(action, index) in localValue',
    v-model:value='localValue[index]',
    :disabled='disabled'
    :dataFormOptions='dataFormOptions'
    @delete='onDelete(index)'
  )

  .add-action-btn.w-50.mt-2.py-1.cursor-pointer.flex.items-center.justify-center.bg-primary.rounded(
    v-if='!disabled',
    @click.stop='onAdd',
  )
    .add-action-btn-icon.text-white
      | 添加行为
</template>

<style lang="stylus" scoped>
.bg-primary
  background-color $primary-color
</style>
