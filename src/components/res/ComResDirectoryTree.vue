<script lang="ts">
import { VObject } from '@/lib/vails';
import { PropType, computed, defineComponent, ref, toRefs } from 'vue';

const ComResDirectoryTree = defineComponent({
  name: 'ComResDirectoryTree',
  props: {
    treeData: { type: Array as PropType<VObject[]>, required: true },
    keyword: { type: String, required: false, default: '' },
    loadData: { type: Function, required: false, default: null },
    loading: { type: Boolean, required: false, default: false },
  },
  setup(props, { emit }) {
    const deepFilter = (list: VObject[], keyword: string): any => {
      const newList: VObject[] = [];
      list.forEach((item: VObject) => {
        if (item.children && item.children.length) {
          const children = deepFilter(item.children, keyword);
          if (children && children.length) {
            newList.push({ ...item, children });
          } else if (item.title?.includes(keyword)) {
            newList.push({ ...item, children: [] });
          }
        } else if (item.title?.includes(keyword)) {
          newList.push(item);
        }
      });
      return newList;
    };

    const treeData = computed(() => {
      return deepFilter(props.treeData, props.keyword);
    });

    const selectedKeys = ref<VObject[]>([]);

    const onSelect = (_selectedKeys: VObject, e: VObject) => {
      selectedKeys.value = [e.node.key];
      emit('select', e);
    };

    const onContextMenuClick = (dataRef: VObject, menuKey: string) => {
      emit(menuKey, dataRef);
    };

    return {
      ...toRefs(props),
      onSelect,
      filteredTreeData: treeData,
      onContextMenuClick,
      selectedKeys,
    };
  },
});

export default ComResDirectoryTree;
</script>

<template lang="pug">
.com-res-directory-tree
  a-spin(:spinning="loading")
    a-directory-tree(
      default-expand-all,
      :tree-data='filteredTreeData',
      :selectedKeys='selectedKeys',
      :loadData='loadData',
      show-icon,
      @select='onSelect',
      expand-action='dblclick'
    )
      template(#icon)
      template(#title='{ key: treeKey, title, dataRef }')
        .flex.items-center.justify-between
          .flex.items-center.left
            TaIcon.mr-1.primary-color(
              :type='dataRef.config.icon',
              :color='dataRef.config.iconColor',
              size='16px',
              v-if='dataRef.config.iconColor'
            )
            TaIcon.w-5.h-5.mr-1.primary-color(
              :type='dataRef.config.icon',
              :class='dataRef.config.iconClass',
              v-else
            )
            a-tooltip
              template(#title)
                .title {{ title }}
              .title.truncate {{ title }}
          a-dropdown(v-if='dataRef.config.actions')
            TaIcon.w-4.h-4.text-gray-500(type='solid/dots-vertical')
            template(#overlay)
              a-menu(@click='({ key: menuKey }) => onContextMenuClick(dataRef, menuKey)')
                a-menu-item(v-for='action in dataRef.config.actions', :key='action.key') {{ action.label }}
</template>

<style lang="stylus" scoped>
.com-res-directory-tree
  .title
    color #1F2A37
  .primary-color
    color $primary-color
  >>>.ant-tree .ant-tree-node-content-wrapper .ant-tree-iconEle
    margin-top -3px
  >>>.ant-tree-switcher
    margin-top -2px
  >>>.ant-tree .ant-tree-treenode
    padding-top 4px
  >>>.ant-tree.ant-tree-directory .ant-tree-treenode::before
    bottom 0
  >>>.ant-tree.ant-tree-directory .ant-tree-treenode-selected
    &::before
      background #EBF5FF
  >>>.ant-tree.ant-tree-directory .ant-tree-treenode-selected .ant-tree-switcher
    color $primary-color
  >>>.ant-tree.ant-tree-directory .ant-tree-treenode .ant-tree-node-content-wrapper.ant-tree-node-selected .title
    color $primary-color
    font-weight 500
</style>
