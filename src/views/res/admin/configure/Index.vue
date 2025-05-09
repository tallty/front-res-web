<script lang="ts">
import { ref, defineComponent, toRefs } from 'vue';
import ComSettingCard from '@/engines/com/components/com/ComSettingCard.vue';
import identityImg from '@/engines/com/assets/images/identity.png';
import organizationImg from '@/engines/com/assets/images/organization.png';
import departmentImg from '@/engines/com/assets/images/department.png';

const componentName = defineComponent({
  name: 'ResAdminConfigureIndex',
  components: { ComSettingCard },
  props: {
    value: { type: String, default: 'copy' },
  },
  setup(props) {
    let cardItemArr = ref([
      {
        name: '身份配置',
        img: identityImg,
        url: '/res/admin/members',
      },
      {
        name: '组织类型配置',
        img: organizationImg,
        url: '/res/admin/orgs',
      },
      {
        name: '部门类型配置',
        img: departmentImg,
        url: '/res/admin/departments',
      },
      {
        name: '角色配置',
        img: departmentImg,
        url: '/res/admin/duties',
      },
      {
        name: '业务模型配置',
        img: departmentImg,
        url: '/com/admin/model_settings',
      },
      {
        name: '组织管理',
        img: departmentImg,
        url: '/g6Tree',
      },
      {
        name: '表单配置',
        img: departmentImg,
        url: '/forms/admin/templates',
      },
      {
        name: '工作流分类配置',
        img: departmentImg,
        url: '/bpm/admin/catalogs',
      },
      {
        name: '工作流配置',
        img: departmentImg,
        url: '/bpm/admin/workflows',
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
  ComIconText(color='#383838', text='系统数据配置')
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
