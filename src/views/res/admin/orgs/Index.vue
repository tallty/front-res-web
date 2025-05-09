<script lang="ts">
import ComResAdminOrgsIndex from '@/components/res/admin/orgs/ComResAdminOrgsIndex.vue';
import { defineComponent } from '@vue/runtime-core';

const ResAdminOrgsIndex = defineComponent({
  name: 'ResAdminOrgsIndex',
  components: {
    ComResAdminOrgsIndex,
  },
  setup() {},
});

export default ResAdminOrgsIndex;
</script>

<template lang="pug">
.res-admin-orgs-index
  ComResAdminOrgsIndex
</template>

<style lang="stylus" scoped>
.res-admin-orgs-index
  height 100%
  width 100%
</style>
