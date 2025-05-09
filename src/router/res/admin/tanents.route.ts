export default [
  {
    path: '/res/admin/tanents',
    name: 'resAdminTanentsIndex',
    component: () =>
      import(
        /* webpackChunkName: "resAdminTanentsIndex" */ '@/views/res/admin/tanents/Index.vue'
      ),
    meta: {
      title: '租户管理',
    },
  },
];
