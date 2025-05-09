<script lang="ts">
import ComResBooksShow from '@/components/res/books/ComResBooksShow.vue';
import { defineComponent, toRefs, onMounted, computed } from 'vue';
import { ResAdminBooksApi } from '@/res-core/apis/res/admin/books.api';
import { VStore } from '@/lib/vails';
import { useRoute } from 'vue-router';

const ResAdminBooksShow = defineComponent({
  name: 'ResAdminBooksShow',
  components: {
    ComResBooksShow,
  },
  setup(props) {
    const route = useRoute();

    const store = new VStore(new ResAdminBooksApi());

    const breadcrumbs = computed(() => [{ label: '', route: '/res/admin/books' }]);

    onMounted(() => {
      store.find(Number(route.params.bookId));
    });

    return {
      ...toRefs(props),
      store,
      record: store.record,
      breadcrumbs,
    };
  },
});

export default ResAdminBooksShow;
</script>

<template lang="pug">
.res-admin-books-show
  ComResBooksShow(v-if='record.id', :store='store', :breadcrumbs='breadcrumbs')
</template>

<style lang="stylus" scoped>
.res-admin-books-show
  height 100%
  width 100%
  .breadcrumbs
    padding 0 24px
</style>
