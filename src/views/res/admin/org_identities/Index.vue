<script lang="ts">
import ComResAdminOrgIdentitiesIndex from '@/components/res/admin/org_identities/ComResAdminOrgIdentitiesIndex.vue';
import { defineComponent } from '@vue/runtime-core';

const ResAdminOrgIdentitiesIndex = defineComponent({
  name: 'ResAdminOrgIdentitiesIndex',
  components: {
    ComResAdminOrgIdentitiesIndex,
  },
  setup() {},
});

export default ResAdminOrgIdentitiesIndex;
</script>

<template lang="pug">
.res-admin-org-identities-index
  ComResAdminOrgIdentitiesIndex
</template>

<style lang="stylus" scoped>
.res-admin-org-identities-index
  height 100%
  width 100%
</style>
