<script lang="ts">
import ComResMembersIndex from '@/components/res/members/ComResMembersIndex.vue';
import { defineComponent } from '@vue/runtime-core';
import { ResMemberMembersApi } from '@/res-core/apis/res/member/members.api';
import { VStore } from '@/lib/vails';

const ResMemberMembersIndex = defineComponent({
  name: 'ResMemberMembersIndex',
  components: {
    ComResMembersIndex,
  },
  setup() {
    const store = new VStore(new ResMemberMembersApi());

    return {
      store,
    };
  },
});

export default ResMemberMembersIndex;
</script>

<template lang="pug">
.res-member-members-index
  ComResMembersIndex(:store='store' )
</template>

<style lang="stylus" scoped>
.res-member-members-index
  height 100%
  width 100%
</style>
