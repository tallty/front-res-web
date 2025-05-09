<script lang="ts">
import { VObject } from '@/lib/vails';
import { cloneDeep, groupBy, map, uniqBy } from 'lodash';
import { defineComponent, onMounted, ref } from 'vue';
import ComResTagsRelationIndex from '../tags_relations/ComResTagsRelationIndex.vue';

const ComResUserOrgTags = defineComponent({
  name: 'ComResUserOrgTags',
  components: {
    ComResTagsRelationIndex,
  },
  props: {
    store: { type: Object, required: true },
    user: { type: Object, required: true },
    org: { type: Object, required: false, default: () => ({}) },
    onlyShow: { type: Boolean, default: () => false },
  },
  setup(props) {
    const summary = ref<VObject[]>([]);
    const loading = ref(false);

    const loadData = async () => {
      loading.value = true;
      const { records } = await props.store.index({
        q: { user_id_eq: props.user.id },
        per_page: 99999,
      });

      const grouped = groupBy(records, record => `${record.org_id}-${record.org.name}`);

      summary.value = map(grouped, (records, key) => {
        const tagNames = uniqBy(records, 'tag_id')
          .filter((record: any) => record.tag_id)
          .map(record => record.tag.name)
          .join('、');

        const [recordId, recordName] = key.split('-');

        return {
          id: Number(recordId),
          name: recordName,
          tagNames,
        };
      });
      loading.value = false;
    };

    onMounted(() => {
      loadData();
    });

    const store = cloneDeep(props.store);
    const record = ref({});
    const visible = ref({
      formDrawer: false,
      indexDrawer: false,
    });

    const onAddTag = () => {
      record.value = store.new({
        user_id: props.user.id,
        org_id: props.org?.id,
      });
      visible.value.formDrawer = true;
    };

    const initFormData = ref({});
    const recordName = ref('');

    const onTagRowClick = (record: VObject) => {
      if (!props.onlyShow) {
        recordName.value = record.name;
        store.api.params = {
          q: {
            user_id_eq: props.user.id,
            org_id_eq: props.org?.id,
          },
        };
        initFormData.value = {
          org_id: props.org?.id,
          user_id: props.user.id,
        };
        visible.value.indexDrawer = true;
      }
    };

    return {
      summary,
      loading,
      onAddTag,
      onTagRowClick,
      loadData,
      record,
      store,
      visible,
      initFormData,
      recordName,
    };
  },
});

export default ComResUserOrgTags;
</script>

<template lang="pug">
.flex.justify-between.items-center.mb-4
  .flex.item-center
    .flex.lines.mr-1.items-center
      .line.bg-blue-200
      .line.h-4.bg-blue-700
      .line.bg-yellow-200
    .text-base.font-medium.text-gray-800 标签信息
  a-button.save-button(v-if='!onlyShow', type='text', @click='onAddTag()')
    .flex.items-center.text-blue-700
      TaIcon.w-4.h-4.mr-3(type='solid/plus')
      .text-xs.font-medium 添加

TaIndexTable.mt-6(
  :data='summary',
  :paginationConfig='{ hide: true }',
  :loading='loading',
  @rowClick='onTagRowClick'
)
  a-table-column(:autoHeight='true' title='组织', dataIndex='name')
  a-table-column(:autoHeight='true' title='标签', dataIndex='tagNames')

a-drawer(
  v-model:visible='visible.indexDrawer',
  :closeable='false',
  title='详情',
  width='60%',
  @close='loadData()'
)
  ComResTagsRelationIndex(
    :store='store',
    :recordName='recordName',
    :initFormData='initFormData',
    v-if='visible.indexDrawer'
  )

TaTemplateFormWithActionsDrawer(
  v-model:visible='visible.formDrawer',
  template='res_tags_relation',
  :record='record',
  @afterSave='loadData()'
)
</template>

<style lang="stylus" scoped>
.lines
  .bg-blue-200
    height 10px
    margin-top 4px
  .bg-yellow-200
    height 10px
    margin-top 2px
  .line
    width 2px
    margin-right 2px
</style>
