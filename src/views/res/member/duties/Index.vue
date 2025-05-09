<script lang="ts">
import ComResDutiesIndex from '@/components/res/duties/ComResDutiesIndex.vue';
import { defineComponent } from '@vue/runtime-core';
import { ResMemberDutiesApi } from '@/res-core/apis/res/member/duties.api';
import { VStore } from '@/lib/vails';

const ResMemberDutiesIndex = defineComponent({
  name: 'ResMemberDutiesIndex',
  components: {
    ComResDutiesIndex,
  },
  setup() {
    const store = new VStore(new ResMemberDutiesApi());

    return {
      store,
    };
  },
});

export default ResMemberDutiesIndex;
</script>

<template lang="pug">
.res-member-duties-index
  ComResDutiesIndex(:store='store' )
</template>

<style lang="stylus" scoped>
.res-member-duties-index
  height 100%
  width 100%
</style>
