<script lang="ts">
import { ref, defineComponent, toRefs, PropType } from 'vue';
import { DataFormFormConfInterface } from '../ta-template-form-core/data_form/types';
import { computed } from '@vue/reactivity';
import { DataFormConfTemplate } from './template';

const TaDataFormConfCard = defineComponent({
  name: 'TaDataFormConfCard',
  components: {},
  props: {
    value: { type: Object as PropType<DataFormFormConfInterface>, default: () => ({}) },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: value => emit('update:value', value),
    });

    const visibleEdit = ref(false);

    const onEdit = () => {
      visibleEdit.value = true;
    };

    const onDelete = () => emit('delete', props.value);

    return {
      ...toRefs(props),
      localValue,
      visibleEdit,
      onEdit,
      onDelete,
      DataFormConfTemplate,
    };
  },
});
export default TaDataFormConfCard;
</script>

<template lang="pug">
.ta-data-form-conf-card.min-w-50.flex.items-center.p-4.justify-between.shadow.w-fit.rounded-lg
  .text-gary-700(v-if='value.name') {{ value.name }}
  .text-gray-400(v-else) 未命名

  .actions.flex.itemsc-enter.space-x-2(v-if='!disabled')
    TaIcon(type='EditOutlined', @click='onEdit')
    TaPopoverConfirm(
      title='删除',
      content='确认删除该表单项？',
      @confirm='onDelete',
    )
      TaIcon(type='DeleteOutlined')

  TaTemplateFormWithActionsModal(
    v-if='visibleEdit',
    v-model:visible='visibleEdit',
    v-model:modelValue='localValue',
    :title='value.name || "未命名"',
    :template='DataFormConfTemplate',
    okText='关闭'
  )
</template>

<style lang="stylus" scoped>
.w-fit
  width fit-content
</style>
