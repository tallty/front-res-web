export default [
  {
    path: '/res/admin/orgs',
    name: 'resAdminOrgsIndex',
    component: () =>
      import(
        /* webpackChunkName: "resAdminOrgsIndex" */ '@/views/res/admin/orgs/Index.vue'
      ),
    meta: {
      title: '组织管理',
      role: 'admin',
    },
  },
  {
    path: '/res/admin/orgs/:orgId',
    name: 'resAdminOrgsShow',
    component: () =>
      import(
        /* webpackChunkName: "resAdminOrgsShow" */ '@/views/res/admin/orgs/Show.vue'
      ),
    meta: {
      title: '组织详情',
      role: 'admin',
      menuKey: '/res/admin/orgs',
    },
  },
];
