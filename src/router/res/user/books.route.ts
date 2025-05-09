export default [
  {
    path: '/res/user/books',
    name: 'resUserBooksIndex',
    component: () =>
      import(
        /* webpackChunkName: "resUserBooksIndex" */ '@/views/res/user/books/Index.vue'
      ),
    meta: {
      title: '通讯录',
    },
  },
  {
    path: '/res/user/books/:bookId',
    name: 'resUserBooksShow',
    component: () =>
      import(
        /* webpackChunkName: "resUserBooksShow" */ '@/views/res/user/books/Show.vue'
      ),
    meta: {
      title: '通讯录详情',
    },
  },
];
