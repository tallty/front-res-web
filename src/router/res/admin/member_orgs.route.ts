export default [
  {
    path: '/res/admin/member_orgs',
    name: 'resAdminMemberOrgsIndex',
    component: () =>
      import(
        /* webpackChunkName: "resAdminMemberOrgsIndex" */ '@/views/res/admin/member_orgs/Index.vue'
      ),
    meta: {
      title: '组织权限管理',
      role: 'admin',
    },
  },
];
