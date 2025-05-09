import { computed, watch } from 'vue';
import { useContextInject } from './useContext';
import { MyApi } from '@/apis/MyApi';
import { VObject } from '@/lib/vails/model/index';
import { VStore } from '@/lib/vails/store/index';
import { get } from 'lodash-es';
import { singular } from 'pluralize';

export const useConfigurableApi = (props: any) => {
  const { context } = useContextInject();
  const { store } = useConfigurableApiWithContext(props, context);

  return {
    store,
  };
};

export const strInsertContextValue = (key: string, context: VObject) => {
  return (
    get(context, key) ||
    get(context._form, key) ||
    get(context._form?.context, key) ||
    (context._route.params && context._route.params[key]) ||
    (context._route.query && context._route.query[key]) ||
    get(context._parent?._form, key)
  );
};

export const strInsertContext = (str: string, context: VObject) => {
  let result = str;
  while (/\$\{(.+?)\}/.exec(result)) {
    const matched = /\$\{(.+?)\}/.exec(result)!;
    result = result.replace(matched[0], strInsertContextValue(matched[1], context));
  }
  return result;
};

export const useConfigurableApiWithContext = (props: any, context: VObject) => {
  const insertContext = (str: string) => strInsertContext(str, context);
  const insertedPath = computed(() => insertContext(props.path));
  const insertedRansack = computed(() => {
    let result = {};
    try {
      result = JSON.parse(insertContext(props.ransackStr));
    } catch {
      result = {};
    }
    return result;
  });

  const pathAry = computed(() => insertedPath.value.split('/').filter(i => i));

  const store = new VStore(
    new MyApi<VObject>({
      namespace: `/${pathAry.value.slice(0, pathAry.value.length - 1).join('/')}`,
      name:
        pathAry.value[pathAry.value.length - 1] &&
        singular(pathAry.value[pathAry.value.length - 1]),
      params: {
        q: insertedRansack.value,
      },
    }),
    props.model,
  );

  watch(
    [pathAry, insertedRansack],
    () => {
      store.api = new MyApi<VObject>({
        namespace: `/${pathAry.value.slice(0, pathAry.value.length - 1).join('/')}`,
        name:
          pathAry.value[pathAry.value.length - 1] &&
          singular(pathAry.value[pathAry.value.length - 1]),
        params: {
          q: insertedRansack.value,
        },
      });
    },
    { deep: true },
  );

  return {
    store,
    insertContext,
  };
};

export default useConfigurableApi;
