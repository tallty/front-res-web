<script lang="ts">
import draggable from 'vuedraggable';
import {
  TaTemplateFormItem,
  TaTemplateFormCondition,
} from '@/components/global/ta-component/ta-template-form-core/types';
import { toRefs, PropType, defineComponent, computed, ref } from 'vue';

interface tabInterface {
  key: string;
  label: string;
  condition: TaTemplateFormCondition;
}

const TaTemplateFormDesignerConditionLayout = defineComponent({
  name: 'TaTemplateFormDesignerConditionLayout',
  components: {
    draggable,
  },
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
  },
  emits: ['update:item'],
  setup(props, { emit }) {
    const tabs = computed(
      () =>
        props.item.conditions?.map(c => ({
          label: c.complex_condition?.name || c.name,
          condition: c,
        })) || [],
    );

    const editableItem = computed({
      get: () => props.item,
      set: val => emit('update:item', val),
    });

    const activeCondition = ref({});
    const activeIndex = ref(-1);

    const onTabChange = (tab: tabInterface, index: number) => {
      activeCondition.value = tab.condition;
      activeIndex.value = index;
    };

    const addCondition = () => {
      if (!editableItem.value.conditions) {
        editableItem.value.conditions = [];
      }
      editableItem.value.conditions.push({
        name: `条件${tabs.value.length + 1}`,
        model_key: '',
        val: '',
        fields: [] as TaTemplateFormItem[],
      });

      activeCondition.value =
        editableItem.value.conditions[editableItem.value.conditions.length - 1];
    };

    const onCopy = () => {};
    const onDelete = () => {};

    return {
      ...toRefs(props),
      tabs,
      onTabChange,
      activeIndex,
      addCondition,
      activeCondition,
      onCopy,
      onDelete,
    };
  },
});

export default TaTemplateFormDesignerConditionLayout;
</script>

<template lang="pug">
.ta-template-form-designer-condition-layout
  .name {{ item.name }}
  .header
    .tabs
      //- TaIcon(type='LeftOutlined').left
      .tab(
        v-for='(tab, index) in tabs',
        :key='index',
        :class='{ "active-tab": activeIndex === index }',
        @click='onTabChange(tab, index)'
      )
        | {{ tab.label }}
        TaIconTooltip.tooltip(icon='CopyOutlined', tips='复制', @click='onCopy')
        TaIconTooltip.tooltip(icon='DeleteOutlined', tips='删除', @click='onDelete')
      //- TaIcon(type='RightOutlined').right
    .add(@click='addCondition') ⊕ 添加
  .shell(v-if='activeCondition.fields')
    TaTemplateFormDesignerNormalLayout(
      :item='{ fields: activeCondition.fields, type: "layout" }',
      :cardEditable='false'
    )

</template>

<style scoped lang="stylus">
.ta-template-form-designer-condition-layout
  width 100%
  padding 15px 10px 0px 10px
  .name
    padding 0px 24px 12px 24px
    font-size 14px
    font-weight 500
    color rgba(38, 38, 38, 0.85)
  .header
    display flex
    .tabs
      max-width 100%
      display flex
      overflow-x auto
      .left, .right
        position sticky
        display flex
        justify-content center
        align-items center
        background #EFF3FD
        border 1px solid $primary-color
        color $primary-color
        width 25px
      .left
        left 0
      .right
        right 0
    .add, .tab
      flex-shrink 0
      cursor pointer
      padding 0px 12px
      display flex
      justify-content center
      align-items center
      border 1px solid $primary-color
      color $primary-color
      height 36px
    .add
      // background #EFF3FD
    .tooltip
      display none
    .active-tab
      background $primary-color
      color white
      display flex
      justify-content center
      align-items center
      .tooltip
        display inline-block
        margin 0 0 4px 4px
        >>> .icon
          color white
  .shell
    margin 0 -30px
    // border 5px solid $primary-color
</style>
