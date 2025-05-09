import { VObject } from '@/lib/vails/model';
import {
  reactive,
  provide,
  inject,
  watch,
  WritableComputedRef,
  ReactiveEffect,
  ComputedRef,
} from 'vue';

const useContextKey = 'useContext';

const useContextProvide = (
  value: ComputedRef<VObject> | WritableComputedRef<VObject>,
  route: any,
) => {
  const { context: parentContext } = useContextInject();

  const context = reactive({
    _route: route,
    _form: {},
    _parent: parentContext,
  });

  watch(
    value,
    () => {
      context._form = value.value;
    },
    {
      deep: true,
      immediate: true,
    },
  );

  provide(useContextKey, context);

  return { context };
};

const useContextInject = () => {
  const context = inject(useContextKey) as VObject;
  return { context };
};

export { useContextProvide, useContextInject };
