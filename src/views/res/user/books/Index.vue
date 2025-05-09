<script lang="ts">
import ComResBooksIndex from '@/components/res/books/ComResBooksIndex.vue';
import { defineComponent } from '@vue/runtime-core';
import { ResUserBooksApi } from '@/res-core/apis/res/user/books.api';
import { VStore } from '@/lib/vails';
import { ResAdminBooksApi } from '@/res-core/apis/res/admin/books.api';

const ResUserBooksIndex = defineComponent({
  name: 'ResUserBooksIndex',
  components: {
    ComResBooksIndex,
  },
  setup() {
    const store = new VStore(new ResUserBooksApi());

    const adminStore = new VStore(new ResAdminBooksApi());

    return {
      store,
      adminStore,
    };
  },
});

export default ResUserBooksIndex;
</script>

<template lang="pug">
.res-user-books-index
  ComResBooksIndex(:store='store', :adminStore='adminStore')
</template>

<style lang="stylus" scoped>
.res-user-books-index
  height 100%
  width 100%
</style>
