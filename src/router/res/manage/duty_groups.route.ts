export default [
  {
    path: '/res/manage/duty_groups',
    name: 'resManageDutyGroupsIndex',
    component: () => import(/* webpackChunkName: "resManageDutyGroupsIndex" */ '@/views/res/manage/duty_groups/Index.vue'),
    meta: {
      title: 'resManageDutyGroupsIndex',
    },
  },
  {
    path: '/res/manage/duty_groups/:duty_groupId',
    name: 'resManageDutyGroupsShow',
    component: () => import(/* webpackChunkName: "resManageDutyGroupsShow" */ '@/views/res/manage/duty_groups/Show.vue'),
    meta: {
      title: 'resManageDutyGroupsShow',
    },
  },
];
