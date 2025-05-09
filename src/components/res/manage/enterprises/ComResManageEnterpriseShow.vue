<script lang="ts">
import { ResMembershipModel } from '@/res-core/models/res/membership';
import { VObject } from '@/lib/vails';
import { defineComponent, computed, toRefs, ref } from 'vue';
import { message } from 'ant-design-vue';
import ComBpmInstanceDetailDialog from '@/engines/bpm/components/ComBpmInstanceDetailDialog.vue';
import { TaIndexViewTabInterface } from '@/components/global/ta-component/TaIndexView/types';

const ComResManageEnterpriseShow = defineComponent({
  name: 'ComResManageEnterpriseShow',
  components: {
    ComBpmInstanceDetailDialog,
  },
  props: {
    org: { type: Object, required: true },
    membershipStore: { type: Object, requried: true },
    options: { type: Object, default: () => ({}) },
    managerLimit: { type: Object, default: () => ({ max: 2, min: 1 }) },
  },
  setup(props) {
    const config = computed(() => ({
      recordName: props.org.name,
      store: props.membershipStore,
      mode: 'table',
      table: {
        scroll: { y: 'auto' },
        columns: [
          { dataIndex: 'user.name', title: '姓名' },
          { dataIndex: 'user.gender', title: '性别' },
          { dataIndex: 'user.model_payload.出生日期', title: '出生日期' },
          { dataIndex: 'user.mobile', title: '手机号' },
          { dataIndex: 'user.email', title: '邮箱' },
          // { dataIndex: 'region', title: '所在地区' },
          { dataIndex: '', title: '负责人' },
          { dataIndex: '', title: '状态' },
          { dataIndex: '', title: '操作' },
        ],
      },
      searcherSimpleOptions: [{ label: '姓名', key: 'user_name', type: 'string' }],
    }));

    const visible = ref(false);
    const editRecord = ref({});
    const formTitle = ref('');

    const onEdit = (record: VObject) => {
      editRecord.value = record;
      formTitle.value = '编辑人员信息';
      visible.value = true;
    };

    const onCreate = () => {
      editRecord.value = props.membershipStore!.new({
        member_identity_id: props.options.memberIdentityId,
        duty_id: props.options.dutyId,
        department_id: props.options.departmentId,
      });
      formTitle.value = '添加人员';
      visible.value = true;
    };

    const afterSave = () => {
      taIndexView.value.silenceRefresh();
    };

    const visibleInstance = ref(false);
    const activeInstanceId = ref(null);
    const showInstance = (record: VObject) => {
      if (record.flowable_instance_infos?.[0]) {
        activeInstanceId.value = record.flowable_instance_infos?.[0]?.id;
        visibleInstance.value = true;
      }
    };

    const onDelete = (record: VObject) => {
      props
        .membershipStore!.delete(record.id, {
          params: {
            q: {
              mode: 'with_invalid',
            },
          },
        })
        .then(() => {
          taIndexView.value.silenceRefresh();
        })
        .catch(() => {
          message.error('删除失败');
        });
    };

    const toggleDisable = (record: VObject) => {
      props
        .membershipStore!.sendMemberAction({
          action: record.effective ? 'disable' : 'undisable',
          id: record.id,
          config: {},
        })
        .then(() => {
          taIndexView.value.silenceRefresh();
        })
        .finally(() => {});
    };

    const taIndexView = ref<any>(null);

    const tabs = computed<TaIndexViewTabInterface[]>(() => [
      {
        key: 'effective',
        label: '有效',
        query: {
          scopes: 'effective',
        },
      },
      {
        key: 'invalid',
        label: '无效',
        query: {
          scopes: 'invalid',
        },
      },
    ]);

    const managerIds = ref<number[]>([]);
    const managerSelect = ref<any>(null);

    const taskTableItems = [
      {
        name: '名称',
        type: 'string',
        search: true,
        data_index: 'name',
      },
      {
        name: '帐号',
        type: 'string',
        search: true,
        data_index: 'account',
      },
    ];

    const createOrgOwnerships = async () => {
      await props.org.fetch();
      managerIds.value = props.org?.manager_ids;
      managerSelect.value?.open();
    };

    const onOrgOwnershipConfirm = () => {
      if (
        managerIds.value.length < props.managerLimit.min ||
        managerIds.value.length > props.managerLimit.max
      ) {
        message.error(
          `最少设置${props.managerLimit.min}个负责人, 最多设置${props.managerLimit.max}个负责人`,
        );

        return;
      }
      props.org
        .update({
          manager_ids: managerIds.value,
        })
        .then(() => {
          message.success('设置成功');
          props.org.fetch();
          taIndexView.value.silenceRefresh();
        });
    };

    return {
      ...toRefs(props),
      config,
      tabs,
      editRecord,
      formTitle,
      onEdit,
      onCreate,
      visible,
      afterSave,

      instanceConfig: ResMembershipModel.instanceConfig(),
      visibleInstance,
      activeInstanceId,
      showInstance,

      toggleDisable,
      onDelete,

      taIndexView,

      managerIds,
      managerSelect,
      createOrgOwnerships,
      onOrgOwnershipConfirm,
      taskTableItems,
    };
  },
});

