<script lang="ts">
// 这条独属于纪委的条线部分，特殊处理了
// 开始进入的是获取组织id，但将其放到了department的路由上，因为后续的store都是department
import { defineComponent, toRefs, onMounted } from 'vue';
import { ResMemberOrgsApi } from '@/res-core/apis/res/member/orgs.api';
import { VStore } from '@/lib/vails';
import { useRoute } from 'vue-router';
import ComResDepartmentsShow from '@/components/res/departments/ComResDepartmentsShow.vue';

const ResMemberDepartmentsShow = defineComponent({
  name: 'ResMemberDepartmentsShow',
  components: {
    ComResDepartmentsShow,
  },
  setup(props) {
    const route = useRoute();

    const store = new VStore(new ResMemberOrgsApi());

    onMounted(() => {
      store.find(Number(route.params.departmentId));
    });

    return {
      ...toRefs(props),
      store,
      record: store.record,
    };
  },
});

export default ResMemberDepartmentsShow;
</script>

<template lang="pug">
.res-member-orgs-show
  ComResDepartmentsShow(v-if='record.id', :store='store')
</template>

<style lang="stylus" scoped>
.res-member-orgs-show
  height 100%
  width 100%
  .breadcrumbs
    padding 0 24px
</style>
