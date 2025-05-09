<script lang="ts">
import { ref, defineComponent, toRefs, computed, PropType } from 'vue';
import { TaBuilderSlotProp, TaBuilderProp, propIsSlotProp } from '../types';
import { TaTemplateFormItem } from '../../ta-template-form-core/types';

const TaBuilderConditionTool = defineComponent({
  name: 'TaBuilderConditionTool',
  components: {},
  props: {
    activeItem: { type: Object, default: () => ({}) },
    keywordTemplate: {
      type: Object as PropType<TaTemplateFormItem>,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const visible = ref(false);

    const activeConditionIndex = ref<number | null>(null);

    const localActiveItem = computed({
      get: () => props.activeItem,
      set: val => emit('update:activeItem', val),
    });

    const conditions = computed({
      get: () => {
        return Object.values(localActiveItem.value.props as Record<string, TaBuilderSlotProp>)
          .filter((prop: TaBuilderSlotProp) => propIsSlotProp(prop))
          .map(
            (prop: TaBuilderSlotProp) =>
              prop.condition || { complex_condition: { groups: [{ items: [] }] } },
          );
      },
      set: val => {
        Object.values(localActiveItem.value.props as Record<string, TaBuilderSlotProp>)
          .filter((prop: TaBuilderSlotProp) => propIsSlotProp(prop))
          .forEach((prop: TaBuilderSlotProp, index: number) => {
            prop.condition = val[index];
          });
      },
    });

    const onEdit = (index: number) => {
      activeConditionIndex.value = index;
      visible.value = true;
    };

    const onAddCondition = () => {
      localActiveItem.value.props[`condition_${new Date().getTime()}`] = {
        type: 'slot',
        value: [],
      };
    };

    const onRemoveCondition = (index: number) => {
      const indexes: number[] = [];
      Object.values(localActiveItem.value.props as Record<string, TaBuilderSlotProp>).forEach(
        (prop: TaBuilderSlotProp, originalIndex: number) => {
          if (propIsSlotProp(prop)) {
            indexes.push(originalIndex);
          }
        },
      );

      const key = Object.keys(localActiveItem.value.props)[indexes[index]];
      localActiveItem.value.props[key] = undefined;
    };

    return {
      ...toRefs(props),
      visible,
      activeConditionIndex,
      conditions,
      onEdit,
      onAddCondition,
      onRemoveCondition,
    };
  },
});
export default TaBuilderConditionTool;
</script>

<template lang="pug">
.ta-builder-condition-tool
  .condition.py-2.px-4.mx-2.mt-2.border.border-gray-200.rounded.relative.space-y-1(v-for='(condition, index) in conditions')
    .text-gray-900 条件 {{ condition?.complex_condition?.name || index}}
    TaTemplateFormDesignerComplexConditionDesc(
      :complexCondition='condition?.complex_condition',
    )
    a-button(type='primary', @click='onEdit(index)') 编辑条件

    .absolute.top-0.right-0.cursor-pointer(
      @click='onRemoveCondition(index)'
    )
      TaIcon.w-8.h-10(type='CloseOutlined')

  .add-button.rounded.border.border-gray-200.mt-2.mx-2.py-2.flex.justify-center.w-full.cursor-pointer(
    @click='onAddCondition',
  )
    | 添加条件

  a-modal(v-if='visible', v-model:visible='visible', title='复杂条件', @cancel='visible = false', :footer='null')
    TaTemplateFormDesignerComplexConditionConfig(
      v-if='conditions[activeConditionIndex]',
      v-model:value='conditions[activeConditionIndex].complex_condition',
      @update:value='() => conditions = [...conditions]',
      :workflowTemplate='keywordTemplate',
    )
</template>

<style lang="stylus" scoped></style>
