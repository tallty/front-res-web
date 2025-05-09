export default [
  {
    path: '/res/member/duties',
    name: 'resMemberDutiesIndex',
    component: () =>
      import(
        /* webpackChunkName: "resMemberDutiesIndex" */ '@/views/res/member/duties/Index.vue'
      ),
    meta: {
      title: 'resMemberDutiesIndex',
    },
  },
  {
    path: '/res/member/duties/:dutyId',
    name: 'resMemberDutiesShow',
    component: () =>
      import(
        /* webpackChunkName: "resMemberDutiesShow" */ '@/views/res/member/duties/Show.vue'
      ),
    meta: {
      title: 'resMemberDutiesShow',
    },
  },
];
