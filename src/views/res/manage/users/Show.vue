<script lang="ts">
import ComResManageUserShow from '@/components/res/manage/users/ComResManageUserShow.vue';
import { defineComponent, toRefs, onMounted, computed } from 'vue';
import { ResManageUserApi } from '@/res-core/apis/res/manage/user.api';
import { ResUserModel } from '@/res-core/models/res/manage/user';
import { VStore } from '@/lib/vails';
import { useRoute } from 'vue-router';

const ResManageUserShow = defineComponent({
  name: 'ResManageUserShow',
  components: {
    ComResManageUserShow,
  },
  setup(props) {
    const route = useRoute();

    const store = new VStore(new ResManageUserApi(), ResUserModel);

    const breadcrumbs = computed(() => [{ label: '', route: '/res/manage/users' }]);

    onMounted(() => {
      store.find(Number(route.params.userId));
    });

    return {
      ...toRefs(props),
      store,
      record: store.record,
      breadcrumbs,
    };
  },
});

export default ResManageUserShow;
</script>

<template lang="pug">
.res-manage-user-show
  ComResManageUserShow(v-if='record.id', :store='store', :breadcrumbs='breadcrumbs')
</template>

<style lang="stylus" scoped>
.res-manage-user-show
  height 100%
  width 100%
  .breadcrumbs
    padding 0 24px
</style>
