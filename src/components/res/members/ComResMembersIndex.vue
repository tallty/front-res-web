<script lang="ts">
import { defineComponent, computed, ref, Ref, toRefs, reactive } from 'vue';
import { TaIndexViewTabInterface } from '@/components/global/ta-component/TaIndexView/types';
import { VObject } from '@/lib/vails/model';
import ComResMembersShow from './ComResMembersShow.vue';

const ComResMembersIndex = defineComponent({
  name: 'ComResMembersIndex',
  components: {
    ComResMembersShow,
  },
  props: {
    store: { type: Object, required: true },
  },
  setup(props, { emit }) {
    const config = computed(() => ({
      recordName: '',
      store: props.store,
      // pagination: {
      //   perPage: 15,
      //   showPageSizeChanger: false,
      //   hideOnSinglePage: false,
      //   showSizeChanger: false,
      // }
      template: 'member',
      // detail: {
      //   mode: 'auto',
      //   mode: 'drawer',
      //   width: '70vw',
      // },
      mode: 'table',
      // editApi:
      // showCount: true,
      actions: [
        { key: 'create', enabled: false },
        { key: 'update', enabled: false },
        { key: 'delete', enabled: false },
        { key: 'import', enabled: false },
        { key: 'export', enabled: false },
      ],
      table: {
        // scroll: { y: '300px' },
        // columns: [{ dataIndex: 'id', title: 'ID' }],
      },
      // selection: {
      //   showByDefault: false;
      //   showSwitch: false;
      // };
      // searcherSimpleOptions: [{key: 'title', label: '标题', type: 'string' }],
    }));

    const statistics = ref({
      key1: 0,
      key2: 0,
    });

    const tabs = computed<TaIndexViewTabInterface[]>(() => [
      {
        key: 'key1',
        label: '标签1',
        num: statistics.value.key1,
        query: {},
      },
      {
        key: 'key2',
        label: '标签2',
        num: statistics.value.key2,
        query: {},
      },
    ]);

    const onIndex = (data: VObject) => {
      statistics.value = data.statistics;
    };

    return {
      ...toRefs(props),
      config,
      // tabs,
      onIndex,
    };
  },
});

export default ComResMembersIndex;
</script>

<template lang="pug">
.com-res-member-members-index
  TaIndexView(:config='config' :tabs='tabs' @onIndex='onIndex')
    //- template(#card='{ record }')
    //- template(#table)
    //-    a-table-column(:autoHeight='true' title='名称' dataIndex='record')
    //- template(#detail='{ record, onClose }')
    //-   ComResMembersShow(
    //-     v-if='record.id'
    //-     :store='store'
    //-     :extendRoute='`/res/member/members/${record.id}`'
    //-     :editable='editable'
    //-     @afterDelete='onClose'
    //-     @afterExtend='onClose'
    //-   )

</template>

<style lang="stylus" scoped>
.com-res-member-members-index
  height 100%
  width 100%
</style>