export default ComResManageEnterpriseShow;
</script>

<template lang="pug">
.com-res-manage-enterprise-show.h-full.w-full
  TaIndexView(ref='taIndexView', :config='config', :tabs='tabs')
    template(#actions)
      .flex.items-center.gap-x-2
        a-button(@click='createOrgOwnerships()') 设置负责人
        a-button(type='primary' @click='onCreate()') 添加人员
    template(#bodyCell='{ text, record, index, column }')
      .manager(v-if='column.title == "负责人"')
        TaIcon.w-5.h-5.text-blue-500(type='outline/check' v-if=' org.manager_ids?.includes(record.user?.id)')
      .status(v-if='column.title == "状态"')
        span.text-xs.rounded.cursor-pointer(
          class='px-2.5 py-1.5',
          :style='record.stateConfig?.style',
          @click.stop='showInstance(record)'
        ) {{ record.stateConfig?.text }}
      .actions(v-if='column.title == "操作" && [null, "completed"].includes(record.create_instance_state) ')
        .flex.items-center
          .cursor-pointer.text-sm.primary-color.mr-2(@click='onEdit(record)') 编辑
          a-dropdown
            TaIcon.w-4.h-4.text-gray-400.cursor-pointer(type='solid/dots-horizontal')
            template(#overlay)
              a-menu(@click='onMenuClick')
                a-menu-item(key='disable')
                  TaPopoverConfirm(
                    :title='`${record.effective ? "禁用" : "取消禁用"}`',
                    :content='`确定${record.effective ? "禁用" : "取消禁用"}？`',
                    placement='top',
                    @confirm='toggleDisable(record)'
                  )
                    .flex.items-center.gap-x-2.text-gray-700
                      TaIcon.w-4.h-4(type='outline/ban')
                      .text-sm {{ record.effective ? '禁用' : '取消禁用' }}
                a-menu-item(key='delete')
                  TaPopoverConfirm(title='删除', content='确定删除？', placement='top', @confirm='onDelete(record)')
                    .flex.items-center.gap-x-2.text-red-500
                      TaIcon.w-4.h-4(type='outline/trash')
                      .text-sm 删除
  TaTemplateFormWithActionsDrawer(
    v-model:visible='visible',
    template='membership#enterprise',
    :record='editRecord',
    :title='formTitle',
    :closable='false',
    width='1100px',
    @afterSave="afterSave",
  )
  ComBpmInstanceDetailDialog(v-model:visible='visibleInstance', :instanceId='activeInstanceId')

  TaApiNoDisplayField(
    ref='managerSelect',
    v-model:value='managerIds',
    :multiple='true',
    :tableItems='taskTableItems',
    :path='`/res/manage/orgs/${org.id}/users`',
    @ok='onOrgOwnershipConfirm'
  )
</template>

<style lang="stylus" scoped>
.com-res-manage-enterprise-show
  .primary-color
    color: $primary-color
</style>
