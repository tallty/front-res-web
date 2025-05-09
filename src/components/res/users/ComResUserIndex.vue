<script lang="ts">
import { VObject } from '@/lib/vails';
import { defineComponent, computed, toRefs, ref } from 'vue';
import ComResUserShow from './ComResUserShow.vue';
import { message } from 'ant-design-vue';

const ComResUserIndex = defineComponent({
  name: 'ComResUserIndex',
  components: {
    ComResUserShow,
  },
  props: {
    store: { type: Object, required: true },
    orgRecord: { type: Object, required: false, default: () => ({}) },
    membershipStore: { type: Object, required: true },
    tagRelationStore: { type: Object, required: true },
    memberStore: { type: Object, required: true },
  },
  setup(props) {
    const config = computed(() => ({
      recordName: '',
      store: props.store,
      detail: {
        mode: 'drawer',
        width: '1100px',
      },
      mode: 'table',
      actions: [
        { key: 'create', enabled: true },
        { key: 'update', enabled: false },
        { key: 'delete', enabled: true },
        { key: 'import', enabled: true },
        { key: 'export', enabled: true },
      ],
      table: {
        scroll: { y: 'auto' },
      },
      searcherSimpleOptions: [
        { key: 'name', label: '姓名', type: 'string' },
        { key: 'account', label: '账号', type: 'string' },
        { key: 'duties_name', label: '岗位', type: 'string' },
      ],
    }));

    const editRecord = ref({});
    const visible = ref(false);

    const addMode = ref('search');
    const modes = [
      { key: 'search', label: '搜索创建' },
      { key: 'batch', label: '批量添加' },
    ];

    const onCreate = () => {
      editRecord.value = props.membershipStore.new({ org_id: props.orgRecord?.id, user_id: 0 });
      visible.value = true;
    };

    const template = computed(() => {
      return `membership#${addMode.value}`;
    });

    const form = ref<any>(null);
    const loading = ref(false);

    const onSubmit = () => {
      loading.value = true;
      form.value
        .submit({})
        .then(() => {
          visible.value = false;
          props.store.index();
        })
        .finally(() => {
          loading.value = false;
        });
    };

    const taIndexView = ref<any>(null);

    const onEdit = (record: VObject) => {
      taIndexView.value.onRowClick(record);
    };

    const onDelete = (record: VObject) => {
      record
        .delete({ params: { org_id: props.orgRecord.id } })
        .then(() => {
          message.success('删除成功');
        })
        .catch((err: any) => {
          message.error('删除失败');
          throw err;
        });
    };

    return {
      ...toRefs(props),
      config,
      onCreate,
      visible,
      editRecord,
      onSubmit,
      form,
      loading,
      addMode,
      modes,
      template,
      taIndexView,
      onEdit,
      onDelete,
    };
  },
});

export default ComResUserIndex;
</script>

<template lang="pug">
.com-res-manage-user-index
  TaIndexView(ref='taIndexView', :config='config', @onCreate='onCreate')
    template(#table='{ actions }')
      a-table-column(:autoHeight='true' dataIndex='name' title='姓名')
      a-table-column(:autoHeight='true' dataIndex='account' title='账号')
      a-table-column(:autoHeight='true' title='身份')
        template(#default="{record}")
          a-tooltip(:title='record.memberIdentityNames')
            .truncate(style='max-width:120px') {{ record.memberIdentityNames }}
      a-table-column(:autoHeight='true' title='组织')
        template(#default="{ record }")
          a-tooltip(:title='record.orgNames')
            .truncate(style='max-width:120px') {{ record.orgNames }}
      a-table-column(:autoHeight='true' dataIndex='' title='岗位')
        template(#default="{ record }")
          a-tooltip(:title='record.dutyNames')
            .truncate(style='max-width:120px') {{ record.dutyNames }}
      a-table-column(:autoHeight='true' dataIndex='mobile' title='手机号')
      a-table-column(:autoHeight='true' title='操作')
        template(#default='{ record }')
          .flex
            TaIcon.icon.mr-2(type='EditOutlined', @click.stop='onEdit(record)')
            TaPopoverConfirm(
              title='删除',
              :content='`确认删除该人员信息？`',
              @confirm='onDelete(record)'
            )
              TaIcon(@click.stop='', type='DeleteOutlined')

    template(#detail='{ record, onClose }')
      ComResUserShow(
        v-if='record.id'
        :store='store',
        :membershipStore='membershipStore',
        :tagRelationStore='tagRelationStore',
        :memberStore='memberStore',
        :record='record',
        :org='orgRecord',
      )
  a-modal(
    v-if='visible',
    v-model:visible='visible',
    style='width: 640px',
    okText='创建'
    @onOk="onSubmit()"
  )
    template(#title)
      .flex.justify-between.items-center
        .text-base.font-semibold.text-gray-800 添加人员
        template(v-for="mode in modes")
          .flex.text-blue-500.items-center.cursor-pointer.mr-9(@click='() => { addMode = mode.key }' v-if="addMode != mode.key")
            TaIcon.w-3.h-3.mr-2(type='solid/refresh')
            .text-sm.font-normal {{ mode.label }}
    TaTemplateForm(
      ref="form"
      :template='template',
      :record="editRecord"
      :useDefaultTheme="false"
    )
    template(#footer)
      a-button(@click='visible=false') 取消
      a-button(type='primary', :loading='loading', @click='onSubmit') 创建
</template>

<style lang="stylus" scoped>
.com-res-manage-user-index
  height 100%
  width 100%
</style>
