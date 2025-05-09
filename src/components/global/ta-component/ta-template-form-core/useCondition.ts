import { VObject } from '@/lib/vails/model';
import { computed, watch, ref, ComputedRef, ReactiveEffect } from 'vue';
import {
  TaTemplateFormItem,
  TaTemplateFormCondition,
  TaTemplateFormComplexCondition,
} from './types';
import { get, isEqual, set, cloneDeep, merge } from 'lodash-es';
import { TaTemplateFormComplexConditionRule } from './types';
import useProcessFields from './useProcessFields';
import useGetFormValue, { useGetFormValueReactive } from './useGetFormValue';
// import { Function } from 'eval5';
import { useContextInject } from './useContext';
import { jsonataGet } from './useJsonata';

export const useFormComponentCondition = (
  props: any,
  formComponent: { value: any; template: TaTemplateFormItem },
) => {
  const enableFields = ref<TaTemplateFormItem[]>([]);
  // 对于 formComponent.value 的响应式有问题
  // 如果 formComponent.value 变了一个对象，就会失去响应式
  const { context } = useContextInject();

  watch(
    [() => formComponent.value, () => props.item, () => formComponent.template, () => context],
    () => {
      enableFields.value = useCondition(
        props.item,
        formComponent.value,
        context,
        formComponent.template,
      ).enableFields.value;
    },
    { immediate: true, deep: true },
  );

  return { enableFields };
};

