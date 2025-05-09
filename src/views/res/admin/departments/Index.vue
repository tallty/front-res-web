<script lang="ts">
import ComResAdminDepartmentsIndex from '@/components/res/admin/departments/ComResAdminDepartmentsIndex.vue';
import { defineComponent } from '@vue/runtime-core';

const ResAdminDepartmentsIndex = defineComponent({
  name: 'ResAdminDepartmentsIndex',
  components: {
    ComResAdminDepartmentsIndex,
  },
  setup() {},
});

export default ResAdminDepartmentsIndex;
</script>

<template lang="pug">
.res-admin-departments-index
  ComResAdminDepartmentsIndex
</template>

<style lang="stylus" scoped>
.res-admin-departments-index
  height 100%
  width 100%
</style>
