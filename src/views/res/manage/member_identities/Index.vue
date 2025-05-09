<script lang="ts">
import ComResManageMemberIdentityIndex from '@/components/res/manage/member_identities/ComResManageMemberIdentityIndex.vue';
import { defineComponent } from '@vue/runtime-core';
import { ResManageMemberIdentityApi } from '@/res-core/apis/res/manage/member_identity.api';
import { ResMemberIdentityModel } from '@/res-core/models/res/manage/member_identity';
import { VStore } from '@/lib/vails';

import usePolicy from '@/components/global/ta-component/ta-template-form-core/usePolicy';

const ResManageMemberIdentityIndex = defineComponent({
  name: 'ResManageMemberIdentityIndex',
  components: {
    ComResManageMemberIdentityIndex,
  },
  setup() {
    usePolicy();

    const store = new VStore(new ResManageMemberIdentityApi(), ResMemberIdentityModel);

    return {
      store,
    };
  },
});

export default ResManageMemberIdentityIndex;
</script>

<template lang="pug">
.res-manage-member-identity-index
  ComResManageMemberIdentityIndex(:store='store' )
</template>

<style lang="stylus" scoped>
.res-manage-member-identity-index
  height 100%
  width 100%
</style>
