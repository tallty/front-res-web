<script lang="ts">
import { ref, defineComponent, toRefs, PropType, computed } from 'vue';
import { TaBuilderConfiguration, TaBuilderConfigurationTreeStruct } from '../types';
import { VObject } from '@/lib/vails/model';
import { TaBuilderComponent } from '../types';

export const taBuilderProps = {
  value: { type: Object as PropType<TaBuilderConfiguration>, default: () => ({ template: {} }) },
};

// 将 value 中 flatData + treeStruct 挂载成一棵树
const TaBuilder = defineComponent({
  name: 'TaBuilder',
  components: {},
  props: taBuilderProps,
  setup(props) {
    const key2SchemaMapping = computed(() =>
      props.value.flatData.reduce((out: VObject, item: TaBuilderComponent) => {
        out[item.key] = item;
        return out;
      }, {}),
    );

    const mountChildrenSchema = (
      treeStruct: TaBuilderConfigurationTreeStruct,
      target: TaBuilderComponent,
    ) => {
      target.children = (treeStruct.children || [])
        .map((treeStructItem: TaBuilderConfigurationTreeStruct) => {
          if (key2SchemaMapping.value[treeStructItem.key]) {
            return mountChildrenSchema(treeStructItem, key2SchemaMapping.value[treeStructItem.key]);
          }
          return null;
        })
        .filter(i => i) as TaBuilderComponent[];
      return target;
    };

    const schema = computed(() =>
      mountChildrenSchema(
        props.value.treeStruct,
        key2SchemaMapping.value[
          props.value.flatData.find((item: TaBuilderComponent) => item.parent_key === null)!.key
        ],
      ),
    );

    return {
      ...toRefs(props),
      schema,
    };
  },
});
export default TaBuilder;
</script>

<template lang="pug">
.ta-builder
  //- p value = {{ value }}
  //- p schema = {{ schema }}
  slot(:componentSchema='schema')
    TaBuilderTreeNode(:componentSchema='schema')
</template>

<style lang="stylus" scoped>
.ta-builder
  width fit-content
  height fit-content
</style>
<style lang="stylus">
[class*="_css_root"]{
  position relative !important
}
</style>
