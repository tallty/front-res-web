<script lang="ts">
import { defineComponent, toRefs, PropType } from 'vue';
import { TaBreadcrumbInterface } from '@/components/global/ta-component/TaBreadcrumb.vue'

const ComResManageDepartmentShow = defineComponent({
  name: 'ComResManageDepartmentShow',
  components: {},
  props: {
    store: { type: Object, required: true },
    extendRoute: { type: String, default: '' },
    editable: { type: Boolean, default: true },
    breadcrumbs: { type: Array as PropType<TaBreadcrumbInterface[]>, default: () => [] },
  },
  emits: ['afterDelete', 'afterExtend'],
  setup(props, { emit }) {
    const tabs = [
      {
        key: 'info',
        label: '基本信息',
      },
      // {
      //   key: 'xxx',
      //   label: 'xxx',
      // },
    ];

    const afterDelete = () => {
      emit('afterDelete');
    };

    const afterExtend = () => {
      emit('afterExtend');
    };

    return {
      ...toRefs(props),
      tabs,
      record: props.store.record,
      afterDelete,
      afterExtend,
    };
  },
});
export default ComResManageDepartmentShow;
</script>

<template lang="pug">
.com-res-manage-department-show
  TaShowLayout(
    :tabs='tabs',
    :title='record.name',
    :store='store',
    :extendRoute='extendRoute',
    :editable='editable',
    :breadcrumbs='breadcrumbs',
    template='res_department',
    @afterDelete='afterDelete',
    @afterExtend='afterExtend'
  )
    //- template(#xxx_tab)
</template>

<style lang="stylus" scoped>
.com-res-manage-department-show
  height 100%
</style>
