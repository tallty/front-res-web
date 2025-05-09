<script lang="ts">
import ComResManageMembershipShow from '@/components/res/manage/memberships/ComResManageMembershipShow.vue';
import { defineComponent, toRefs, onMounted, computed } from 'vue';
import { ResManageMembershipApi } from '@/res-core/apis/res/manage/membership.api';
import { ResMembershipModel } from '@/res-core/models/res/manage/membership';
import { VStore } from '@/lib/vails';
import { useRoute } from 'vue-router';

const ResManageMembershipShow = defineComponent({
  name: 'ResManageMembershipShow',
  components: {
    ComResManageMembershipShow,
  },
  setup(props) {
    const route = useRoute();

    const store = new VStore(new ResManageMembershipApi(), ResMembershipModel);

    const breadcrumbs = computed(() => [{ label: '', route: '/res/manage/memberships' }]);

    onMounted(() => {
      store.find(Number(route.params.membershipId));
    });

    return {
      ...toRefs(props),
      store,
      record: store.record,
      breadcrumbs,
    };
  },
});

export default ResManageMembershipShow;
</script>

<template lang="pug">
.res-manage-membership-show
  ComResManageMembershipShow(v-if='record.id', :store='store', :breadcrumbs='breadcrumbs')
</template>

<style lang="stylus" scoped>
.res-manage-membership-show
  height 100%
  width 100%
  .breadcrumbs
    padding 0 24px
</style>
