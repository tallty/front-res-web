export default [
  {
    path: '/res/manage/users',
    name: 'resManageUsersIndex',
    component: () => import(/* webpackChunkName: "resManageUsersIndex" */ '@/views/res/manage/users/Index.vue'),
    meta: {
      title: 'resManageUsersIndex',
    },
  },
  {
    path: '/res/manage/users/:userId',
    name: 'resManageUsersShow',
    component: () => import(/* webpackChunkName: "resManageUsersShow" */ '@/views/res/manage/users/Show.vue'),
    meta: {
      title: 'resManageUsersShow',
    },
  },
];
