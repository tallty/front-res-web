<script lang="ts">
import ComResManageDutyGroupIndex from '@/components/res/manage/duty_groups/ComResManageDutyGroupIndex.vue';
import { defineComponent } from '@vue/runtime-core';
import { ResManageDutyGroupApi } from '@/res-core/apis/res/manage/duty_group.api';
import { ResDutyGroupModel } from '@/res-core/models/res/manage/duty_group';
import { VStore } from '@/lib/vails';

import usePolicy from '@/components/global/ta-component/ta-template-form-core/usePolicy';

const ResManageDutyGroupIndex = defineComponent({
  name: 'ResManageDutyGroupIndex',
  components: {
    ComResManageDutyGroupIndex,
  },
  setup() {
    usePolicy();

    const store = new VStore(new ResManageDutyGroupApi(), ResDutyGroupModel);

    return {
      store,
    };
  },
});

export default ResManageDutyGroupIndex;
</script>

<template lang="pug">
.res-manage-duty-group-index
  ComResManageDutyGroupIndex(:store='store' )
</template>

<style lang="stylus" scoped>
.res-manage-duty-group-index
  height 100%
  width 100%
</style>
