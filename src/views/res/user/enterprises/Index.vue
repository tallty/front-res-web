<script lang="ts">
import { defineComponent } from 'vue';
import ComResUserEnterprisesIndex from '@/components/res/users/ComResUserEnterprisesIndex.vue';
import { EncryptRouteId } from '@/components/global/ta-component/utils/EncryptRouteId';
import { useRoute } from 'vue-router';

const ResUserEnterprisesIndex = defineComponent({
  name: 'ResUserEnterprisesIndex',
  components: {
    ComResUserEnterprisesIndex,
  },
  setup() {
    const route = useRoute();

    const extraOptions = route.query.options
      ? EncryptRouteId.decrypt(route.query.options as string).params
      : {};

    const options = {
      form: {},
      template: 'membership#join_request',
      ...extraOptions,
    };
    return {
      options,
    };
  },
});

export default ResUserEnterprisesIndex;
</script>

<template lang="pug">
.res-user-enterprises-index
  ComResUserEnterprisesIndex(
    :formOptions='options.form',
    :joinTemplate='options.template'
  )
</template>

<style lang="stylus" scoped>
.res-user-enterprises-index
  height 100%
  width 100%
</style>
