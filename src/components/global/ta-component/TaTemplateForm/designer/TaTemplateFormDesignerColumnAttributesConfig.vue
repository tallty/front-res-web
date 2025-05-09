<script lang="ts">
import {
  defineComponent,
  toRefs,
  PropType,
  computed,
  ref,
  Ref,
  onMounted,
  onUnmounted,
  watch,
} from 'vue';
import {
  TaTemplateFormItem,
  TaTemplateFormColumnAttribute,
} from '@/components/global/ta-component/ta-template-form-core/types';
import useKey from './useKey';
import draggable from 'vuedraggable';
import useProcessFields from '../../ta-template-form-core/useProcessFields';
import useFormDesignerMitt from './useFormDesignerMitt';
import { columnAttributesTemplate, columnAttributesMoreTemplate } from './columnAttributesTemplate';
import { VObject } from '@/lib/vails/model';

const TaTemplateFormDesignerColumnAttributesConfig = defineComponent({
  name: 'TaTemplateFormDesignerColumnAttributesConfig',
  components: {
    draggable,
  },
  props: {
    value: { type: Array as PropType<TaTemplateFormColumnAttribute[]>, default: () => [] },
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
  },
  setup(props, { emit }) {
    const activeAttr: Ref<Partial<TaTemplateFormColumnAttribute>> = ref({});
    const { generateKey } = useKey();

    const attrs = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    watch(
      () => true,
      () => {
        if (!attrs.value || attrs.value.length == 0) {
          attrs.value = [];
        }
      },
      { immediate: true },
    );

    const addAttr = (index: number, offset: number) => {
      const newValue = {
        _id: generateKey({ type: 'column_attributes' }),
        dataIndex: '',
        title: '',
        render: 'TableRendersAuto',
        index: { on: true },
        import: { on: true },
        export: { on: true },
      };
      attrs.value.splice(index + offset, 0, newValue);
    };

    const deleteAttr = (index: number) => {
      attrs.value.splice(index, 1);
    };

    const clickAttr = (attr: TaTemplateFormColumnAttribute) => {
      activeAttr.value = attr;
    };

    const { processField } = useProcessFields();

    const { emitter } = useFormDesignerMitt();

    const onImport = () => {
      processField(props.item, {}, item => {
        if (item.model?.summary) {
          processOneField(item);
        }
      });
    };

    const onClear = () => {
      attrs.value = [];
    };

    const processOneField = (item: TaTemplateFormItem, remove?: boolean) => {
      if (remove) {
        const existIndex = attrs.value.findIndex(attr => attr.key === item.key);
        attrs.value.splice(existIndex, 1);
        return;
      }
      const newAttr = {
        title: item.name!,
        _id: item.key!,
        dataIndex: [item.model_key_prefix, item.model_key].filter(i => i).join('.'),
        index: { on: true },
        import: { on: true },
        export: { on: true },
      };
      attrs.value.push(newAttr);
    };

    const summaryChangeHandler = (e?: { item: TaTemplateFormItem; remove: boolean }) => {
      processOneField(e!.item, e!.remove);
    };

    onMounted(() => {
      emitter.on('summaryChange', summaryChangeHandler);
    });

    onUnmounted(() => {
      emitter.off('summaryChange', summaryChangeHandler);
    });

    const visibleCollapse = ref<boolean[]>([]);
    const isCollapseVisible = (index: number) => visibleCollapse.value[index];
    const openCollapse = (index: number) => (visibleCollapse.value[index] = true);
    const closeCollapse = (index: number) => (visibleCollapse.value[index] = false);

    const getColumnAttributesTemplate = (index: number) => {
      // const payload: VObject = attrs.value[index];
      // const fieldsHaveValue: TaTemplateFormItem[] = [];
      // processField(columnAttributesMoreTemplate, (item: TaTemplateFormItem) => {
      //   if (Array.isArray(item.model_key)) {
      //     item.model_key.forEach(key => {
      //       if (payload[key] !== undefined) fieldsHaveValue.push(item);
      //     });
      //   } else {
      //     if (payload[item.model_key!] !== undefined) fieldsHaveValue.push(item);
      //   }
      // });
      // return {
      //   ...columnAttributesTemplate,
      //   fields: [...(columnAttributesTemplate.fields || []), ...fieldsHaveValue],
      // };
      return columnAttributesTemplate;
    };

    const visibleEditMore = ref(false);

    const editFormData = ref<VObject>({});

    const onEditMore = (index: number) => {
      editFormData.value = attrs.value[index];
      visibleEditMore.value = true;
    };

    return {
      ...toRefs(props),
      attrs,
      deleteAttr,
      addAttr,
      activeAttr,
      clickAttr,
      onImport,
      onClear,
      visibleCollapse,
      isCollapseVisible,
      openCollapse,
      closeCollapse,
      getColumnAttributesTemplate,
      columnAttributesMoreTemplate,
      visibleEditMore,
      onEditMore,
      editFormData,
    };
  },
});
export default TaTemplateFormDesignerColumnAttributesConfig;
</script>

