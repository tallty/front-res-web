<script lang="ts">
import ComResMembersShow from '@/components/res/members/ComResMembersShow.vue';
import { defineComponent, toRefs, onMounted, computed } from 'vue';
import { ResMemberMembersApi } from '@/res-core/apis/res/member/members.api';
import { VStore } from '@/lib/vails';
import { useRoute } from 'vue-router';

const ResMemberMembersShow = defineComponent({
  name: 'ResMemberMembersShow',
  components: {
    ComResMembersShow,
  },
  setup(props) {
    const route = useRoute();

    const store = new VStore(new ResMemberMembersApi());

    const breadcrumbs = computed(() => [{ label: '', route: '/res/member/members' }]);

    onMounted(() => {
      store.find(Number(route.params.memberId));
    });

    return {
      ...toRefs(props),
      store,
      record: store.record,
      breadcrumbs,
    };
  },
});

export default ResMemberMembersShow;
</script>

<template lang="pug">
.res-member-members-show
  ComResMembersShow(v-if='record.id', :store='store', :breadcrumbs='breadcrumbs')
</template>

<style lang="stylus" scoped>
.res-member-members-show
  height 100%
  width 100%
  .breadcrumbs
    padding 0 24px
</style>
