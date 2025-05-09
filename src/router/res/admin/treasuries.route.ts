export default [
  {
    path: '/res/admin/treasuries',
    name: 'resAdminTreasuriesIndex',
    component: () =>
      import(
        /* webpackChunkName: "resAdminTreasuriesIndex" */ '@/views/res/admin/treasuries/Index.vue'
      ),
    meta: {
      title: '人员管理',
      role: 'admin',
    },
  },
];
