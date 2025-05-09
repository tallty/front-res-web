<script lang="ts">
import { defineComponent, toRefs, computed, PropType, WritableComputedRef } from 'vue';
import { VStore } from '@/lib/vails';
import { TaTemplateFormItem } from '../../ta-template-form-core/types';
import { ResAdminUsersApi } from '@/res-core/apis/res/admin/users.api';

const TaUserField = defineComponent({
  name: 'TaUserField',
  components: {},
  props: {
    value: { type: Array as PropType<number[]>, required: true },
    item: { type: Object as PropType<TaTemplateFormItem>, required: true },
    disabled: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const localValue: WritableComputedRef<number[]> = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const store = new VStore(new ResAdminUsersApi());
    const config = computed(() => ({
      tableColumns: [
        { title: '姓名', dataIndex: 'name', type: 'string', search: true },
        { title: '账号', dataIndex: 'account', type: 'string', search: true },
      ],
    }));

    return {
      ...toRefs(props),
      localValue,
      config,
      store,
    };
  },
});
export default TaUserField;
</script>

<template lang="pug">
.ta-user-field
  TaStoreField(
    v-model:value='localValue',
    recordName='用户',
    :config='config',
    :store='store',
    :disabled='disabled',
    :multiple='multiple || item.options.multiple'
  )
</template>

<style lang="stylus" scoped></style>
