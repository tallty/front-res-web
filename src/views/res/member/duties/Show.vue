<script lang="ts">
import ComResDutiesShow from '@/components/res/duties/ComResDutiesShow.vue';
import { defineComponent, toRefs, onMounted, computed } from 'vue';
import { ResMemberDutiesApi } from '@/res-core/apis/res/member/duties.api';
import { VStore } from '@/lib/vails';
import { useRoute } from 'vue-router';

const ResMemberDutiesShow = defineComponent({
  name: 'ResMemberDutiesShow',
  components: {
    ComResDutiesShow,
  },
  setup(props) {
    const route = useRoute();

    const store = new VStore(new ResMemberDutiesApi());

    const breadcrumbs = computed(() => [{ label: '', route: '/res/member/duties' }]);

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

export default ResMemberDutiesShow;
</script>

<template lang="pug">
.res-member-duties-show
  ComResDutiesShow(v-if='record.id', :store='store', :breadcrumbs='breadcrumbs')
</template>

<style lang="stylus" scoped>
.res-member-duties-show
  height 100%
  width 100%
  .breadcrumbs
    padding 0 24px
</style>
