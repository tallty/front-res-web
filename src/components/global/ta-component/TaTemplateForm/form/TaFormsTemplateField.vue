<script lang="ts">
import { defineComponent, toRefs, computed, PropType, WritableComputedRef } from 'vue';
import { VStore } from '@/lib/vails';
import { FormsAdminTemplatesApi } from '@/engines/com/apis/forms/admin/templates.api';
import { TaTemplateFormItem } from '../../ta-template-form-core/types';

const TaFormsTemplateField = defineComponent({
  name: 'TaFormsTemplateField',
  components: {},
  props: {
    value: { type: Number, required: true },
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const localValue: WritableComputedRef<number[]> = computed({
      get: () => [props.value],
      set: val => emit('update:value', val[0]),
    });

    const store = new VStore(new FormsAdminTemplatesApi());
    const config = computed(() => ({
      tableColumns: [{ title: '名称', dataIndex: 'name', type: 'string', search: true }],
    }));

    return {
      ...toRefs(props),
      localValue,
      config,
      store,
    };
  },
});
export default TaFormsTemplateField;
</script>

<template lang="pug">
.ta-forms-template-field
  TaStoreField(
    v-model:value='localValue',
    recordName='表单模板',
    :config='config',
    :store='store',
    :disabled='disabled',
    :multiple='false'
  )
    template(#tags='{ records }')
      TaTemplateFormViewer(
        v-if='records[0]',
        :template='records[0].form',
        :record='{ formData: {} }'
      )
</template>

<style lang="stylus" scoped></style>
