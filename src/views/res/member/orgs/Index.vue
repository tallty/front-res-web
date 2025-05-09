<script lang="ts">
import ComResOrgsIndex from '@/components/res/orgs/ComResOrgsIndex.vue';
import { defineComponent } from '@vue/runtime-core';
import { ResMemberOrgsApi } from '@/res-core/apis/res/member/orgs.api';
import { VStore } from '@/lib/vails';

const ResMemberOrgsIndex = defineComponent({
  name: 'ResMemberOrgsIndex',
  components: {
    ComResOrgsIndex,
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

export default ResMemberOrgsIndex;
</script>

<template lang="pug">
.res-member-orgs-index
  ComResOrgsIndex(:store='store')
</template>

<style lang="stylus" scoped>
.res-member-orgs-index
  height 100%
  width 100%
</style>
