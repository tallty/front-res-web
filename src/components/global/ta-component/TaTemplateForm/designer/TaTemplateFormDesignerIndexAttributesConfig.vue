<script lang="ts">
import { defineComponent, toRefs, PropType, computed, ref, Ref, onMounted, onUnmounted } from 'vue';
import {
  TaTemplateFormIndexAttribute,
  TaTemplateFormItem,
} from '@/components/global/ta-component/ta-template-form-core/types';
import useKey from './useKey';
import draggable from 'vuedraggable';
import useProcessFields from '../../ta-template-form-core/useProcessFields';
import useFormDesignerMitt from './useFormDesignerMitt';

const TaTemplateFormDesignerIndexAttributesConfig = defineComponent({
  name: 'TaTemplateFormDesignerIndexAttributesConfig',
  components: {
    draggable,
  },
  props: {
    value: { type: Array as PropType<TaTemplateFormIndexAttribute[]>, default: () => [] },
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
  },
  setup(props, { emit }) {
    const activeAttr: Ref<Partial<TaTemplateFormIndexAttribute>> = ref({});
    const { generateKey } = useKey();

    const attrs = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    if (!attrs.value) {
      attrs.value = [];
    }

    const addAttr = () => {
      attrs.value.push({
        key: generateKey({ type: 'index_attribute' }),
        data_index: '',
        name: '',
      });
    };

    const deleteAttr = (index: number) => {
      attrs.value.splice(index, 1);
    };

    const clickAttr = (attr: TaTemplateFormIndexAttribute) => {
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
        name: item.name!,
        key: item.key!,
        data_index: [item.model_key_prefix, item.model_key].filter(i => i).join('.'),
      };
      // if (existIndex > -1) {
      // attrs.value.splice(existIndex, 1, newAttr);
      // } else {
      attrs.value.push(newAttr);
      // }
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

    return {
      ...toRefs(props),
      attrs,
      deleteAttr,
      addAttr,
      activeAttr,
      clickAttr,
      onImport,
      onClear,
    };
  },
});
export default TaTemplateFormDesignerIndexAttributesConfig;
</script>

<template lang="pug">
.ta-template-form-designer-index-attributes
  a-button.import(@click='onImport') 一键导入
  a-button.clear(@click='onClear') 一键清空

  draggable(
    :list='attrs'
    item-key='key'
  )
    template(#item='{ element, index }')
      .attr(@click='clickAttr(element)')
        .item
          .label 表头
          a-input.input(v-model:value='element.name')
        .item
          .label 关键字
          a-input.input(v-model:value='element.data_index')
        .option-icon.delete(@click="deleteAttr(index)")
          TaIcon(type="DeleteOutlined")
  .add-action(@click="addAttr")
    TaIcon(type="PlusOutlined")
    span(style="margin-left: 4px") 添加列
</template>

<style lang="stylus" scoped>
.ta-template-form-designer-index-attributes
  padding 10px 15px
  width 100%
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
      border 1px dashed $primary-color
      color $primary-color
      cursor pointer
</style>
