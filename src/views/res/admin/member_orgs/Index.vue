<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import ComResAdminMemberOrgsIndex from '@/components/res/admin/member_orgs/ComResAdminMemberOrgsIndex.vue';

const ResAdminMemberOrgsIndex = defineComponent({
  name: 'ResAdminMemberOrgsIndex',
  components: {
    ComResAdminMemberOrgsIndex,
  },
  setup() {},
});

export default ResAdminMemberOrgsIndex;
</script>

<template lang="pug">
.res-admin-org-identities-index
  ComResAdminMemberOrgsIndex
</template>

<style lang="stylus" scoped>
.res-admin-org-identities-index
  // height 100%
  width 100%
</style>
