<script lang="ts">
import { VObject } from '@/lib/vails';
import { defineComponent, computed, toRefs, ref } from 'vue';
import ComResManageUserShow from './ComResManageUserShow.vue';

const ComResManageUserIndex = defineComponent({
  name: 'ComResManageUserIndex',
  components: {
    ComResManageUserShow,
  },
  props: {
    store: { type: Object, required: true },
    orgRecord: { type: Object, required: false, default: () => ({}) },
    membershipStore: { type: Object, required: true },
  },
  setup(props, { emit }) {
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
        columns: [
          { dataIndex: 'name', title: '姓名' },
          { dataIndex: 'account', title: '账号' },
          { dataIndex: 'memberIdentityNames', title: '身份' },
          { dataIndex: 'dutyCount', title: '岗位数' },
          { dataIndex: 'dutyNames', title: '岗位' },
        ],
      },
      searcherSimpleOptions: [
        { key: 'name', label: '姓名', type: 'string' },
        { key: 'account', label: '账号', type: 'string' },
      ],
    }));

    const editRecord = ref({});
    const visible = ref(false);

    const addMode = ref('search');
    const modes = [
      { key: 'search', label: '搜索创建' },
      { key: 'batch', label: '批量添加' },
    ];

    const onCreate = (record: VObject) => {
      editRecord.value = props.membershipStore.new({ org_id: props.orgRecord?.id });
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
    };
  },
});

export default ComResManageUserIndex;
</script>

<template lang="pug">
.com-res-manage-user-index
  TaIndexView(:config='config', @onCreate='onCreate')
    template(#detail='{ record, onClose }')
      ComResManageUserShow(
        v-if='record.id'
        :store='store',
        :membershipStore='membershipStore',
        :record='record',
        :editable='editable'
        @afterDelete='onClose'
        @afterExtend='onClose'
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
