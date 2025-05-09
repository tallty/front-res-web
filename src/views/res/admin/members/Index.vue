<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import ComResAdminMembersIndex from '@/components/res/admin/members/ComResAdminMembersIndex.vue';

const ResAdminMembersIndex = defineComponent({
  name: 'ResAdminMembersIndex',
  components: {
    ComResAdminMembersIndex,
  },
  setup() {},
});

export default ResAdminMembersIndex;
</script>

<template lang="pug">
.res-admin-members-index
  ComResAdminMembersIndex
</template>

<style lang="stylus" scoped>
.res-admin-members-index
  height 100%
  width 100%
</style>
