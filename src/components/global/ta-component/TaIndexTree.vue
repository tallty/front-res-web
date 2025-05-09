<script lang="ts">
import { ref, defineComponent, toRefs, PropType, watch, computed } from 'vue';
import { Draggable } from '@he-tree/vue3';
import '@he-tree/vue3/dist/he-tree-vue3.css';
import { VObject, VModel } from '@/lib/vails/model';
import { TaTemplateFormItem } from './ta-template-form-core/types';
import useAutoTemplateForm from './ta-template-form-core/useAutoTemplateForm';
import { TaIndexTreeItem as TaIndexTreeItemInterface } from './TaIndexView/ta-index-view-core/types';

// he-tree:
//    https://hetree.phphe.com/zh/v1/guide/#treedata-%E6%88%96-flatdata
//    https://hetree.phphe.com/zh/v1/api/#outputflatdata
//    https://hetree.phphe.com/v1/api/#childrenloader

export type TaIndexTreeItem = TaIndexTreeItemInterface;

const TaIndexTree = defineComponent({
  name: 'TaIndexTree',
  components: {
    Draggable,
  },
  props: {
    draggable: { type: Boolean, default: true },

    activeItem: { type: Object, default: () => ({}) },
    flatData: { type: Array as PropType<TaIndexTreeItem[]>, default: () => [] },
    onDragend: { type: Function, default: null },
    rootDraggable: { type: Boolean, default: false },
    options: { type: Object, default: () => ({}) },
  },
  emits: ['select', 'update:activeItem', 'expend', 'expand'], // expend 是以前拼写错误
  setup(props, { emit }) {
    const localActiveItem = computed({
      get: () => props.activeItem,
      set: val => emit('update:activeItem', val),
    });

    const localFlatData = computed(() => {
      if (props.flatData[0]?.record?.position) {
        return [...props.flatData].sort((a, b) =>
          a.record?.position >= b.record?.position ? 1 : -1,
        );
      }
      return props.flatData;
    });

    const treeRef = ref<any>(null);

    const onSelect = (item: TaIndexTreeItem) => {
      localActiveItem.value = item;
      emit('select', item);
    };

    const onTreeDragend = async (store: any) => {
      if (store.dragChanged) {
        if (typeof props.onDragend === 'function') {
          props.onDragend(store.draggingNode, store.targetPath.parent);
        } else {
          if (typeof store.draggingNode.record?.update === 'function') {
            store.draggingNode.record?.update({
              position: store.targetPath.index + 1,
              parent_id:
                store.targetPath.parent?.$id === undefined || store.targetPath.parent?.$id <= 0
                  ? null
                  : store.targetPath.parent?.$id,
            });
          }
        }
      }
    };

    // he-tree 有 bug，end 一直是 3，只能显示 4 个
    watch(
      () => props.flatData,
      () => {
        if (treeRef.value?.$refs?.virtualizationList && !props.options.childrenLazyLoading) {
          treeRef.value.$refs.virtualizationList.end = props.flatData.length;
        }
      },
      { immediate: true },
    );

    const editRecord = ref<VModel<VObject> | null>(null);
    const activeTemplate = ref<TaTemplateFormItem>({});
    const visibleForm = ref(false);

    const activeTemplateOrString = ref<TaTemplateFormItem | string>({});
    const { localTemplate, fetchTemplate } = useAutoTemplateForm(activeTemplateOrString as any);

    const onCreate = async (node: TaIndexTreeItem) => {
      if (typeof node.create?.callback === 'function') return node.create.callback(node);

      // 里面应该用了 ref 嵌套， 所以会导致 store 的 ref 形成嵌套导致响应式失效
      const store = props.flatData.find((data: TaIndexTreeItem) => data.idKey === node.idKey)
        ?.create?.store;
      const encodeFormData =
        node.create?.encodeFormData ||
        (() => ({
          parent_id: node.idKey,
        }));

      editRecord.value = store?.new(encodeFormData(node));

      activeTemplateOrString.value = node.create?.template || {};
      await fetchTemplate();
      activeTemplate.value = localTemplate.value;
      if (editRecord.value) visibleForm.value = true;
    };

    const onUpdate = async (node: TaIndexTreeItem) => {
      if (typeof node.update?.callback === 'function') return node.update.callback(node);
      editRecord.value = node.record;
      activeTemplateOrString.value = node.update?.template || {};

      await fetchTemplate();
      activeTemplate.value = localTemplate.value;
      if (editRecord.value) visibleForm.value = true;
    };

    const onDelete = (node: TaIndexTreeItem) => {
      if (typeof node.delete === 'object' && typeof node.delete?.callback === 'function')
        return node.delete.callback(node);
      if (typeof node.record?.delete === 'function') node.record?.delete();
    };

    const afterSave = () => (visibleForm.value = false);
    const afterDelete = () => (visibleForm.value = false);

    const toggle = (tree: any, node: any) => {
      emit('expand', !node.$folded, node.record, node);
      if (!node.$folded) {
        emit('expend', node, tree);
      }
      tree.toggleFold(node);
    };

    const expendIconClass = (node: any) => ({
      rotate: !node.$folded && !(node.$children.length === 0),
      hidden: !(
        node.$children.length > 0 ||
        Number(node.record?.children_count || node.record?.$children_count) > 0
      ),
    });

    const onLoadChildrenSuccess = () => {
      // children lazy loading 时，不会更新 flatData
      if (props.options.childrenLazyLoading) {
        treeRef.value.$refs.virtualizationList.end = +Infinity;
      }
    };

    return {
      ...toRefs(props),
      treeRef,
      onTreeDragend,
      onSelect,
      onCreate,
      onUpdate,
      onDelete,
      visibleForm,
      activeTemplate,
      editRecord,
      afterSave,
      afterDelete,
      localActiveItem,
      localFlatData,
      toggle,
      expendIconClass,
      onLoadChildrenSuccess,
    };
  },
});
export default TaIndexTree;
</script>

