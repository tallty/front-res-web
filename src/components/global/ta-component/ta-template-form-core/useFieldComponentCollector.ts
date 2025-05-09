import { ref, Ref } from 'vue';

const useFieldComponentCollector = () => {
  const fieldComponents: Ref<any[]> = ref([]);

  const addField = (field: any) => {
    if (field) {
      fieldComponents.value.push(field);
    }
  };

  const removeField = (field: any) => {
    if (field) {
      fieldComponents.value = fieldComponents.value.filter((f) => f !== field);
    }
  };

  const validate = (callback?: {
    success?: () => void;
    failure?: () => void;
  }) => {
    const promiseList: Promise<any>[] = [];

    fieldComponents.value.forEach((field) => {
      if (!field.item.rules && !field.item.validate) {
        return;
      }
      promiseList.push(field.validate ? field.validate() : Promise.resolve());
    });

    return new Promise<boolean>((resolve, reject) => {
      Promise.all(promiseList)
        .then(() => {
          callback?.success && callback.success();
          resolve(true);
        })
        .catch(() => {
          callback?.failure && callback.failure();
          reject();
        });
    });
  };

  return {
    fieldComponents,
    addField,
    removeField,
    validate,
  };
};

export default useFieldComponentCollector;
