<script lang="ts">
import { ref, defineComponent, toRefs, computed, PropType, watch, reactive } from 'vue';
import {
  injectTaBuilderDesignerActiveItem,
  refreshTaBuilderDesignerActiveItemMeta,
} from '../designer/useActiveItem';
import { merge, cloneDeep, isEqual } from 'lodash';
import { defineTaBuilderCellComponent } from './defineTaBuilderCellComponent';
import { TaBuilderComponent } from '../types';
import useTaBuilderProcessItem from '../useTaBuilderProcessItem';
import { VObject } from '@/lib/vails';

let no = 0;
const TaBuilderComponentLink = defineTaBuilderCellComponent({
  name: 'TaBuilderComponentLink',
  components: {},
  props: {
    linkKey: { type: String, default: '', label: 'link', hidden: true },
    componentSchema: { type: Object, default: undefined, hidden: true },
    savedSchema: { type: Object, default: undefined, hidden: true },
    key2Props: { type: Object, default: {}, hidden: true },
  },
  emits: ['update:componentSchema'],
  setup(props: any, { emit }: any) {
    const localComponentSchema = computed({
      get: () => props.componentSchema,
      set: val => emit('update:componentSchema', val),
    });
    const seq = no++;
    const { activeItemMeta: meta } = injectTaBuilderDesignerActiveItem();
    const { activeItemMeta } = refreshTaBuilderDesignerActiveItemMeta();

    const { processTree } = useTaBuilderProcessItem();

    const parseKey = (key: string) => `${key}-${seq}`;
    // restoreKey 去掉 seq，以支持重渲染导致的 seq 变化
    const restoreKey = (key: string) => key.split('-')[0];

    const key2Props = reactive<Record<string, VObject>>(
      Object.keys(props.key2Props || {}).reduce((out: VObject, key: string) => {
        out[restoreKey(key)] = props.key2Props[key];
        return out;
      }, {}),
    );

    const processItem = (item: TaBuilderComponent, index?: number) => {
      item.key = parseKey(item.key);
      if ((index || 0) > 0 && item.parent_key) {
        // 第一个是 layer，最外层，不更改 parent
        item.parent_key = parseKey(item.parent_key);
      }
      if (!isEqual(item.props, key2Props[restoreKey(item.key)])) {
        // 指向子组件 props 引用
        item.props = cloneDeep(key2Props[restoreKey(item.key)]);
      }
    };

    const schema = computed(() => {
      if (meta && meta.value?.drawerRef && props.linkKey) {
        const flatData = cloneDeep(meta.value.drawerRef.key2RelativeCells[props.linkKey]);

        flatData?.forEach(processItem);

        const treeStruct = cloneDeep(meta.value.drawerRef.key2TreeData[props.linkKey]);
        processTree(treeStruct, processItem);

        return merge(
          {},
          {
            name: 'preview',
            key: 'preview',
            component: 'TaBuilder',
            css: 'position:relative;',
            props: {
              value: {
                flatData,
                treeStruct,
              },
            },
          },
        );
      }
      return undefined;
    });

    // 右侧配置的子孙组件配置的 表单信息 数组
    const descendantTemplates = computed(() => {
      if (!meta) return undefined;
      const keys =
        cloneDeep(
          meta.value.drawerRef.key2RelativeCells[props.linkKey],
        )?.map((cell: TaBuilderComponent) => parseKey(cell.key)) || [];

      // 去掉外框本身
      keys.shift();

      return activeItemMeta.value.renderComponents
        .filter((comp: any) => keys.includes(comp.componentSchema.key))
        .map((comp: any) => {
          console.log(comp.componentSchema.name, comp.componentRef);

          return {
            key: comp.componentSchema.key,
            label: comp.componentSchema.name,
            template: comp.componentRef?.__template,
            value: comp.componentSchema,
          };
        });
    });

    const oldPropsValue = ref<VObject[]>(Object.values(key2Props));

    watch(
      () => (descendantTemplates.value || []).map((i: any) => i.value.props),
      (newValue: VObject[]) => {
        if (!isEqual(newValue, oldPropsValue.value)) {
          descendantTemplates.value?.forEach((i: any) => {
            if (i.value.props) key2Props[restoreKey(i.key)] = i.value.props;
          });
          localComponentSchema.value.props.key2Props = key2Props;

          // TODO: 待优化
          localComponentSchema.value.props.savedSchema = schema.value;

          oldPropsValue.value = cloneDeep(newValue);
        }
      },
      { deep: true },
    );

    return {
      schema,
      descendantTemplates,
      seq,
    };
  },
});
export default TaBuilderComponentLink;
</script>

<template lang="pug">
.ta-builder-component-link
  TaBuilderTreeNode(v-if='schema || savedSchema', :componentSchema='schema || savedSchema')
</template>

<style lang="stylus" scoped>
// .ta-builder-component-link
</style>
