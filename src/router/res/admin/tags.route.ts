export default [
  {
    path: '/res/admin/tags',
    name: 'resAdminTagsIndex',
    component: () =>
      import(
        /* webpackChunkName: "resAdminTagsIndex" */ '@/views/res/admin/tags/Index.vue'
      ),
    meta: {
      title: '标签管理',
    },
  }
];
