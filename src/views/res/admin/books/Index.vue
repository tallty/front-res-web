<script lang="ts">
import ComResBooksIndex from '@/components/res/books/ComResBooksIndex.vue';
import { defineComponent } from '@vue/runtime-core';
import { ResAdminBooksApi } from '@/res-core/apis/res/admin/books.api';
import { VStore } from '@/lib/vails';

const ResAdminBooksIndex = defineComponent({
  name: 'ResAdminBooksIndex',
  components: {
    ComResBooksIndex,
  },
  setup() {
    const store = new VStore(new ResAdminBooksApi());

    return {
      store,
    };
  },
});

export default ResAdminBooksIndex;
</script>

<template lang="pug">
.res-admin-books-index
  ComResBooksIndex(:store='store' )
</template>

<style lang="stylus" scoped>
.res-admin-books-index
  height 100%
  width 100%
</style>