<template lang="pug">
.ta-index-tree.h-full.overflow-auto
  a-spin(:spinning='!!options.loading')
    Draggable(
      ref='treeRef',
      :flatData='localFlatData',
      idKey='idKey',
      parentIdKey='parentKey',
      :ondragend='onTreeDragend',
      :rootDraggable='rootDraggable',
      :virtualization='false',
      @load-children-success='onLoadChildrenSuccess',
      v-bind='options'
    )
      template(#default='{ node, tree, index }')
        .ta-index-tree-item(
          :class='{ "ta-index-tree-item-active": localActiveItem.idKey == node.idKey }',
          @click='() => ((typeof node.selectable === "undefined") || node.selectable) ? onSelect(node) : null'
        )
          TaIcon.icon(
            type='CaretRightOutlined',
            :class='expendIconClass(node)',
            @click='toggle(tree, node)'
          )
          slot(
            name='item',
            :node='node',
            :tree='tree',
            :actions='{ onCreate: () => onCreate(node), onUpdate: () => onUpdate(node), onDelete: () => onDelete(node) }'
          )
            .item-context(
              :class='{ "item-context-with-actions": node.create || node.update || node.delete }'
            )
              .right
                TaIcon.icon(v-if='node.icon', :type='node.icon')
                .tag-shell(v-if='node.tag')
                  .tag(:style='{ background: node.tag_color }')
                    | {{ node.tag }}
                a-tooltip(:mouseEnterDelay='1')
                  template(#title) {{ node.label }}
                  slot(:record='node.record', :index='index', :treeNode='node', :tree='tree')
                    .label {{ node.label }}
              .left
                .ellipsis-actions
                  TaIconTooltip.action(
                    v-if='node.create',
                    icon='PlusCircleOutlined',
                    tips='创建',
                    @click.stop='onCreate(node)'
                  )
                  TaIconTooltip.action(
                    v-if='node.update',
                    icon='EditOutlined',
                    tips='编辑',
                    @click.stop='onUpdate(node)'
                  )
                  TaPopoverConfirm(
                    v-if='node.delete',
                    title='删除',
                    content='您确认删除该数据吗',
                    @confirm='onDelete(node)'
                  )
                    TaIconTooltip.action(icon='DeleteOutlined', tips='删除')

                .count(v-if='node.count')
                  TaIcon(type='MenuFoldOutlined')
                  | {{ node.count }}
  TaTemplateFormWithActionsDrawer(
    v-model:visible='visibleForm',
    :template='activeTemplate',
    :record='editRecord',
    @afterSave='afterSave',
    @afterDelete='afterDelete'
  )
</template>

<style lang="stylus" scoped>
.ta-index-tree-item
  cursor pointer
  color rgba(0, 0, 0, 0.65)
  padding 4px 20px
  margin 6px 0
  display flex
  flex-wrap nowrap
  align-items center
  .icon
    margin-right 10px
    transition all 0.4s
  .rotate
    transform rotate(90deg)
    transition all 0.4s
  .hidden
    opacity 0
  .item-context
    width 100%
    display flex
    justify-content space-between
    overflow hidden
    .right
      display flex
      flex-wrap nowrap
      flex-shrink 1
      flex-grow 1
      width 0
      overflow hidden
      text-overflow ellipsis
      align-items center
      .icon
        margin-right 10px
      .tag-shell
        display flex
        align-items center
        margin-left 5px
        .tag
          white-space nowrap
          color white
          border 0px solid #fff
          display inline-block
          border-radius 4px
          padding 2px 5px
          font-size 12px
          margin-right 5px
          height fit-content
      .label
        width 100%
        overflow hidden
        white-space nowrap
        text-overflow ellipsis
        flex-shrink 1
    .left
      flex-shrink 0
      display flex
      flex-wrap nowrap
      .ellipsis-actions
        display none
        align-items center
        .action
          margin-left 5px
      .count
        display flex
        align-items center
        flex-wrap nowrap
        margin-left 5px
        white-space nowrap
        color rgba(0, 0, 0, 0.65)
  .item-context-with-actions
    &:hover
      .ellipsis-actions
        display flex
      .count
        display none
.popover-title
  color rgba(0, 0, 0, 0.65)
.popover-item
  color rgba(0, 0, 0, 0.65)
  cursor pointer
.ta-index-tree-item-active
  z-index 1
  position relative
  &:before
    content ' '
    z-index -1
    width 100%
    height 100%
    background $primary-color
    opacity 0.2
    position absolute
</style>
