<script lang="ts">
import ComResManageDutyShow from '@/components/res/manage/duties/ComResManageDutyShow.vue';
import { defineComponent, toRefs, onMounted, computed } from 'vue';
import { ResManageDutyApi } from '@/res-core/apis/res/manage/duty.api';
import { ResDutyModel } from '@/res-core/models/res/manage/duty';
import { VStore } from '@/lib/vails';
import { useRoute } from 'vue-router';

const ResManageDutyShow = defineComponent({
  name: 'ResManageDutyShow',
  components: {
    ComResManageDutyShow,
  },
  setup(props) {
    const route = useRoute();

    const store = new VStore(new ResManageDutyApi(), ResDutyModel);

    const breadcrumbs = computed(() => [{ label: '', route: '/res/manage/duties' }]);

    onMounted(() => {
      store.find(Number(route.params.dutyId));
    });

    return {
      ...toRefs(props),
      store,
      record: store.record,
      breadcrumbs,
    };
  },
});

export default ResManageDutyShow;
</script>

<template lang="pug">
.res-manage-duty-show
  ComResManageDutyShow(v-if='record.id', :store='store', :breadcrumbs='breadcrumbs')
</template>

<style lang="stylus" scoped>
.res-manage-duty-show
  height 100%
  width 100%
  .breadcrumbs
    padding 0 24px
</style>
