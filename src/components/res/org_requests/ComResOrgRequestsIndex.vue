<script lang="ts">
import { VObject, VStore } from '@/lib/vails';
import { defineComponent, computed, toRefs, ref } from 'vue';
import ComBpmInstanceDetailDialog from '@/engines/bpm/components/ComBpmInstanceDetailDialog.vue';
import { ResUserOrgMemberIdentitiesApi } from '@/res-core/apis/res/user/org_member_identities.api';
import { ResOrgMemberIdentityModel } from '@/res-core/models/res/org_member_identity';
import { useRouter } from 'vue-router';
import useProcessFields from '@/components/global/ta-component/ta-template-form-core/useProcessFields';

const ComResOrgRequestsIndex = defineComponent({
  name: 'ComResOrgRequestsIndex',
  components: { ComBpmInstanceDetailDialog },
  props: {
    store: { type: Object, required: true },
    recordName: { type: String, default: '' },
    orgMemberIdentityCode: { type: String, required: true },
    formType: { type: String, required: false, default: '' },
    requestType: { type: String, required: true },
    actions: { type: Array, default: () => [] },
    exportTemplate: { type: Object, default: null },
    template: { type: [String, Object], default: null },
  },
  setup(props) {
    const orgMemberIdentity = ref<any>({});
    const orgMemberIdentityStore = new VStore(
      new ResUserOrgMemberIdentitiesApi(),
      ResOrgMemberIdentityModel,
    );
    orgMemberIdentityStore.index({ q: { code_eq: props.orgMemberIdentityCode } }).then(res => {
      orgMemberIdentity.value = res.records[0];
    });

    const { mergeFormItem } = useProcessFields();

    const template = computed(() => {
      if (props.template) return props.template;
      const form = orgMemberIdentity.value?.[props.formType];
      if (form?.setting?.confs?.length > 0) {
        const forms = form.setting.confs.map((_conf: any) => ({ form: _conf.conf.form }));
        return mergeFormItem(forms);
      }
      return form;
    });

    const actions = computed(() => {
      return ['create', 'update', 'delete', 'import', 'export'].map((key: string) => {
        return { key, enabled: props.actions.includes(key) };
      });
    });

    const config = computed(() => ({
      recordName: props.recordName,
      store: props.store,
      formDataEncode: (payload: VObject) => {
        return {
          ...payload,
          type: props.requestType,
          state: 'approving',
          org_member_identity_id: orgMemberIdentity.value?.id,
        };
      },
      template: template.value,
      mode: 'table',
      actions: actions.value,
      table: {
        scroll: { y: 'auto' },
      },
    }));

    const instanceId = ref(null);
    const bpmVisible = ref(false);
    const onShowInstance = (record: any) => {
      if (record.create_instance_id) {
        instanceId.value = record.create_instance_id;
        bpmVisible.value = true;
      }
    };

    const visibleDrawer = ref(false);
    const currentRecord = ref({});
    const onShow = (record: any) => {
      currentRecord.value = record;
      visibleDrawer.value = true;
    };

    const visibleTanentDrawer = ref(false);
    const onAddTanent = (record: any) => {
      currentRecord.value = record;
      visibleTanentDrawer.value = true;
    };

    const taIndexView = ref<any>(null);
    const loadData = () => {
      taIndexView.value?.silenceRefresh();
    };

    const router = useRouter();
    const showOrg = (record: any) => {
      router.push(
        `/manage/tanent/orgs/${record.org_id}?org_member_identity_code=incub_company_auth`,
      );
    };

    const taExport = ref<any>(null);
    const onExport = () => {
      taExport.value.onHeaders();
    };

    return {
      ...toRefs(props),
      config,
      instanceId,
      bpmVisible,
      onShowInstance,

      visibleDrawer,
      currentRecord,
      onShow,

      taIndexView,
      loadData,

      showOrg,

      template,

      onExport,
      taExport,

      visibleTanentDrawer,
      onAddTanent,
    };
  },
});

export default ComResOrgRequestsIndex;
</script>

<template lang="pug">
.com-res-org-requests-index.h-full.p-4.bg-white
  TaIndexView(ref='taIndexView' :config='config', @onShow='onShow')
    template(#right-actions  v-if='exportTemplate')
      TaTextButton(icon='ExportOutlined' @click='onExport') 导出
    template(#bodyCell='{ text, record, index, column }')
      .flex(v-if='column.title == "员工管理"')
        .text-white.text-xs.rounded.block.cursor-pointer.bg-primary(
          class='px-2.5 py-1.5'
          v-if='record.org_id',
         @click.stop='showOrg(record)'
        ) 员工管理
      .flex(v-if='column.title == "审批"')
        .text-white.text-xs.rounded.block.cursor-pointer(
          class='px-2.5 py-1.5'
          :style="record.stateConfig?.style",
          @click.stop='onShowInstance(record)',
        ) {{ record.stateConfig?.text }}
      .text-sm.cursor-pointer.text-primary.font-medium.flex.items-center(
        @click.stop='onAddTanent(record)',
        v-if='column.dataIndex == "add_tanents"'
      ) 
        TaIcon.w-3.h-3(type='EditOutlined')
        .ml-2 租户
  ComBpmInstanceDetailDialog(v-if='instanceId', :instanceId='instanceId', v-model:visible='bpmVisible', @close='loadData()')
  TaTemplateFormWithActionsDrawer(
    v-model:visible='visibleDrawer',
    :closable='false',
    :disabled='true',
    title='详情',
    :record='currentRecord',
    :template='template',
  )

  TaTemplateFormWithActionsDrawer(
    v-model:visible='visibleTanentDrawer',
    template='org_request#tanents',
    :record='currentRecord',
  )

  TaExport.hidden(ref='taExport', :store='store', :template='exportTemplate')
</template>

<style lang="stylus" scoped>
.bg-primary
  background $primary-color
.hidden
  display none
</style>
