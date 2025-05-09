import { provide, ref, inject } from 'vue';

const Key = 'useSubFormCollectorKey';

export const useSubFormCollector = () => {
  const registerSubFormCollector = (self: any) => {
    provide(Key, self);
    const parentForm = inject<any>(Key, null);
    if (parentForm?.subFormCollector) {
      parentForm.subFormCollector.push(self);
    }

    return { parentForm };
  };

  const initSubFormCollector = () => {
    const subFormCollector = ref<any[]>([]);

    return { subFormCollector };
  };

  return { registerSubFormCollector, initSubFormCollector };
};
