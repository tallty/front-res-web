<script lang="ts">
import { defineComponent, toRefs, PropType, computed, ref, Ref, onMounted, watch } from 'vue';
import {
  TaTemplateFormTableItem,
  TaTemplateFormItem,
} from '@/components/global/ta-component/ta-template-form-core/types';
import draggable from 'vuedraggable';
import { apiFieldHeaderTemplate } from './apiFieldTemplate';

const TaTemplateFormDesignerApiConfig = defineComponent({
  name: 'TaTemplateFormDesignerApiConfig',
  components: {
    draggable,
  },
  props: {
    value: {
      type: Object as PropType<{
        table_items?: TaTemplateFormTableItem[];
        ransack?: string;
        attrs?: string[];
        display_configurable_form?: TaTemplateFormItem;
      }>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const activeTableItem: Ref<Partial<TaTemplateFormTableItem>> = ref({});

    const config = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    watch(
      () => props.value,
      () => {
        if (!config.value) {
          config.value = {};
        }
        if (!config.value.table_items) {
          config.value.table_items = [];
        }
        if (!config.value.display_configurable_form) {
          config.value.display_configurable_form = {};
        }
      },
      { immediate: true },
    );

    const typeOptions = [
      { label: '字符串', value: 'string' },
      { label: '数字', value: 'number' },
    ];

    const addTableItem = () => {
      config.value.table_items!.push({
        name: '',
        data_index: '',
        search: true,
        type: 'string',
      });
    };

    const deleteTableItem = (index: number) => {
      config.value.table_items!.splice(index, 1);
    };

    const clickTableItem = (tableItem: TaTemplateFormTableItem) => {
      activeTableItem.value = tableItem;
    };

    return {
      ...toRefs(props),
      config,
      deleteTableItem,
      addTableItem,
      activeTableItem,
      clickTableItem,
      typeOptions,
      apiFieldHeaderTemplate,
    };
  },
});
export default TaTemplateFormDesignerApiConfig;
</script>

<template lang="pug">
.ta-template-form-designer-table-item-config(v-if='config?.table_items')
  .item
    .label API
    a-input.input(v-model:value='config.path')
  .item
    .label ransack
    a-input.input(v-model:value='config.ransack')
  .item
    .label attrs
    TaTagField(v-model:value='config.attrs')
  .item
    .label 展示方式
    a-radio-group(v-model:value="config.display")
      a-radio(value='tag') 标签
      a-radio(value='table') 表格
      a-radio(value='configurable') 配置

  .item(v-if='config.display === "configurable"')
    .label 展示方式配置
    TaTemplateFormDesignerDialog(
      v-model:value='config.display_configurable_form',
    )
  .item
    .label 表头配置：
  draggable(
    :list='config.table_items'
    item-key='config_table_items'
  )
    template(#item='{element, index}')
      .table-item(@click='clickTableItem(element)')
        .item
          .label 表头
          a-input.input(v-model:value='element.name')
        .item
          .label data_index
          a-input.input(v-model:value='element.data_index')
        .item
          .label 类型
          a-select.select(v-model:value='element.type', :options='typeOptions')
        .item
          a-checkbox(v-model:checked='element.search') 支持搜索
        .option-icon.delete(@click='deleteTableItem(index)')
          TaIcon(type='DeleteOutlined')
  .add-action(icon='PlusOutlined', @click='addTableItem')
    TaIcon(type='PlusOutlined')
    span(style='margin-left: 4px') 添加表格

  .item.space-x-2.my-2
    div 使用树显示
    a-switch(v-model:checked='config.use_tree')

  .item.space-x-2.my-2(v-if='config.use_tree')
    div 禁用树的父节点
    a-switch(v-model:checked='config.disable_tree_parent')

  .item.space-x-2.my-2
    div 显示通讯录
    a-switch(v-model:checked='config.use_book')

  .item.space-x-2.my-2
    .flex-shrink-0 创建表单
    a-input(v-model:value='config.form')
  .item(style='display: block')
    .label 导入导出配置：
    TaTemplateForm(v-model:modelValue='config', :template='apiFieldHeaderTemplate', :useDefaultTheme='false')
</template>

<style lang="stylus" scoped>
.ta-template-form-designer-table-item-config
  .button
    margin-bottom 10px
  .item
    display flex
    justify-content space-between
    padding 5px 0
    .label
      line-height 30px
      width 100px
    .input
      width 300px
  .table-item
    position relative
    margin-bottom 10px
    padding 10px
    border 1px solid #bfcbd9
    border-radius 3px
    &:hover
      border 1px solid #f9ca48
      cursor pointer
      .option-icon
        display inline
    .option-item
      display flex
      align-items center
      .option-item-label
        width 64px
        color #808080
    .select
      width 150px
    .item
      display flex
      justify-content space-between
      padding 5px 0
      .label
        line-height 30px
      .input
        width 150px
  .option-icon
    position absolute
    top 0
    right 0
    display none
    padding 2px
    width 20px
    height 20px
    border-radius 0px
    background #f9ca48
    color #fff
    line-height 16px
  .add-action
    display flex
    justify-content center
    align-items center
    width 100%
    border 1px dashed #bfcbd9
    color #888
    font-size 12px
    line-height 32px
    &:hover
      border 1px dashed #20A0FF
      color #20A0FF
      cursor pointer
</style>
