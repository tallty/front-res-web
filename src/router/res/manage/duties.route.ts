export default [
  {
    path: '/res/manage/duties',
    name: 'resManageDutiesIndex',
    component: () => import(/* webpackChunkName: "resManageDutiesIndex" */ '@/views/res/manage/duties/Index.vue'),
    meta: {
      title: 'resManageDutiesIndex',
    },
  },
  {
    path: '/res/manage/duties/:dutyId',
    name: 'resManageDutiesShow',
    component: () => import(/* webpackChunkName: "resManageDutiesShow" */ '@/views/res/manage/duties/Show.vue'),
    meta: {
      title: 'resManageDutiesShow',
    },
  },
];
