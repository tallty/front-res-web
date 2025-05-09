<script lang="ts">
import ComResManageMembershipIndex from '@/components/res/manage/memberships/ComResManageMembershipIndex.vue';
import { defineComponent } from '@vue/runtime-core';
import { ResManageMembershipApi } from '@/res-core/apis/res/manage/membership.api';
import { ResMembershipModel } from '@/res-core/models/res/manage/membership';
import { VStore } from '@/lib/vails';

import usePolicy from '@/components/global/ta-component/ta-template-form-core/usePolicy';

const ResManageMembershipIndex = defineComponent({
  name: 'ResManageMembershipIndex',
  components: {
    ComResManageMembershipIndex,
  },
  setup() {
    usePolicy();

    const store = new VStore(new ResManageMembershipApi(), ResMembershipModel);

    return {
      store,
    };
  },
});

export default ResManageMembershipIndex;
</script>

<template lang="pug">
.res-manage-membership-index
  ComResManageMembershipIndex(:store='store' )
</template>

<style lang="stylus" scoped>
.res-manage-membership-index
  height 100%
  width 100%
</style>
