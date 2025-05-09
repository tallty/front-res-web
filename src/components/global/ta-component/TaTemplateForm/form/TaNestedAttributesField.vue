<script lang="ts">
import { ref, defineComponent, toRefs, PropType, computed, onMounted } from 'vue';
import { TaTemplateFormItem } from '../../ta-template-form-core/types';
import { useFormInject } from '@/components/global/ta-component/ta-template-form-core/useForm';
import useProcessFields from '../../ta-template-form-core/useProcessFields';
import { get, set } from 'lodash';
import { VObject } from '@/lib/vails/model';
import useNestedAttributes from '../../ta-template-form-core/useNestedAttributes';

const TaNestedAttributesField = defineComponent({
  name: 'TaNestedAttributesField',
  components: {},
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => [] },
    hidden: { type: Boolean, default: false },
  },
  setup(props) {
    // NOTE: nested attributes 交互值的 key 将会是 `${key}_attributes`, 见 nestedAttributesValue

    const { formComponent } = useFormInject();

    const { getKey } = useProcessFields();

    const key = computed(() => getKey(props.item));
    const nestedKey = computed(() => `${key.value}_attributes`);

    const nestedAttributesValue = computed({
      get: () => get(formComponent.value, nestedKey.value),
      set: val => set(formComponent.value, nestedKey.value, val),
    });

    onMounted(() => {
      if (!nestedAttributesValue.value) {
        nestedAttributesValue.value = [];
      }
    });

    const onCreate = (payload: VObject) => {
      runAppendNestedAttributes(payload);
    };

    const onUpdate = (payload: VObject) => {
      runAppendNestedAttributes(payload);
    };

    const onDelete = (payload: VObject) => {
      runAppendNestedAttributes({ ...payload, _destroy: true });
    };

    const { appendNestedAttributes } = useNestedAttributes();

    const runAppendNestedAttributes = (payload: VObject) => {
      appendNestedAttributes(payload, nestedAttributesValue);
    };

    return {
      ...toRefs(props),
      onCreate,
      onUpdate,
      onDelete,
    };
  },
});
export default TaNestedAttributesField;
</script>

<template lang="pug">
.ta-nested-attributes-field
  TaTemplateFormListLayout(
    :class='{ hidden }',
    :item='item',
    @create='onCreate',
    @update='onUpdate',
    @delete='onDelete',
  )
  slot(:actions='{ onCreate, onUpdate, onDelete }')
</template>

<style lang="stylus" scoped></style>
