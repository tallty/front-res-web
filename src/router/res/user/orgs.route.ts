export default [
  {
    path: '/res/user/orgs',
    name: 'resUserOrgsIndex',
    component: () =>
      import(
        /* webpackChunkName: "resUserOrgsIndex" */ '@/views/res/user/orgs/Index.vue'
      ),
    meta: {
      title: '组织结构',
    },
  },
  {
    path: '/res/user/orgs/:orgId',
    name: 'resUserOrgsShow',
    component: () =>
      import(
        /* webpackChunkName: "resUserOrgsShow" */ '@/views/res/user/orgs/Show.vue'
      ),
    meta: {
      title: '组织详情',
      menuKey: '/res/user/orgs',
    },
  },
  {
    path: '/res/user/enterprises',
    name: 'resUserEnterprisesIndex',
    component: () =>
      import(
        /* webpackChunkName: "resUserEnterprisesIndex" */ '@/views/res/user/enterprises/Index.vue'
      ),
    meta: {
      title: '我的企业',
    },
  },
];