<template lang="pug">
.ta-template-form-designer-column-attributes.py-2.px-4
  a-button.import(@click='onImport') 一键导入
  a-button.clear(@click='onClear') 一键清空

  draggable(
    :list='attrs'
    item-key='_id'
  )
    template(#item='{ element, index }')
      .attr.relative.space-y-2(@click='clickAttr(element)')
        .add-action.action-top(@click.stop="addAttr(index, 0)")
          TaIcon(type="PlusOutlined")
          span(style="margin-left: 4px") 添加列

        TaTemplateForm.simple-form(v-model:modelValue='attrs[index]', :template='getColumnAttributesTemplate(index)')
        //- .collapse-arrow(@click="visibleCollapse[index] ? closeCollapse(index) : openCollapse(index)")
        //-   TaIcon(:type='visibleCollapse[index] ? "ArrowUpOutlined" : "ArrowDownOutlined"')
        //-   span {{ visibleCollapse[index] ? '收起' : '更多' }}
        //- .collapse(v-if='isCollapseVisible(index)')
        //-   TaTemplateForm(v-model:modelValue='attrs[index]', :template='columnAttributesMoreTemplate')
        .option-icon
          .delete(@click="deleteAttr(index)")
            TaIcon(type="DeleteOutlined")
          .edit-more(@click='onEditMore(index)')
            TaIcon(type='SettingOutlined')

        .add-action.action-bottom(@click.stop="addAttr(index, +1)")
          TaIcon(type="PlusOutlined")
          span(style="margin-left: 4px") 添加列
  .add-action(@click="addAttr(attrs.length, 0)")
    TaIcon(type="PlusOutlined")
    span(style="margin-left: 4px") 添加列

  TaTemplateFormModal(
    v-model:visible='visibleEditMore',
    v-model:modelValue='editFormData',
    :template='columnAttributesMoreTemplate'
  )
</template>

<style lang="stylus" scoped>
.ta-template-form-designer-column-attributes
  width 100%
  height 100%
  .simple-form
    >>> .ta-template-form-theme-card__layout
      padding 0
    >>> .ta-template-form-field
      padding 0
  .import
    margin-bottom 10px
  .clear
    margin-left 10px
  .attr
    position relative
    margin-bottom 10px
    padding 10px
    border 1px solid #bfcbd9
    border-radius 3px
    .add-action
      height 0
      overflow hidden
      border 0
      transition height 0.1s linear
    &:hover
      border 1px solid #f9ca48
      cursor pointer
      .option-icon
        display flex
      .add-action
        height 2rem
        border 1px dashed #bfcbd9

    .option-item
      display flex
      align-items center
      .option-item-label
        width 64px
        color #808080
    .select
      width 150px
    .collapse-arrow
      border 1px solid #808080
      display flex
      justify-content center
      align-items center
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
    .delete, .edit-more
      padding 0.25rem
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
      border 1px dashed $primary-color
      color $primary-color
      cursor pointer
</style>
