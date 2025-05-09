<script lang="ts">
import { defineComponent, watch, ref, toRefs } from 'vue';
import ComResUserShow from '../../users/ComResUserShow.vue';

const ComResAdminMemberShow = defineComponent({
  name: 'ComResAdminMemberShow',
  components: {
    ComResUserShow,
  },
  props: {
    record: { type: Object, required: true },
    store: { type: Object, required: true },
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
    };
  },
});

export default ComResAdminMemberShow;
</script>

<template lang="pug">
.com-res-admin-member-show.h-full
  ComResUserShow(
    :store='userStore',
    :memberStore='store',
    :tagRelationStore='tagRelationStore',
    :membershipStore='membershipStore',
    :record='user',
    v-if='user.id'
  )
</template>
