<script lang="ts">
import { defineComponent, toRefs, computed, PropType, WritableComputedRef } from 'vue';
import { TaTemplateFormItem } from '../../ta-template-form-core/types';
import { VStore } from '@/lib/vails';
import { ResAdminMembersApi } from '@/res-core/apis/res/admin/members.api';

const TaSingleMemberField = defineComponent({
  name: 'TaSingleMemberField',
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

    const store = new VStore(new ResAdminMembersApi());
    const config = computed(() => ({
      tableColumns: [
        { title: 'user_id', dataIndex: 'user_id', type: 'string', search: true },
        {
          title: 'member_identity_id',
          dataIndex: 'member_identity_id',
          type: 'string',
          search: true,
        },
      ],
    }));

    return {
      ...toRefs(props),
      localValue,
      store,
      config,
    };
  },
});
export default TaSingleMemberField;
</script>

<template lang="pug">
.ta-single-member-field
  TaStoreField(
    v-model:value='localValue',
    recordName='成员',
    :config='config',
    :store='store',
    :disabled='disabled',
    :multiple='multiple || item.options.multiple'
  )
</template>

<style lang="stylus" scoped></style>
