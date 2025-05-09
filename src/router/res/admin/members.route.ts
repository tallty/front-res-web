export default [
  {
    path: '/res/admin/duties',
    name: 'resAdminDutiesIndex',
    component: () =>
      import(
        /* webpackChunkName: "resAdminDutiesIndex" */ '@/views/res/admin/duties/Index.vue'
      ),
    meta: {
      title: '岗位管理',
      role: 'admin',
    },
  },
  {
    path: '/res/admin/students',
    name: 'resAdminStudentsIndex',
    component: () =>
      import(
        /* webpackChunkName: "resAdminStudentsIndex" */ '@/views/res/admin/students/Index.vue'
      ),
    meta: {
      title: '学生库',
    },
  },
  {
    path: '/res/admin/teachers',
    name: 'resAdminTeachersIndex',
    component: () =>
      import(
        /* webpackChunkName: "resAdminTeachersIndex" */ '@/views/res/admin/teachers/Index.vue'
      ),
    meta: {
      title: '教师库',
    },
  },
  {
    path: '/res/admin/member_identity/:id/members',
    name: 'resHrAdminMembersIndex',
    component: () =>
      import(
        /* webpackChunkName: "resHrAdminMembersIndex" */ '@/views/res/admin/hr/index.vue'
      ),
    meta: {
      title: '人员管理',
    },
  },
];
