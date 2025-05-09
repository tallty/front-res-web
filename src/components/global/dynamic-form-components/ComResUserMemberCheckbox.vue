<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { clone } from 'lodash';
import { ResChargeMemberIdentityApi } from '@/res-core/apis/res/charge/member_identity.api';
import { VObject } from '@/lib/vails';

const ComResUserMemberCheckbox = defineComponent({
  name: 'ComResUserMemberCheckbox',
  props: {
    value: { type: Object, default: () => ({}) },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: val => emit('update:value', val),
    });

    const options = ref<VObject[]>([]);

    const checkedIds = clone(localValue.value.member_identity_ids);

    const fetchIdentities = () => {
      const q = localValue.value.org_id
        ? { org_id_eq: localValue.value.org_id, org_id_null: 1, m: 'or' }
        : {};
      new ResChargeMemberIdentityApi().index({ q, per_page: 9999 }).then(({ data }) => {
        options.value = data.records.map((record: VObject) => ({
          value: record.id,
          label: record.name,
          disabled: checkedIds.includes(record.id) && !record.org_id && localValue.value.org_id,
        }));
      });
    };

    fetchIdentities();

    return {
      localValue,
      options,
    };
  },
});

export default ComResUserMemberCheckbox;
</script>
<template lang="pug">
.com-res-user-member-checkbox
  .value(v-if='disabled') {{ localValue.member_identity_names.join("、") }}
  a-checkbox-group(v-model:value='localValue.member_identity_ids', :options='options' v-else)
</template>

<stype></stype>
