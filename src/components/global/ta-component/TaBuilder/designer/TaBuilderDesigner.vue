<script lang="ts">
import { ref, defineComponent, toRefs, PropType, computed, watch, nextTick, createApp } from 'vue';
import { TaBuilderConfiguration, TaBuilderConfigurationTreeStruct } from '../types';
import { cloneDeep, isEqual } from 'lodash';
import { TaBuilderComponent } from '../types';
import { Revoke } from '../../revoke';
import useSystemClipboard from '../../TaTemplateForm/designer/useImportExportDesignerConfig';
import { onMounted } from '@vue/runtime-core';

let no = 0;
// 组成返回后端的 flatData + treeStruct
// 利用 drawer 的 treeData 剔除其他信息，行程 treeStruct
const TaBuilderDesigner = defineComponent({
  name: 'TaBuilderDesigner',
  components: {},
  props: {
    value: { type: Object as PropType<TaBuilderConfiguration>, default: () => ({ template: {} }) },
  },
  setup(props, { emit }) {
    const seq = no++;

    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const drawer = ref<any>(null);

    const generateStructChildren = (
      item: TaBuilderComponent,
    ): TaBuilderConfigurationTreeStruct[] => {
      return (item.children || []).map(
        (child: TaBuilderComponent): TaBuilderConfigurationTreeStruct => ({
          key: child.key,
          children: generateStructChildren(child) || [],
        }),
      );
    };

    const getTreeStruct = () => {
      const sourceTreeData = cloneDeep(drawer.value?.treeData);
      // NOTE: 一个根节点
      const result: TaBuilderConfigurationTreeStruct = { key: 'root', children: [] };
      if (sourceTreeData) {
        result.children = generateStructChildren(sourceTreeData);
      }
      return result;
    };

    watch(
      () => localValue.value.flatData,
      () => {
        localValue.value.treeStruct = getTreeStruct();
      },
      { deep: true },
    );

    const revoke = new Revoke();

    const oldFlatData = ref<TaBuilderComponent[]>([]);

    watch(
      () => localValue.value.flatData,
      () => {
        if (!isEqual(localValue.value.flatData, oldFlatData.value)) {
          oldFlatData.value = cloneDeep(localValue.value.flatData);
          nextTick(() => revoke.push(localValue.value.flatData));
        }
      },
      { deep: true, immediate: true },
    );

    const onUndo = () => {
      const history = revoke.undo();
      if (history) {
        localValue.value.flatData = history;
        drawer.value.activeItemReset();
      }
    };

    const onRedo = () => {
      const history = revoke.redo();
      if (history) {
        localValue.value.flatData = history;
        drawer.value.activeItemReset();
      }
    };

    const visiblePreview = ref(false);
    const previewSchema = computed(() => ({
      name: 'preview',
      key: 'preview',
      component: 'TaBuilder',
      css: 'position:relative;',
      props: {
        value: cloneDeep(localValue.value),
      },
    }));

    const { copyToClipboard, pasteFormClipboardAsync } = useSystemClipboard();

    onMounted(() => {
      copyToClipboard(`#copy-button-${seq}`, () =>
        JSON.stringify({ flatData: drawer.value.getRelativeCells(drawer.value.activeItem) }),
      );
    });

    const pasteStringValidator = (str: string) => {
      let result = true;
      try {
        JSON.parse(str);
      } catch {
        result = false;
      }
      return result;
    };

    const onPastComponent = () => {
      pasteFormClipboardAsync(pasteStringValidator).then((str: string) => {
        const cells = JSON.parse(str).flatData;
        if (cells) drawer.value.pasteCells(cells);
      });
    };

    const previewToContainer = ref<any>(null);
    const previewFromContainer = ref<any>(null);

    const onSaveToHTML = () => {
      const copyHead = document.getElementsByTagName('head')[0]?.cloneNode(true);

      if (previewToContainer.value && previewFromContainer.value?.$el) {
        previewToContainer.value.appendChild(copyHead);
        const contextDom = previewToContainer.value
          .appendChild(document.createElement('body'))
          .appendChild(document.createElement('div'));
        contextDom.id = 'app';
        contextDom.style.height = 'fit-content';
        contextDom.style.width = 'fit-content';
        contextDom.appendChild(previewFromContainer.value?.$el);
        emit('saveToHTML', previewToContainer.value.innerHTML);
      }
    };

    return {
      ...toRefs(props),
      localValue,
      drawer,
      visiblePreview,
      previewSchema,
      onUndo,
      onRedo,
      onPastComponent,
      seq,
      onSaveToHTML,
      previewToContainer,
      previewFromContainer,
    };
  },
});
export default TaBuilderDesigner;
</script>

<template lang="pug">
.ta-builder-designer.flex.flex-col
  .actions.w-full.flex.flex-between
    .page-actions.flex.space-x-2.flex-shrink-0
      a-button(type='primary', @click='visiblePreview = true') 预览
      a-button(type='primary', @click='onUndo')
        .flex-center
          TaIcon(type='UndoOutlined')
      a-button(type='primary', @click='onRedo')
        .flex-center
          TaIcon(type='RedoOutlined')
      slot(name='left-actions')

      TaTemplateFormDesignerDialog(v-model:value='localValue.template', :showOverview='false')
        template(#default='{ open }')
          a-button(@click='open') 编辑关键字段

    .component-actions.flex.space-x-2.flex-shrink-0
      a-button(:id='`copy-button-${seq}`', type='primary') 复制组件
      a-button(type='primary', @click='onPastComponent') 粘贴组件
      slot(name='right-actions')

  TaBuilderDesignerDrawer.flex-grow.h-0(ref='drawer', v-model:value='localValue.flatData', :keywordTemplate='localValue.template')

  TaNoPaddingModal(
    v-if='visiblePreview',
    v-model:visible='visiblePreview',
    :footer='null',
    :headerStyle='{ display: "none" }',
    :bodyStyle='{ overflow: "auto", height: "fit-content", width: "fit-content" }',
    :modalContentStyle='{ overflow: "auto", height: "fit-content", width: "fit-content" }',
    :zIndex='999999'
  )
    .py-1.px-3
      a-button(type='primary', @click='onSaveToHTML') 保存片段
      div(ref='previewToContainer')
    TaBuilderTreeNode(
      ref='previewFromContainer',
      v-if='visiblePreview',
      :componentSchema='previewSchema'
    )
</template>

<style lang="stylus" scoped></style>
