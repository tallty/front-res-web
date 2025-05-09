export default [
  {
    path: '/res/admin/duties/:dutyId/memberships',
    name: 'resAdminDutiesMembershipsIndex',
    component: () =>
      import(
        /* webpackChunkName: "resAdminDutiesMembershipsIndex" */ '@/views/res/admin/duties/memberships/Index.vue'
      ),
    meta: {
      title: 'duty membership',
    },
  },
  {
    path: '/res/admin/member_identities/memberships',
    name: 'resAdminMemberIdentityBatchMembershipsIndex',
    component: () =>
      import(
        /* webpackChunkName: "resAdminMemberIdentityBatchMembershipsIndex" */ '@/views/res/admin/member_identities/memberships/Index.vue'
      ),
    meta: {
      title: '身份',
    },
  },
];
