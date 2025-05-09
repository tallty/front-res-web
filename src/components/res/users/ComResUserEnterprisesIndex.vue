<script lang="ts">
import { ResUserBpmMembershipsApi } from '@/res-core/apis/res/user/memberships.api';
import { ResUserOrgsApi } from '@/res-core/apis/res/user/orgs.api';
import { ResMembershipModel } from '@/res-core/models/res/membership';
import { VObject, VStore } from '@/lib/vails';
import { defineComponent, computed, toRefs, ref } from 'vue';
import ComBpmInstanceDetailDialog from '@/engines/bpm/components/ComBpmInstanceDetailDialog.vue';
import { AuthSessionApi } from '@/engines/login/apis/auth/session.api';
import { message } from 'ant-design-vue';

const ComResUserEnterprisesIndex = defineComponent({
  name: 'ComResUserEnterprisesIndex',
  components: {
    ComBpmInstanceDetailDialog,
  },
  props: {
    orgConfig: { type: Object, default: () => {} },
    extraConfig: { type: Object, default: () => {} },
    formOptions: { type: Object, default: () => {} },
    joinTemplate: { type: String, default: 'membership#join_request' },
    managerLimit: { type: Object, default: () => ({ min: 1 }) },
  },
  setup(props) {
    const store = new VStore(
      new ResUserOrgsApi({
        params: {
          q: { mode: 'enterprises', ...props.orgConfig },
        },
      }),
    );

    const config = computed(() => ({
      recordName: '我的企业',
      store,
      mode: 'table',
      table: {
        scroll: { y: 'auto' },
        columns: [
          { dataIndex: 'name', title: '企业名称' },
          { dataindex: '', title: '审核状态' },
          { dataIndex: '', title: '操作' },
        ],
      },
      ...props.extraConfig,
    }));

    const membershipStore = new VStore(new ResUserBpmMembershipsApi(), ResMembershipModel);

    const visible = ref(false);
    const membershipRecord = ref({});
    const joinEnterprise = () => {
      membershipRecord.value = membershipStore.new({
        user: AuthSessionApi.currentUser(),
        ...props.formOptions,
      });
      visible.value = true;
    };

    const taIndexView = ref<any>(null);

    const afterSave = (record: VObject) => {
      if (record.flowable_instance_infos?.length > 0) {
        showInstance(record);
      }
      taIndexView.value.refresh();
    };

    const visibleInstance = ref(false);
    const activeInstanceId = ref(null);

    const showInstance = (record: VObject) => {
      activeInstanceId.value =
        record.latest_membership_fii?.[0]?.id || record.flowable_instance_infos?.[0]?.id;
      visibleInstance.value = true;
    };

    const recordInstanceConfig = (record: VObject) => {
      return ResMembershipModel.instanceConfig()[record.latest_membership_fii[0]?.state] || {};
    };

    const exitEnterprise = (record: VObject) => {
      store.find(record.id).then(({ data }) => {
        const managerIds = (data as VObject).manager_ids;
        if (
          managerIds.length == props.managerLimit.min &&
          managerIds.includes(AuthSessionApi.currentUser().id)
        ) {
          message.error('请先移交管理权限');
          return;
        }

        store.sendMemberAction({ id: record.id, action: 'exit', config: {} }).then(res => {
          taIndexView.value.refresh();
        });
      });
    };

    const slotActions = computed(() => ({
      showInstance,
      exitEnterprise,
      joinEnterprise,
    }));

    const onClose = () => {
      taIndexView.value.refresh();
    };

    return {
      ...toRefs(props),
      config,
      afterSave,
      taIndexView,
      visible,
      membershipRecord,

      visibleInstance,
      activeInstanceId,
      showInstance,
      instanceConfig: ResMembershipModel.instanceConfig(),
      recordInstanceConfig,

      slotActions,
      onClose,
    };
  },
});

export default ComResUserEnterprisesIndex;
</script>

<template lang="pug">
.com-res-user-enterprises-index.h-full
  TaIndexView(ref='taIndexView', :config='config')
    template(#actions)
      slot(name='actions', :actions='slotActions')
        a-button(type='primary' @click='slotActions.joinEnterprise()') 加入新企业
    template(#table)
      slot(name='table')
    template(#bodyCell='{ record, column, text, index }')
      template(v-if='column.title == "审核状态"')
        span.text-xs.rounded.cursor-pointer(
          class='px-2.5 py-1.5',
          :style='instanceConfig[record.latest_membership_fii[0]?.state]?.style',
          @click.stop='slotActions.showInstance(record)'
        ) {{ instanceConfig[record.latest_membership_fii[0]?.state]?.text }}
      template(v-if='column.title == "操作"')
        .flex.items-center.gap-x-2
          TaPopoverConfirm(
            v-if='record.exit_by_user',
            title='退出',
            content='您确认退出该企业吗？',
            @confirm='slotActions.exitEnterprise(record)'
          )
            a-button(size='small') 退出企业
    template(#card='{ record }')
      slot(name='card', :record='record', :actions='slotActions', :instanceConfig='recordInstanceConfig(record)')
  TaTemplateFormWithActionsDrawer(
    v-if='visible',
    v-model:visible='visible',
    :template='joinTemplate',
    :record='membershipRecord',
    title='提交申请',
    :closable='false',
    width='1100px',
    @afterSave="afterSave",
  )
  ComBpmInstanceDetailDialog(v-model:visible='visibleInstance', :instanceId='activeInstanceId', @close='onClose')
</template>
