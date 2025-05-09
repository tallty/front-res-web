<script lang="ts">
import { defineComponent, toRefs, PropType, ref } from 'vue';
import ComResUserHeaderContent from '../../users/ComResUserHeaderContent.vue';
import ComResUserBasicInfo from '../../users/ComResUserBasicInfo.vue';

const ComResManageUserShow = defineComponent({
  name: 'ComResManageUserShow',
  components: {
    ComResUserHeaderContent,
    ComResUserBasicInfo,
  },
  props: {
    store: { type: Object, required: true },
    record: { type: Object, required: true },
    membershipStore: { type: Object, required: true },
  },
  emits: ['afterDelete', 'afterExtend'],
  setup(props, { emit }) {
    const tabs = [
      {
        key: 'basic-info',
        label: '基本信息',
      },
      // {
      //   key: 'xxx',
      //   label: 'xxx',
      // },
    ];

    const onUserSaved = () => {
      props.record.fetch();
    };

    return {
      ...toRefs(props),
      tabs,
      onUserSaved,
    };
  },
});
export default ComResManageUserShow;
</script>

<template lang="pug">
.com-res-manage-user-show
  TaShowLayout(:tabs='tabs', :title='record.name', :store='store')
    template(#header-content)
      ComResUserHeaderContent(:record='record')
    template(#basic-info_tab)
      ComResUserBasicInfo(
        :store='store',
        :membershipStore='membershipStore',
        :record='record',
        @userSaved='onUserSaved',
        v-if='record.id'
      )
</template>

<style lang="stylus" scoped>
.com-res-manage-user-show
  height 100%
  >>>.header-edit
    display none
  >>>.ta-show-layout .background
    padding 0
  >>>.ta-tab
    border-bottom 1px solid #E5E7EB
</style>
