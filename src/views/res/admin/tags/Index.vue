<script lang="ts">
import { defineComponent } from 'vue';
import ComResAdminTagIndex from '@/components/res/admin/tags/ComResAdminTagIndex.vue';

const ResAdminTagIndex = defineComponent({
  name: 'ResAdminTagIndex',
  components: {
    ComResAdminTagIndex,
  },
  setup() {
  },
});

export default ResAdminTagIndex;
</script>

<template lang="pug">
.res-admin-tags-index
  ComResAdminTagIndex
</template>

<style lang="stylus" scoped>
.res-admin-duties-index
  height 100%
  width 100%
</style>