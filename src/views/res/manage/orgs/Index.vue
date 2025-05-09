<script lang="ts">
import ComResManageOrgIndex from '@/components/res/manage/orgs/ComResManageOrgIndex.vue';
import { defineComponent } from '@vue/runtime-core';
import { ResManageOrgApi } from '@/res-core/apis/res/manage/org.api';
import { ResOrgModel } from '@/res-core/models/res/org';
import { VStore } from '@/lib/vails';
import usePolicy from '@/components/global/ta-component/ta-template-form-core/usePolicy';
import { useRoute } from 'vue-router';

const ResManageOrgIndex = defineComponent({
  name: 'ResManageOrgIndex',
  components: {
    ComResManageOrgIndex,
  },
  setup() {
    const route = useRoute();

    const api = route.meta.tanent
      ? new ResManageOrgApi({
          params: { q: { mode: 'tanent', tanents_code_eq: process.env.VUE_APP_TENENT_CODE } },
        })
      : new ResManageOrgApi();

    usePolicy();
    const store = new VStore(api, ResOrgModel);

    return {
      store,
    };
  },
});

export default ResManageOrgIndex;
</script>

<template lang="pug">
.res-manage-org-index
  ComResManageOrgIndex(:store='store' )
</template>

<style lang="stylus" scoped>
.res-manage-org-index
  height 100%
  width 100%
</style>
