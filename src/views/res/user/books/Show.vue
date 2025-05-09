<script lang="ts">
import ComResBooksShow from '@/components/res/books/ComResBooksShow.vue';
import { defineComponent, toRefs, onMounted, computed } from 'vue';
import { ResUserBooksApi } from '@/res-core/apis/res/user/books.api';
import { VStore } from '@/lib/vails';
import { useRoute } from 'vue-router';

const ResUserBooksShow = defineComponent({
  name: 'ResUserBooksShow',
  components: {
    ComResBooksShow,
  },
  setup(props) {
    const route = useRoute();

    const store = new VStore(new ResUserBooksApi());

    const breadcrumbs = computed(() => [{ label: '', route: '/res/user/books' }]);

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

export default ResUserBooksShow;
</script>

<template lang="pug">
.res-user-books-show
  ComResBooksShow(v-if='record.id', :store='store', :breadcrumbs='breadcrumbs')
</template>

<style lang="stylus" scoped>
.res-user-books-show
  height 100%
  width 100%
  .breadcrumbs
    padding 0 24px
</style>
