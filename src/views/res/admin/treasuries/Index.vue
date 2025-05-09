<script lang="ts">
import { ref, defineComponent, toRefs } from 'vue';
import ComSettingCard from '@/engines/com/components/com/ComSettingCard.vue';

import identityImg from '@/engines/com/assets/images/identity.png';
import organizationImg from '@/engines/com/assets/images/organization.png';
import departmentImg from '@/engines/com/assets/images/department.png';

const componentName = defineComponent({
  name: 'ComResAdminTreasuryIndex',
  components: { ComSettingCard },
  props: {
    value: { type: String, default: 'copy' },
  },
  setup(props) {
    let cardItemArr = ref([
      {
        name: '账号管理',
        img: identityImg,
        url: '/res/admin/users',
      },
      {
        name: '教师库',
        img: organizationImg,
        url: '/res/admin/teachers',
      },
      {
        name: '学生库',
        img: departmentImg,
        url: '/res/admin/students',
      },
    ]);
    return {
      ...toRefs(props),
      cardItemArr,
    };
  },
});
export default componentName;
</script>

<template lang="pug">
.res-admin-configure
  ComIconText(color='#383838', text='人员管理')
  .item-box
    .item(v-for='item in cardItemArr')
      ComSettingCard(:name='item.name', :url='item.url', :img='item.img')
</template>

<style lang="stylus" scoped>

.item-box
  margin 20px 0
.item
  float left
  margin-right 12px
  margin-bottom 12px
</style>
