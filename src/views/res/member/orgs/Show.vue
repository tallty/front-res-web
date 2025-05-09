<script lang="ts">
import ComResOrgsShow from '@/components/res/orgs/ComResOrgsShow.vue';
import { defineComponent, toRefs, onMounted } from 'vue';
import { ResMemberOrgsApi } from '@/res-core/apis/res/member/orgs.api';
import { VStore } from '@/lib/vails';
import { useRoute } from 'vue-router';

const ResMemberOrgsShow = defineComponent({
  name: 'ResMemberOrgsShow',
  components: {
    ComResOrgsShow,
  },
  setup(props) {
    const route = useRoute();

    const store = new VStore(new ResMemberOrgsApi());

    onMounted(() => {
      store.find(Number(route.params.orgId));
    });

    return {
      ...toRefs(props),
      store,
      record: store.record,
    };
  },
});

export default ResMemberOrgsShow;
</script>

<template lang="pug">
.res-member-orgs-show
  ComResOrgsShow(v-if='record.id', :store='store')
</template>

<style lang="stylus" scoped>
.res-member-orgs-show
  height 100%
  width 100%
  .breadcrumbs
    padding 0 24px
</style>
