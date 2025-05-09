<script lang="ts">
import ComResOrgsShow from '@/components/res/orgs/ComResOrgsShow.vue';
import { defineComponent, toRefs, onMounted, computed } from 'vue';
import { ResUserOrgsApi } from '@/res-core/apis/res/user/orgs.api';
import { VStore } from '@/lib/vails';
import { useRoute } from 'vue-router';

const ResUserOrgsShow = defineComponent({
  name: 'ResUserOrgsShow',
  components: {
    ComResOrgsShow,
  },
  setup(props) {
    const route = useRoute();

    const store = new VStore(new ResUserOrgsApi());

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

export default ResUserOrgsShow;
</script>

<template lang="pug">
.res-user-orgs-show
  ComResOrgsShow(v-if='record.id', :store='store')
</template>

<style lang="stylus" scoped>
.res-user-orgs-show
  height 100%
  width 100%
  .breadcrumbs
    padding 0 24px
</style>
