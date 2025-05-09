<script lang="ts">
import ComResManageDutyGroupShow from '@/components/res/manage/duty_groups/ComResManageDutyGroupShow.vue';
import { defineComponent, toRefs, onMounted, computed } from 'vue';
import { ResManageDutyGroupApi } from '@/res-core/apis/res/manage/duty_group.api';
import { ResDutyGroupModel } from '@/res-core/models/res/manage/duty_group';
import { VStore } from '@/lib/vails';
import { useRoute } from 'vue-router';

const ResManageDutyGroupShow = defineComponent({
  name: 'ResManageDutyGroupShow',
  components: {
    ComResManageDutyGroupShow,
  },
  setup(props) {
    const route = useRoute();

    const store = new VStore(new ResManageDutyGroupApi(), ResDutyGroupModel);

    const breadcrumbs = computed(() => [{ label: '', route: '/res/manage/duty_groups' }]);

    onMounted(() => {
      store.find(Number(route.params.duty_groupId));
    });

    return {
      ...toRefs(props),
      store,
      record: store.record,
      breadcrumbs,
    };
  },
});

export default ResManageDutyGroupShow;
</script>

<template lang="pug">
.res-manage-duty-group-show
  ComResManageDutyGroupShow(v-if='record.id', :store='store', :breadcrumbs='breadcrumbs')
</template>

<style lang="stylus" scoped>
.res-manage-duty-group-show
  height 100%
  width 100%
  .breadcrumbs
    padding 0 24px
</style>
