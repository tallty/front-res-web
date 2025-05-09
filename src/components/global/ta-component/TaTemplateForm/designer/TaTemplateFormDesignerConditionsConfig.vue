<script lang="ts">
import { defineComponent, toRefs, PropType, computed, ref, Ref, inject } from 'vue';
import {
  TaTemplateFormCondition,
  TaTemplateFormItem,
  TaTemplateFormItemTreeData,
} from '@/components/global/ta-component/ta-template-form-core/types';

const TaTemplateFormDesignerConditionsConfig = defineComponent({
  name: 'TaTemplateFormDesignerConditionsConfig',
  components: {},
  props: {
    value: { type: Array as PropType<TaTemplateFormCondition[]>, required: true },
    defaultErrorMessage: { type: String, default: '请填写' },
  },
  setup(props, { emit }) {
    const template = inject('template') as Ref<TaTemplateFormItem>;
    const visibleComplexDialog = ref(false);

    const activeConditionIndex = ref(0);

    const conditions = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    conditions.value.forEach((condition: TaTemplateFormCondition) => {
      condition.type = condition.type || 'simple';
      condition.complex_condition = condition.complex_condition || { groups: [{ items: [] }] };
    });

    const modelKeyOptions = computed(() => [getTree(template.value)]);

    const getTree = (field: TaTemplateFormItem): TaTemplateFormItemTreeData => {
      return {
        title: field.name!,
        targetValue: [field.model_key_prefix, field.model_key!].filter(i => i).join('.'),
        value: field.key!,
        children: (field.fields || [])
          .map(item => getTree(item))
          .concat(
            (field.conditions || [])
              .map(condition => condition.fields.map(item => getTree(item)))
              .reduce((a, b) => a.concat(b), []),
          ),
      };
    };

    const optOptions = [
      { label: '==', value: '==' },
      { label: '!=', value: '!=' },
      { label: '<', value: '<' },
      { label: '<=', value: '<=' },
      { label: '>', value: '>' },
      { label: '>=', value: '>=' },
    ];

    const addCondition = () => {
      conditions.value.push({
        name: `条件${conditions.value.length + 1}`,
        type: 'complex',
        model_key: '',
        val: '',
        fields: [],
        complex_condition: { groups: [] },
      });
    };

    const deleteCondition = (index: number) => {
      conditions.value.splice(index, 1);
    };

    const clickCondition = (index: number) => {
      activeConditionIndex.value = index;
    };

    const openComplexConditionDialog = (index: number) => {
      activeConditionIndex.value = index;
      visibleComplexDialog.value = true;
    };

    return {
      ...toRefs(props),
      conditions,
      deleteCondition,
      addCondition,
      activeConditionIndex,
      clickCondition,
      modelKeyOptions,
      optOptions,
      visibleComplexDialog,
      openComplexConditionDialog,
      template,
    };
  },
});
export default TaTemplateFormDesignerConditionsConfig;
</script>

<template lang="pug">
.ta-template-form-designer-conditions-config
  .condition(v-for='(condition, index) in conditions', @click='clickCondition(index)')
    a-radio-group.radio-group(v-model:value='condition.type')
      a-radio(value='complex') 复杂条件
      a-radio(value='simple') 简单条件
    template(v-if='condition.type === "complex"')
      a-button(type='primary', @click='openComplexConditionDialog(index)')
        | 复杂条件
      TaTemplateFormDesignerComplexConditionDesc(:complexCondition='condition?.complex_condition')
    template(v-else)
      .item
        .label 条件名称
        a-input.input(v-model:value='condition.name')
      .item
        .label 判断依据
        TaTreeSelect.select(
          v-model:value='condition.model_key',
          :item='{ name: "判断依据", options: { treeData: modelKeyOptions }}',
        )
      .item
        .label 比较操作符
        a-select.select(v-model:value='condition.opt', :options='optOptions')
      .item
        .label 目标值
        a-input.input(v-model:value='condition.val')

    .option-icon.delete(@click='deleteCondition(index)')
      TaIcon(type='DeleteOutlined')
  .add-action(icon='PlusOutlined', @click='addCondition')
    TaIcon(type='PlusOutlined')
    span(style='margin-left: 4px') 添加条件
  a-modal(v-model:visible='visibleComplexDialog', title='复杂条件', @cancel='visibleComplexDialog = false', :footer='null')
    TaTemplateFormDesignerComplexConditionConfig(
      v-if='conditions[activeConditionIndex]'
      v-model:value='conditions[activeConditionIndex].complex_condition'
      :workflowTemplate='template'
    )
</template>

<style lang="stylus" scoped>
.ta-template-form-designer-conditions-config
  .condition
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
    .radio-group
      padding 10px 0
    .option-item
      display flex
      align-items center
      .option-item-label
        width 64px
        color #808080
    .select
      width 100%

    .item
      display flex
      justify-content space-between
      padding 5px 0
      .label
        line-height 30px
        width 140px
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
