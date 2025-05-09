import { inject, provide, computed, ref, ComputedRef } from 'vue';
const ModelKeyPrefixKey = 'modelKeyPrefix';

const useModelKeyPrefix = (props?: any, reset = false) => {
  const parentPrefix = inject(ModelKeyPrefixKey, undefined) as ComputedRef<string> | undefined;

  const modelKeyPrefix = computed(() =>
    [parentPrefix?.value, props?.modelKeyPrefix].filter(i => i).join('.'),
  );
  if (reset) {
    provide(ModelKeyPrefixKey, ref(''));
  } else {
    provide(ModelKeyPrefixKey, modelKeyPrefix);
  }

  return {
    modelKeyPrefix,
  };
};

export default useModelKeyPrefix;
