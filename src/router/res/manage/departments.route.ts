export default [
  {
    path: '/res/manage/departments',
    name: 'resManageDepartmentsIndex',
    component: () => import(/* webpackChunkName: "resManageDepartmentsIndex" */ '@/views/res/manage/departments/Index.vue'),
    meta: {
      title: 'resManageDepartmentsIndex',
    },
  },
  {
    path: '/res/manage/departments/:departmentId',
    name: 'resManageDepartmentsShow',
    component: () => import(/* webpackChunkName: "resManageDepartmentsShow" */ '@/views/res/manage/departments/Show.vue'),
    meta: {
      title: 'resManageDepartmentsShow',
    },
  },
];
