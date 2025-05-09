export default [
  {
    path: '/res/member/members',
    name: 'resMemberMembersIndex',
    component: () =>
      import(
        /* webpackChunkName: "resMemberMembersIndex" */ '@/views/res/member/members/Index.vue'
      ),
    meta: {
      title: 'resMemberMembersIndex',
    },
  },
  {
    path: '/res/member/members/:memberId',
    name: 'resMemberMembersShow',
    component: () =>
      import(
        /* webpackChunkName: "resMemberMembersShow" */ '@/views/res/member/members/Show.vue'
      ),
    meta: {
      title: 'resMemberMembersShow',
    },
  },
];
