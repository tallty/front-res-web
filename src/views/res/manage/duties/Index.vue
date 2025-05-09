<script lang="ts">
import ComResManageDutyIndex from '@/components/res/manage/duties/ComResManageDutyIndex.vue';
import { defineComponent } from '@vue/runtime-core';
import { ResManageDutyApi } from '@/res-core/apis/res/manage/duty.api';
import { ResDutyModel } from '@/res-core/models/res/manage/duty';
import { VStore } from '@/lib/vails';

import usePolicy from '@/components/global/ta-component/ta-template-form-core/usePolicy';

const ResManageDutyIndex = defineComponent({
  name: 'ResManageDutyIndex',
  components: {
    ComResManageDutyIndex,
  },
  setup() {
    usePolicy();
    const store = new VStore(new ResManageDutyApi(), ResDutyModel);

    return {
      store,
    };
  },
});

export default ResManageDutyIndex;
</script>

<template lang="pug">
.res-manage-duty-index
  ComResManageDutyIndex(:store='store' )
</template>

<style lang="stylus" scoped>
.res-manage-duty-index
  height 100%
  width 100%
</style>
