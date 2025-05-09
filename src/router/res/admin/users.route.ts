export default [
  {
    path: '/res/admin/users',
    name: 'resAdminUsersIndex',
    component: () =>
      import(
        /* webpackChunkName: "resAdminUsersIndex" */ '@/views/res/admin/users/Index.vue'
      ),
    meta: {
      title: '人员管理',
      role: 'admin',
    },
  },
];
