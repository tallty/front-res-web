<script lang="ts">
import ComResManageMemberIdentityShow from '@/components/res/manage/member_identities/ComResManageMemberIdentityShow.vue';
import { defineComponent, toRefs, onMounted, computed } from 'vue';
import { ResManageMemberIdentityApi } from '@/res-core/apis/res/manage/member_identity.api';
import { ResMemberIdentityModel } from '@/res-core/models/res/manage/member_identity';
import { VStore } from '@/lib/vails';
import { useRoute } from 'vue-router';

const ResManageMemberIdentityShow = defineComponent({
  name: 'ResManageMemberIdentityShow',
  components: {
    ComResManageMemberIdentityShow,
  },
  setup(props) {
    const route = useRoute();

    const store = new VStore(new ResManageMemberIdentityApi(), ResMemberIdentityModel);

    const breadcrumbs = computed(() => [{ label: '', route: '/res/manage/member_identities' }]);

    onMounted(() => {
      store.find(Number(route.params.member_identityId));
    });

    return {
      ...toRefs(props),
      store,
      record: store.record,
      breadcrumbs,
    };
  },
});

export default ResManageMemberIdentityShow;
</script>

<template lang="pug">
.res-manage-member-identity-show
  ComResManageMemberIdentityShow(v-if='record.id', :store='store', :breadcrumbs='breadcrumbs')
</template>

<style lang="stylus" scoped>
.res-manage-member-identity-show
  height 100%
  width 100%
  .breadcrumbs
    padding 0 24px
</style>
