<script lang="ts">
import { defineComponent, toRefs, PropType, computed, ref, Ref } from 'vue';
import { TaTemplateFormRule } from '@/components/global/ta-component/ta-template-form-core/types';

const TaTemplateFormDesignerRulesConfig = defineComponent({
  name: 'TaTemplateFormDesignerRulesConfig',
  components: {},
  props: {
    value: { type: Array as PropType<TaTemplateFormRule[]>, required: true },
    defaultErrorMessage: { type: String, default: '请填写' },
    attrType: {
      type: String as PropType<
        | 'string'
        | 'number'
        | 'boolean'
        | 'object'
        | 'date'
        | 'url'
        | 'hex'
        | 'email'
        | 'regexp'
        | 'integer'
        | 'float'
        | 'array'
        | 'enum'
        | 'method'
        | 'any'
        | undefined
      >,
      default: 'any',
    },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const activeRule: Ref<Partial<TaTemplateFormRule>> = ref({});
    const ruleOptions = [
      { label: '必填', value: 'required' },
      { label: '类型', value: 'type' },
      { label: '正则', value: 'pattern' },
    ];

    const typeOptions = [
      { label: '字符串', value: 'string' },
      { label: '数字', value: 'number' },
      { label: '布尔值', value: 'boolean' },
      { label: '日期', value: 'date' },
      { label: 'URL', value: 'url' },
      { label: 'hex', value: 'hex' },
      { label: '邮箱', value: 'email' },
      // {label: '', value: 'method'},
      { label: '正则', value: 'regexp' },
      { label: '整数', value: 'integer' },
      { label: '浮点数', value: 'float' },
      { label: '数组', value: 'array' },
      { label: '对象', value: 'object' },
      { label: '任意', value: 'any' },
      // {label: '', value: 'enum'},
    ];

    const rules = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const required = computed({
      get: () => (rules.value || []).filter((rule: TaTemplateFormRule) => rule.required).length > 0,
      set: val => {
        let cache: TaTemplateFormRule[] = rules.value || [];
        if (val && cache.filter((rule: TaTemplateFormRule) => rule.required).length == 0) {
          cache.push({
            rule_type: 'required',
            // type: props.attrType,
            type: 'any',
            required: true,
            message: props.defaultErrorMessage,
          });
        }
        if (!val) {
          cache = cache.filter((rule: TaTemplateFormRule) => !rule.required);
        }

        rules.value = cache;
      },
    });

    const addRule = () => {
      rules.value.push({ message: props.defaultErrorMessage });
    };

    const deleteRule = (index: number) => {
      rules.value.splice(index, 1);
    };

    const onTypeSelectChange = (value: 'required' | 'type' | 'pattern') => {
      activeRule.value.rule_type = value;
      delete activeRule.value.type;
      delete activeRule.value.required;
      delete activeRule.value.pattern;
      if (value === 'required') {
        activeRule.value.required = true;
      }
    };

    const clickRule = (rule: TaTemplateFormRule) => {
      activeRule.value = rule;
    };

    const updateRuleType = (rule: TaTemplateFormRule, val?: string) => {
      if (val === null) {
        rule.type = undefined;
      }
    };

    return {
      ...toRefs(props),
      rules,
      deleteRule,
      ruleOptions,
      addRule,
      onTypeSelectChange,
      activeRule,
      clickRule,
      typeOptions,
      required,
      updateRuleType,
    };
  },
});
export default TaTemplateFormDesignerRulesConfig;
</script>

<template lang="pug">
.ta-template-form-designer-rules
  a-checkbox.required(v-model:checked='required') 必填
  .rule(v-for='(rule, index) in rules', @click='clickRule(rule)')
    .item
      .label 验证方式
      a-select.select(
        :value='rule.rule_type',
        :options='ruleOptions',
        @change='onTypeSelectChange'
      )
    .item
      .label 错误提示
      a-input.input(v-model:value='rule.message')
    //- .item(v-if='rule.rule_type === "type"')
    .item
      .label 验证类型
      a-select.select(
        v-model:value='rule.type',
        placeholder='组件自带',
        :options='typeOptions',
        @update:value='updateRuleType(rule, $event)'
      )
    .item(v-if='rule.rule_type === "pattern"')
      .label 正则
      a-input.input(v-model:value='rule.pattern')

    .option-icon.delete(@click='deleteRule(index)')
      TaIcon(type='DeleteOutlined')
  .add-action(icon='plus', @click='addRule')
    TaIcon(type='PlusOutlined')
    span(style='margin-left: 4px') 添加验证
</template>

<style lang="stylus" scoped>
.ta-template-form-designer-rules
  .required
    padding-bottom 10px
  .rule
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
