<script lang="ts">
import { defineComponent } from 'vue';
import ComResAdminDutyIndex from '@/components/res/admin/duties/ComResAdminDutyIndex.vue';

const ResAdminDutiesIndex = defineComponent({
  name: 'ResAdminDutiesIndex',
  components: {
    ComResAdminDutyIndex,
  },
  setup() {
  },
});

export default ResAdminDutiesIndex;
</script>

<template lang="pug">
.res-admin-duties-index
  ComResAdminDutyIndex
</template>

<style lang="stylus" scoped>
.res-admin-duties-index
  height 100%
  width 100%
</style>
