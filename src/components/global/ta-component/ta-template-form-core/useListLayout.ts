import { VObject } from '@/lib/vails/model';
import { inject, ref, WritableComputedRef, computed, reactive } from 'vue';
import { get, set, cloneDeep } from 'lodash-es';
import useForm from './useForm';
import { useFormInject } from './useForm';
import { TaTemplateFormItem } from './types';
import { useAccessibilityInject } from './useAccessibility';
import useGetFormValue from './useGetFormValue';
import { nextTick } from 'process';

let sign = 0;

const useListLayout = (props: VObject, emit: any) => {
  const { formComponent } = useFormInject();
  const visible = ref(false);

  const key = computed(() =>
    [props.item.model_key_prefix, props.item.model_key].filter(i => i).join('.'),
  );

  const { hidden: accessibilityHidden, disabled: accessibilityDisabled } =
    useAccessibilityInject(key);

  const disabled = computed(() => (inject('isViewer') as boolean) || accessibilityDisabled.value);
  const hidden = computed(() => accessibilityHidden.value);

  const { getKey, setKey } = useGetFormValue(props.item);

  const records: WritableComputedRef<VObject[]> = computed({
    get: () => {
      const val = getKey(key.value);
      if (!val) {
        setKey(key.value, []);
      }
      for (let i = 0; i < (getKey(key.value) || []).length; i++) {
        cardTemplateAry.value[i] = cardTemplateAry.value[i] || cloneDeep(props.item);
      }
      return getKey(key.value);
    },
    set: val => {
      set(formComponent.value, key.value, val);
    },
  });

  const cardTemplateAry = ref<TaTemplateFormItem[]>([]);

  const fakeRecord = ref({
    formData: reactive<Record<string, any>>({}),
  });

  const generateKey = () => {
    return `${Date.now()}_${sign++}`;
  };

  const create = async (payload: VObject) => {
    // if (Object.keys(payload).length === 0) return;

    const newValue = { ...payload, _id: generateKey() };
    nextTick(() => {
      emit('create', newValue);
    });
    await records.value.push(newValue);
  };

  const update = async (payload: VObject) => {
    const index = records.value.findIndex(
      record =>
        (record._id && record._id === payload._id) || (record.id && record.id === payload.id),
    );
    emit('update', { ...payload });
    await records.value.splice(index, 1, { ...payload });
  };

  const emitUpdate = (payload: VObject) => {
    emit('update', { ...payload });
  };

  const { form, submit } = useForm(fakeRecord.value.formData, props.item, {
    create,
    update,
  });

  const resetFormData = (value: VObject = {}) => {
    Object.keys(fakeRecord.value.formData).forEach(
      key => (fakeRecord.value.formData[key] = undefined),
    );
    Object.keys(value).forEach(key => (fakeRecord.value.formData[key] = value[key]));
  };

  const onCreate = () => {
    if (disabled.value || props.item.options?.disabled_actions?.create) return;
    resetFormData();
    if (props.item.options?.edit_directly) {
      create({});
    } else {
      visible.value = true;
    }
  };

  if (props.item.options?.edit_directly && records.value.length === 0) {
    create({});
  }

  const onUpdate = (record: VObject) => {
    if (disabled.value || props.item.options?.disabled_actions?.update) return;
    resetFormData(record);
    visible.value = true;
  };

  const onDelete = (index: number) => {
    if (disabled.value || props.item.options?.disabled_actions?.destroy) return;
    emit('delete', { ...records.value[index] });
    records.value.splice(index, 1);
  };

  const onClear = () => (records.value = []);

  const onOk = () => {
    submit({
      success: () => {
        visible.value = false;
        resetFormData();
      },
      fail: error => {
        throw error;
      },
    });
  };

  const fakeModel = (record: VObject) => {
    return {
      formData: reactive(record),
    };
  };

  return {
    visible,
    records,
    form,
    onOk,
    onCreate,
    onUpdate,
    onDelete,
    onClear,
    fakeModel,
    emitUpdate,
    fakeRecord,
    disabled,
    hidden,
    cardTemplateAry,
    create,
    update,
    formComponent,
  };
};

export default useListLayout;
