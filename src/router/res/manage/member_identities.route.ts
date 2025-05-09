export default [
  {
    path: '/res/manage/member_identities',
    name: 'resManageMemberIdentitiesIndex',
    component: () =>
      import(
        /* webpackChunkName: "resManageMemberIdentitiesIndex" */ '@/views/res/manage/member_identities/Index.vue'
      ),
    meta: {
      title: 'resManageMemberIdentitiesIndex',
    },
  },
  {
    path: '/res/manage/member_identities/:member_identityId',
    name: 'resManageMemberIdentitiesShow',
    component: () =>
      import(
        /* webpackChunkName: "resManageMemberIdentitiesShow" */ '@/views/res/manage/member_identities/Show.vue'
      ),
    meta: {
      title: 'resManageMemberIdentitiesShow',
    },
  },
];
