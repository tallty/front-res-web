import { TaTemplateFormItem } from './types';
import { get, set, merge, cloneDeep } from 'lodash-es';
import { computed, ComputedRef, Ref, ref, triggerRef, watch } from 'vue';
import { useFormInject } from './useForm';
import { useContextInject } from './useContext';
import { jsonataGet } from './useJsonata';

export const getTaTemplateFormItemValueKey = (item: TaTemplateFormItem, modelKey: string) => {
  return [...(item.model_key_prefix || '').split('.'), ...(modelKey || '').split('.')]
    .filter(i => i)
    .join('.');
};

/*
  NOTE: 这里是遗留问题，之前写的 useGetFormValue 没有响应式
  所以增加 useGetFormValueReactive 以 watch 实现 valueKey 的响应式
 */
export const useGetFormValueReactive = (
  item: ComputedRef<TaTemplateFormItem> | Ref<TaTemplateFormItem>,
) => {
  // const valueKey = ref<string | string[]>('');

  const valueKey = computed(() => {
    const modelKey = item.value.model_key!;
    return (
      (tryJSONArray(item.value)[0] && tryJSONArray(item.value)) ||
      (Array.isArray(modelKey)
        ? modelKey.map(k => [item.value.model_key_prefix, k].filter(i => i).join('.'))
        : getTaTemplateFormItemValueKey(item.value, modelKey))
    );
  });

  const tryJSONArray = (item: TaTemplateFormItem) => {
    let result = [];
    if (typeof item.model_key === 'string') {
      try {
        result = JSON.parse(item.model_key!).map((i: string) =>
          [item.model_key_prefix, i].filter(i => i).join('.'),
        );
      } catch {
        result = [];
      }
    }

    return result;
  };
  // watch(
  //   item,
  //   () => {
  //     valueKey.value = useGetFormValue(item.value).valueKey.value;
  //   },
  //   { deep: true, immediate: true },
  // );

  return { valueKey };
};

/*
 NOTE: 无响应式，实时计算
*/
const useGetFormValue = (item: TaTemplateFormItem, key?: string) => {
  const { formComponent } = useFormInject();

  const valueKey = computed(() => {
    const modelKey = item.model_key!;
    return (
      key ||
      (tryJSONArray(item)[0] && tryJSONArray(item)) ||
      (Array.isArray(modelKey)
        ? modelKey.map(k => [item.model_key_prefix, k].filter(i => i).join('.'))
        : getTaTemplateFormItemValueKey(item, modelKey))
    );
  });

  const tryJSONArray = (item: TaTemplateFormItem) => {
    let result = [];
    if (typeof item.model_key === 'string') {
      try {
        result = JSON.parse(item.model_key!).map((i: string) =>
          [item.model_key_prefix, i].filter(i => i).join('.'),
        );
      } catch {
        result = [];
      }
    }
    return result;
  };

  const value = computed({
    get: () => {
      const key = tryJSONArray(item)[0] ? tryJSONArray(item) : item.model_key!;
      const prefix = item.model_key_prefix;
      if (!key && !prefix) {
        // prefix 为空，是根目录，且 model_key 为空
        // NOTE: 这里默认值无法实现，有逻辑矛盾
        return formComponent.value;
      } else if (!key && prefix) {
        // prefix 不为空，且 model_key 不为空
        return getKey(prefix);
      } else if (Array.isArray(key) && Array.isArray(valueKey.value)) {
        // prefix 与 model_key 皆不为空，且 model_key 为数组
        return valueKey.value.map(k => getKey(k));
      } else if (typeof valueKey.value === 'string') {
        // prefix 与 model_key 皆不为空，且 model_key 为字符串
        return getKey(valueKey.value);
      }

      return undefined;
      // Array.isArray(valueKey.value) ? valueKey.value.map(k => getKey(k)) : getKey(valueKey.value),
    },
    set: val => {
      const key = tryJSONArray(item)[0] ? tryJSONArray(item) : item.model_key!;
      const prefix = item.model_key_prefix;
      if (!key && !prefix) {
        // prefix 为空，是根目录，且 model_key 为空
        // NOTE: 这里默认值无法实现，有逻辑矛盾
        merge(formComponent.value, val);
      } else if (!key && prefix) {
        // prefix 不为空，且 model_key 不为空
        merge(getKey(prefix), val);
      } else if (Array.isArray(key) && Array.isArray(valueKey.value)) {
        // prefix 与 model_key 皆不为空，且 model_key 为数组

        valueKey.value.forEach((k, index) => setKey(k, val && val[index]));
      } else if (typeof valueKey.value === 'string') {
        // prefix 与 model_key 皆不为空，且 model_key 为字符串
        setKey(valueKey.value, val);
      }

      // Array.isArray(valueKey.value)
      //   ? valueKey.value.forEach((k, index) => setKey(k, val && val[index]))
      //   : setKey(valueKey.value, val),
    },
  });

  const getKey = (k: string) => {
    if (getValueByKey(k) === undefined) {
      const createOrUpdateDefaultValue = formComponent.value.id
        ? item.model?.update_default_value
        : item.model?.create_default_value;
      const defaultValue = item.options?.defaultValue;

      if (defaultValue !== undefined) setKey(k, cloneDeep(defaultValue));
      else if (createOrUpdateDefaultValue !== undefined) {
        setKey(k, cloneDeep(createOrUpdateDefaultValue));
      }
    }
    return getValueByKey(k);
  };

  const { context } = useContextInject();

  const getValueByKey = (k: string) => {
    return get(formComponent.value, k) === undefined
      ? get(context, k) === undefined
        ? get(context._form, k) === undefined
          ? // 不能用 merge， 防止 vue route bug 会导致死循环
            jsonataGet(Object.assign({}, formComponent.value, context), k)
          : get(context._form, k)
        : get(context, k)
      : get(formComponent.value, k);
  };

  const setKey = (k: string, v: any) => {
    const result = formComponent.value;
    set(result, k, v);
    formComponent.value = result;
  };

  return {
    value,
    valueKey,
    formComponent,
    getValueByKey,
    setKey,
    getKey,
  };
};

export default useGetFormValue;