const useCondition = (
  item: TaTemplateFormItem,
  formData: VObject,
  context: VObject,
  completeForm: TaTemplateFormItem = {},
) => {
  const checkCondition = (condition: TaTemplateFormCondition) => {
    if (condition.type === 'complex') {
      return checkComplexConditions(formData, condition.complex_condition || { groups: [] });
    } else {
      return checkSimpleConditions(formData, condition);
    }
  };

  const checkSimpleConditions = (formData: VObject, condition: TaTemplateFormCondition) => {
    const value = get(formData, condition.model_key) || get(context || {}, condition.model_key);
    const targetValue = condition.val;

    if (condition.opt === '==' || !condition.opt) {
      if (value === targetValue) return true;
    } else if (condition.opt === '<') {
      if (value < targetValue) return true;
    } else if (condition.opt === '<=') {
      if (value <= targetValue) return true;
    } else if (condition.opt === '>') {
      if (value > targetValue) return true;
    } else if (condition.opt === '>=') {
      if (value >= targetValue) return true;
    } else if (condition.opt === '!=') {
      if (value !== targetValue) return true;
    }
    return false;
  };

  const checkComplexConditions = (
    formDataValue: VObject,
    condition: TaTemplateFormComplexCondition,
  ) => {
    return condition.groups
      ?.map(group => {
        return group.items
          ?.map(conditionItem => {
            const normalValue = get(formDataValue, conditionItem.rule?.key || '');
            const contextValue = get(context || {}, conditionItem.rule?.key || '');
            const contexFormtValue = get(context._form || {}, conditionItem.rule?.key || '');
            const jsonataValue = jsonataGet(
              // 不能用 merge， 防止 vue route bug 会导致死循环
              Object.assign({}, formDataValue, context),
              conditionItem.rule?.key || '',
            );

            const value = [normalValue, contextValue, contexFormtValue, jsonataValue].filter(
              i => i !== undefined,
            )[0];
            return conditionItem.rule?.key ? checkRule(conditionItem.rule, value) : false;
          })
          .reduce((a, b) => a && b, true);
      })
      .reduce((a, b) => a || b, false);
  };

  const checkRule = (rule: TaTemplateFormComplexConditionRule, value: any): boolean => {
    if (rule.type === 'Com::Attr::ConditionRules::Boolean') {
      return checkBoolean(rule, value); //checkEval(`${value} ${rule.opt} ${rule.val}`);
    } else if (rule.type === 'Com::Attr::ConditionRules::String') {
      return checkString(rule, value);
    } else if (rule.type === 'Com::Attr::ConditionRules::Number') {
      return checkNumber(rule, value);
    } else if (rule.type === 'Com::Attr::ConditionRules::SingleChoice' && value) {
      return checkSingleChoice(rule, value);
    } else if (rule.type === 'Com::Attr::ConditionRules::MultiChoice' && Array.isArray(value)) {
      return checkMultiChoice(rule, value);
    }
    return false;
  };

  // const checkEval = (str: string) => {
  //   return new (Function as any)(`"use strict";return !!${str}`)();
  // };

  const checkBoolean = (rule: TaTemplateFormComplexConditionRule, value: boolean): boolean => {
    if (rule.opt === '==') return rule.val === value;
    else if (rule.opt === '!=') return rule.val !== value;
    else return false;
  };

  const checkString = (rule: TaTemplateFormComplexConditionRule, value: string): boolean => {
    if (rule.opt === '==') return rule.val === value;
    else if (rule.opt === '!=') return rule.val !== value;
    else if (rule.opt === 'contains') return value?.includes(rule.val);
    return false;
  };

  const checkNumber = (rule: TaTemplateFormComplexConditionRule, value: number): boolean => {
    if (rule.opt === 'between') return rule.val[0] <= value && value <= rule.val[1];
    else if (rule.opt === '<=') return value <= rule.val;
    else if (rule.opt === '==') return value === rule.val;
    else if (rule.opt === '>=') return value >= rule.val;
    else if (rule.opt === '<') return value < rule.val;
    else if (rule.opt === '>') return value > rule.val;
    else if (rule.opt === '!=') return value !== rule.val;
    else return false;
    //return false; // checkEval(`${value} ${rule.opt} ${rule.val}`);
  };

  const checkSingleChoice = (rule: TaTemplateFormComplexConditionRule, value: any[]): boolean => {
    if (rule.opt === 'include') return rule.val?.filter((v: any) => isEqual(v, value))?.length > 0;
    else if (rule.opt === 'none')
      return rule.val?.filter((v: any) => isEqual(v, value))?.length === 0;

    return false;
  };

  const checkMultiChoice = (rule: TaTemplateFormComplexConditionRule, value: any[]): boolean => {
    if (!Array.isArray(value)) return false;
    if (rule.opt === 'include')
      return value.filter((v: any) => rule.val?.includes(v))?.length === value.length;
    else if (rule.opt === 'none')
      return value.filter((v: any) => rule.val?.includes(v))?.length === 0;
    else if (rule.opt === 'any') return value.filter((v: any) => rule.val?.includes(v))?.length > 0;
    else if (rule.opt === '==')
      return JSON.stringify(value.sort()) === JSON.stringify(rule.val?.sort?.() || {});
    return false;
  };

  const enableFields = computed(
    () =>
      item.conditions
        ?.filter(condition => checkCondition(condition))
        ?.map(condition => cloneDeep(condition.fields))
        ?.reduce((a, b) => a.concat(b), [] as TaTemplateFormItem[]) || [],
  );

  const { processField } = useProcessFields();

  const getEnableKey = (
    ary: TaTemplateFormItem[],
    context: VObject,
    filterFn: (item: TaTemplateFormItem, parent: TaTemplateFormItem) => boolean = () => true,
  ): string[] => {
    const keys: string[] = [];
    processField(
      { fields: ary },
      context,
      (item: TaTemplateFormItem) => {
        const { valueKey } = useGetFormValueReactive(ref(item));
        if (Array.isArray(valueKey.value)) {
          valueKey.value.forEach(key => keys.push(key));
        } else {
          keys.push(valueKey.value);
        }
      },
      filterFn,
      formData,
      context,
    );
    return keys;
  };

  const getEnableKeyOutsideThisItem = computed(() => {
    return getEnableKey(
      completeForm.fields!,
      context,
      (item: TaTemplateFormItem, parent: TaTemplateFormItem) => parent.key !== item.key,
    );
  });

  watch(enableFields, (newValue: TaTemplateFormItem[], oldValue: TaTemplateFormItem[]) => {
    if (
      isEqual(newValue, oldValue) ||
      getEnableKeyOutsideThisItem.value.filter(i => i).length === 0
    )
      return;

    const newKeys = getEnableKey(newValue, context);
    const oldKeys = getEnableKey(oldValue, context);
    oldKeys
      .filter(key => !newKeys.includes(key) && !getEnableKeyOutsideThisItem.value.includes(key))
      .forEach(key => {
        set(formData, key, undefined);
      });
  });

  return {
    enableFields,
    checkCondition,
  };
};

export default useCondition;
