<script lang="ts">
import { defineComponent, toRefs, PropType, computed, ref } from 'vue';
import {
  TaTemplateFormItem,
  TaTemplateFormItemTreeData,
} from '@/components/global/ta-component/ta-template-form-core/types';
import { VObject } from '@/lib/vails/model';

const TaTreeSelect = defineComponent({
  name: 'TaTreeSelect',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
    value: { type: [String, Number] as PropType<any>, required: true },
    disabled: { type: Boolean, default: false },
    treeData: { type: Array as PropType<TaTemplateFormItemTreeData[]>, default: () => [] },
  },
  setup(props, { emit }) {
    // treeData 在新版 antd vue 中 key value 不能重复，所以做此转换
    const valueToTargetValue = computed({
      get: () =>
        treeOptionsFlat.value.find(
          item => item.targetValue === props.value || item.value === props.value,
        )?.value,
      set: val => {
        const target = treeOptionsFlat.value.find(item => item.value === val);
        const targetValue = target?.targetValue || target?.value;
        emit('update:value', targetValue);
      },
    });

    const localTreeData = computed(() =>
      props.treeData.length > 0 ? props.treeData : props.item.options?.treeData || [],
    );

    const treeOptionsFlat = computed(() => {
      const flatData: TaTemplateFormItemTreeData[] = [];
      localTreeData.value.forEach((item: TaTemplateFormItemTreeData) => {
        getTree(item, (i: TaTemplateFormItemTreeData) => flatData.push(i));
      });
      return flatData;
    });

    const getTree = (
      item: TaTemplateFormItemTreeData,
      processItem: (item: TaTemplateFormItemTreeData) => void,
    ) => {
      processItem(item);
      item.children?.forEach((i: TaTemplateFormItemTreeData) => getTree(i, processItem));
    };

    const titleValue = computed(() => {
      return treeOptionsFlat.value.find(
        item => item.targetValue === props.value || item.value === props.value,
      )?.title;
    });

    return {
      ...toRefs(props),
      valueToTargetValue,
      titleValue,
      localTreeData,
    };
  },
});
export default TaTreeSelect;
</script>

<template lang="pug">
.ta-tree-select
  template(v-if='!disabled')
    .line.flex-center
      a-tree-select.select(
        v-model:value='valueToTargetValue',
        :name='item.key',
        :disabled='disabled',
        size='default',
        :placeholder='item.options.placeholder || `请选择${item.name}`',
        :mode='item.options.multiple ? "multiple" : null',
        :tokenSeparators='[","]',
        :tree-data='localTreeData',
        tree-default-expand-all,
        :dropdownMatchSelectWidth='false',
        show-search,
        treeNodeFilterProp='title',
      )
  template(v-else)
    .value {{ titleValue }}
</template>

<style lang="stylus" scoped>
.ta-tree-select
  width 100%
  .select
    width 100%
    >>> .ant-select
      width 100%
</style>
