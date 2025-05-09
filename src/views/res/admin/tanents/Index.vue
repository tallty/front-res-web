<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import ComResAdminTanentsIndex from '@/components/res/admin/tanents/ComResAdminTanentsIndex.vue';

const ResAdminTanentsIndex = defineComponent({
  name: 'ResAdminMembersIndex',
  components: {
    ComResAdminTanentsIndex,
  },
  setup() {},
});

export default ResAdminTanentsIndex;
</script>

<template lang="pug">
.res-admin-tanents-index.h-full.w-full
  ComResAdminTanentsIndex
</template>
