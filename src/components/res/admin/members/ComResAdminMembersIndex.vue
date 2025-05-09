<script lang="ts">
import { ResAdminMembersApi } from '@/res-core/apis/res/admin/members.api';
import { defineComponent, ref, computed } from 'vue';
import { VStore } from '@/lib/vails';
import { ResAdminMemberIdentitiesApi } from '@/res-core/apis/res/admin/member_identities.api';
import {
  TaTemplateFormSelect,
  TaTemplateFormStepsStep,
  TaTemplateFormItem,
} from '@/components/global/ta-component/ta-template-form-core/types';
import { ResMemberIdentity } from '@/res-core/model';
import {
  memberTemplate,
  memberMembershipsWithInvalidTemplate,
  memberIdentityTemplate,
} from './template';
import { ResAdminUsersApi } from '@/res-core/apis/res/admin/users.api';
import { cloneDeep } from 'lodash';
import useProcessFields from '@/components/global/ta-component/ta-template-form-core/useProcessFields';

const ComResAdminMembersIndex = defineComponent({
  name: 'ComResAdminMembersIndex',
  components: {},
  setup() {
    // NOTE: create 是用的是 user 接口，update 使用的是 member 接口
    const identityStore = new VStore(new ResAdminMemberIdentitiesApi());
    const memberApiClass = ResAdminMembersApi;
    const userApiClass = ResAdminUsersApi;
    const store: any = new VStore(new userApiClass({ encrypt: true }));
    const userStore = new VStore(new userApiClass({ encrypt: true }));

    const identityOptions = ref<TaTemplateFormSelect[]>([]);

    const onIdentityIndex = () => {
      identityOptions.value = identityStore.records.value.map((record: ResMemberIdentity) => ({
        label: record.name,
        value: record.id,
      }));

      identityStore.records.value.unshift({
        id: null,
        name: '全部',
      } as any);
    };

    const activeIdentity = ref<Partial<ResMemberIdentity>>({});

    const onIdentityClick = (record: ResMemberIdentity) => {
      // 第一个 identity 请求 user，其余 identity 请求 member
      store.api = record.id ? new memberApiClass() : new userApiClass();
      activeIdentity.value = record;
    };

    const visibleCreate = ref(false);
    const userRecord = ref<any>(null);

    const onCreateUser = () => {
      visibleCreate.value = true;
      userRecord.value = userStore.new();
    };

    const { processField } = useProcessFields();

    const getTemplate = (create?: boolean) => {
      // 列表额外 attrs
      const extraColumnAttrs = activeIdentity.value.id
        ? [{ title: '手机号', _id: 'input_1636877040019_3', dataIndex: 'user_mobile' }]
        : [
            { title: '身份', dataIndex: 'member_identity_names' },
            { title: '手机号', _id: 'input_1636877040019_3', dataIndex: 'mobile' },
          ];
      const temp = memberTemplate(identityOptions.value, create, extraColumnAttrs);

      // 具体角色的额外表单字段
      const extra = activeIdentity.value.form?.key && cloneDeep(activeIdentity.value.form);

      if (extra) {
        processField(
          extra,
          (item: any) =>
            (item.model_key_prefix = ['payload', item.model_key_prefix].filter(i => i).join('.')),
        );
      }
      return { ...temp, fields: [...temp.fields, extra].filter(i => i) };
    };

    const template = computed(() => getTemplate());
    const createTemplate = computed(() => getTemplate(true));

    const searcherSimpleOptions = computed(() =>
      activeIdentity.value.id
        ? [
            { label: '名称', key: 'user_name' },
            { label: '账号', key: 'user_account' },
          ]
        : [
            { label: '名称', key: 'name' },
            { label: '账号', key: 'account' },
          ],
    );

    const steps = computed(() => {
      const result: TaTemplateFormStepsStep[] = [
        {
          title: '基本信息',
          type: 'form',
          form: template.value as TaTemplateFormItem,
        },
        {
          title: '权限',
          type: 'dynamicComponent',
          dynamicComponent: 'ComPermitAdminUserRolesIndex',
          bindKey: 'user',
        },
      ];
      if (activeIdentity.value.id) {
        result.push({
          title: '岗位',
          type: 'form',
          form: memberMembershipsWithInvalidTemplate,
        });
      }
      return result;
    });

    const indexComponent = ref<any>(null);

    const afterCreateUser = () => {
      indexComponent.value?.rightTaIndexView?.silenceRefresh?.();
    };

    const extraConfig = computed(() => ({
      searcherSimpleOptions: searcherSimpleOptions.value,
      steps: steps.value,
      actions: {
        export: activeIdentity.value.form ? { exportTemplate: activeIdentity.value.form } : true,
      },
    }));

    return {
      identityStore,
      store,
      onIdentityIndex,
      onCreateUser,
      visibleCreate,
      userRecord,
      template,
      createTemplate,
      memberIdentityTemplate,
      onIdentityClick,
      searcherSimpleOptions,
      steps,
      indexComponent,
      afterCreateUser,
      extraConfig,
    };
  },
});

export default ComResAdminMembersIndex;
</script>

<template lang="pug">
.com-res-admin-members-index
  ComIdentityEditor(
    ref='indexComponent',
    recordName='成员',
    :store='store',
    :recordTemplate='template',
    identityName='身份',
    :identityStore='identityStore',
    :identityTemplate='memberIdentityTemplate',
    recordForeignKey='member_identity_id',
    :actions='{ update: true, delete: true }',
    :extraConfig='extraConfig',
    @identityIndex='onIdentityIndex'
  )
    template(#identity='{ record, isActive, actions }')
      .card(:class='isActive === true ? "active-card" : ""', @click='onIdentityClick(record)')
        .left
          .icon-box
            TaIcon(type='UserOutlined')
          .name {{ record.name }}
        .right
          TaIcon.icon(v-if='record.id', type='EditOutlined', @click.stop='actions.onEdit(record)')
          TaPopoverConfirm(
            v-if='record.id',
            title='删除',
            content='您确认删除该吗',
            @confirm='actions.onDelete(record)'
          )
            TaIcon(v-if='record.id', type='DeleteOutlined', @click.stop='')
    template(#right-header='{ record }')
      .header
        .active-title
          ComIconText(:text='record.name || "全部"')
        .actions
          TaTextButton(icon='PlusCircleOutlined', @click='onCreateUser') 创建

  //- create 是用的是 user 接口，update 使用的是 member 接口
  TaTemplateFormWithActionsDrawer(
    v-model:visible='visibleCreate',
    title='创建用户',
    :template='createTemplate',
    :record='userRecord'
    @afterSave='afterCreateUser'
  )
</template>

<style lang="stylus" scoped>
.com-res-admin-members-index
  height 100%
  width 100%
  flex 1
.card
  height 38px
  width 100%
  padding 0 40px
  display flex
  justify-content space-between
  align-items center
  font-size 14px
  font-family PingFangSC-Regular, PingFang SC
  font-weight 400
  color #262626
  cursor pointer
  .left
    display flex
    align-items center
    .icon-box
      margin-right 6px
      color #83C6EF
      font-size 16px
  .right
    display none
    .icon
      margin-right 5px
  &:hover
    .right
      display flex
.active-card
  background #E3F7FF
.card:hover
  background #E3F7FF
.header
  display flex
  justify-content space-between
  align-items center
  .active-title
    display flex
    align-items center
    font-size 20px
    font-family PingFangSC-Regular, PingFang SC
    font-weight 400
    color #595959
    .icon-box
      margin-right 6px
      color #83C6EF
      font-size 22px
  .actions
    margin-bottom -5px
</style>
