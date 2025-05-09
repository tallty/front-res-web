<script lang="ts">
import { defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import ComResManageEnterpriseIndex from '../../../../components/res/manage/enterprises/ComResManageEnterpriseIndex.vue';
import { EncryptRouteId } from '@/components/global/ta-component/utils/EncryptRouteId';

const ResUserEnterprisesIndex = defineComponent({
  name: 'ResUserEnterprisesIndex',
  components: {
    ComResManageEnterpriseIndex,
  },
  setup() {
    const route = useRoute();

    const params = route.query.options
      ? EncryptRouteId.decrypt(route.query.options as string).params
      : {};

    return {
      params,
    };
  },
});

export default ResUserEnterprisesIndex;
</script>

<template lang="pug">
.res-user-manage-enterprises-index
  ComResManageEnterpriseIndex
</template>

<style lang="stylus" scoped>
.res-user-manage-enterprises-index
  height 100%
  width 100%
</style>
