export default [
  {
    path: '/res/manage/memberships',
    name: 'resManageMembershipsIndex',
    component: () =>
      import(
        /* webpackChunkName: "resManageMembershipsIndex" */ '@/views/res/manage/memberships/Index.vue'
      ),
    meta: {
      title: 'resManageMembershipsIndex',
    },
  },
  {
    path: '/res/manage/memberships/:membershipId',
    name: 'resManageMembershipsShow',
    component: () =>
      import(
        /* webpackChunkName: "resManageMembershipsShow" */ '@/views/res/manage/memberships/Show.vue'
      ),
    meta: {
      title: 'resManageMembershipsShow',
    },
  },
];
