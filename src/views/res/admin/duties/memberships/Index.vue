<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import { ResMembershipModel } from '@/res-core/models/res/manage/membership';
import { VStore } from '@/lib/vails';

import usePolicy from '@/components/global/ta-component/ta-template-form-core/usePolicy';
import { ResDutyModel } from '../../../../../res-core/models/res/manage/duty';
import { useRoute } from 'vue-router';
import useNavigateTab from '../../../../../../../components/global/ta-component/useNavigateTab';
import { ResAdminMembershipsApi } from '../../../../../res-core/apis/res/admin/memberships.api';
import { ResAdminDutiesApi } from '../../../../../res-core/apis/res/admin/duties.api';
import ComResDutiesMembershipsIndex from '../../../../../components/res/duties/memberships/ComResDutiesMembershipsIndex.vue';

const ResAdminDutiesMembershipIndex = defineComponent({
  name: 'ResAdminDutiesMembershipIndex',
  components: {
    ComResDutiesMembershipsIndex,
  },
  setup() {
    usePolicy();

    const route = useRoute();
    const dutyId = Number(route.params.dutyId);

    const dutyStore = new VStore(new ResAdminDutiesApi(), ResDutyModel);
    const store = new VStore(
      new ResAdminMembershipsApi({
        parents: [{ type: 'duties', id: dutyId }],
      }),
      ResMembershipModel,
    );

    const { updateTitle } = useNavigateTab();

    dutyStore.find(dutyId).then(() => {
      updateTitle(dutyStore.record.value.name, route.fullPath);
    });

    return {
      store,
      duty: dutyStore.record,
    };
  },
});

export default ResAdminDutiesMembershipIndex;
</script>

<template lang="pug">
ComResDutiesMembershipsIndex.res-manage-duties-membership-index(
  v-if='duty?.id',
  :store='store',
  :duty='duty'
)
</template>

<style lang="stylus" scoped>
.res-manage-duties-membership-index
  height 100%
  width 100%
</style>
