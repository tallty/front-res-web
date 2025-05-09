export default [
  {
    path: '/res/admin/members',
    name: 'resAdminMembersIndex',
    component: () =>
      import(
        /* webpackChunkName: "resAdminMembersIndex" */ '@/views/res/admin/members/Index.vue'
      ),
    meta: {
      title: '人员管理',
      role: 'admin',
    },
  },
];
