<script lang="ts">
import { defineComponent, watch, ref, toRefs } from 'vue';
import ComResUserShow from '../../users/ComResUserShow.vue';

const ComResAdminTagShow = defineComponent({
  name: 'ComResAdminTagShow',
  components: {
    ComResUserShow
  },
  props: {
    record: { type: Object, required: true },
    tagRelationStore: { type: Object, required: true },
    userStore: { type: Object, required: true },
    membershipStore: { type: Object, required: true },
  },
  setup(props) {
    const user = ref({});

    props.userStore.find(props.record.user_id).then((res: any) => {
      user.value = props.userStore.new(res.data);
    });

    return {
      ...toRefs(props),
      user,
    }
  },
});

export default ComResAdminTagShow;
</script>

<template lang="pug">
.com-res-admin-tag-show
  ComResUserShow(
    :store='userStore',
    :tagRelationStore='tagRelationStore',
    :membershipStore='membershipStore',
    :record='user',
    v-if='user.id'
  )
</template>
