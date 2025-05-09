<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import { ResMemberOrgsApi } from '@/res-core/apis/res/member/orgs.api';
import { VStore } from '@/lib/vails';
import ComResDepartmentsIndex from '@/components/res/departments/ComResDepartmentsIndex.vue';

const ResMemberDepartmentsIndex = defineComponent({
  name: 'ResMemberDepartmentsIndex',
  components: {
    ComResDepartmentsIndex,
  },
  setup() {
    const store = new VStore(
      new ResMemberOrgsApi({
        params: { q: { s: ['position asc'] } },
      }),
    );

    return {
      store,
    };
  },
});

export default ResMemberDepartmentsIndex;
</script>

<template lang="pug">
.res-member-orgs-index
  ComResDepartmentsIndex(:store='store')
</template>

<style lang="stylus" scoped>
.res-member-orgs-index
  height 100%
  width 100%
</style>
