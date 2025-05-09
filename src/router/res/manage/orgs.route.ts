export default [
  {
    path: '/res/manage/orgs',
    name: 'resManageOrgsIndex',
    component: () =>
      import(
        /* webpackChunkName: "resManageOrgsIndex" */ '@/views/res/manage/orgs/Index.vue'
      ),
    meta: {
      title: '组织管理',
    },
  },
  {
    path: '/res/manage/orgs/:orgId',
    name: 'resManageOrgsShow',
    component: () =>
      import(
        /* webpackChunkName: "resManageOrgsShow" */ '@/views/res/manage/orgs/Show.vue'
      ),
    meta: {
      title: '组织详情',
      menuKey: '/res/manage/orgs',
    },
  },
  {
    path: '/res/manage/tanent/orgs',
    name: 'resTanentManageOrgsIndex',
    component: () =>
      import(
        /* webpackChunkName: "resTanentManageOrgsIndex" */ '@/views/res/manage/orgs/Index.vue'
      ),
    meta: {
      title: '组织管理',
      tanent: true,
    },
  },
  {
    path: '/res/manage/tanent/orgs/:orgId',
    name: 'resTanentManageOrgsShow',
    component: () =>
      import(
        /* webpackChunkName: "resTanentManageOrgsShow" */ '@/views/res/manage/orgs/Show.vue'
      ),
    meta: {
      title: '组织详情',
      menuKey: '/res/manage/tanent/orgs',
      tanent: true,
    },
  },
  {
    path: '/res/manage/enterprises',
    name: 'resManageEnterprisesIndex',
    component: () =>
      import(
        /* webpackChunkName: "resManageEnterprisesIndex" */ '@/views/res/manage/enterprises/Index.vue'
      ),
    meta: {
      title: '组织管理',
    },
  },
  {
    path: '/res/manage/enterprises/:enterpriseId',
    name: 'resManageEnterprisesShow',
    component: () =>
      import(
        /* webpackChunkName: "resManageEnterprisesShow" */ '@/views/res/manage/enterprises/Show.vue'
      ),
    meta: {
      title: '人员管理',
      menuKey: '/res/manage/enterprises',
    },
  },
];
