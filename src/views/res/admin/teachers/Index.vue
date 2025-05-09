<script lang="ts">
import ComResAdminMembersTableIndex from '@/components/res/admin/members/ComResAdminMembersTableIndex.vue';
import { defineComponent } from '@vue/runtime-core';

const ResAdminMembersIndex = defineComponent({
  name: 'ResAdminMembersIndex',
  components: {
    ComResAdminMembersTableIndex,
  },
  setup() {},
});

export default ResAdminMembersIndex;
</script>

<template lang="pug">
.res-admin-members-index
  ComResAdminMembersTableIndex
</template>

<style lang="stylus" scoped>
.res-admin-members-index
  height 100%
  width 100%
</style>
