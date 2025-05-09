<script lang="ts">
import ComResOrgsIndex from '@/components/res/orgs/ComResOrgsIndex.vue';
import { defineComponent } from '@vue/runtime-core';
import { ResUserOrgsApi } from '@/res-core/apis/res/user/orgs.api';
import { VStore } from '@/lib/vails';

const ResUserOrgsIndex = defineComponent({
  name: 'ResUserOrgsIndex',
  components: {
    ComResOrgsIndex,
  },
  setup() {
    const store = new VStore(
      new ResUserOrgsApi({
        params: { q: { s: ['position asc'] } },
      }),
    );

    return {
      store,
    };
  },
});

export default ResUserOrgsIndex;
</script>

<template lang="pug">
.res-user-orgs-index
  ComResOrgsIndex(:store='store' )
</template>

<style lang="stylus" scoped>
.res-user-orgs-index
  height 100%
  width 100%
</style>
