export default [
  {
    path: '/res/admin/departments',
    name: 'resAdminDepartmentsIndex',
    component: () =>
      import(
        /* webpackChunkName: "resAdminDepartmentsIndex" */ '@/views/res/admin/departments/Index.vue'
      ),
    meta: {
      title: '部门类型配置',
      role: 'admin',
    },
  },
];
