<script lang="ts">
import { FormsUserSetableTemplateApi } from '@/components/global/ta-component/ta-template-form-core/templates.api';
import useProcessFields from '@/components/global/ta-component/ta-template-form-core/useProcessFields';
import { VObject } from '@/lib/vails';
import { computed, defineComponent, ref, toRefs, watch } from 'vue';
import ComResMemberIdentityTree from '../../member_identities/ComResMemberIdentityTree.vue';
import ComResUserShow from '../../users/ComResUserShow.vue';
import ComResAdminMemberShow from '../members/ComResAdminMemberShow.vue';

const ComResAdminUserIndex = defineComponent({
  name: 'ComResAdminUserIndex',
  components: {
    ComResUserShow,
    ComResMemberIdentityTree,
    ComResAdminMemberShow,
  },
  props: {
    store: { type: Object, required: true },
    memberStore: { type: Object, required: true },
    membershipStore: { type: Object, required: true },
    identityStore: { type: Object, required: true },
    tagRelationStore: { type: Object, required: true },
    memberIdentityId: { type: Number, default: null },
    leftHide: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['onIdentitySelect'],
  setup(props, { emit }) {
    const identityId = ref(props.memberIdentityId || null);
    const store = computed(() => {
      return identityId.value ? props.memberStore : props.store;
    });

    const searcherSimpleOptions = computed(() => {
      return identityId.value
        ? [
            { key: 'user_name', label: '姓名', type: 'string' },
            { key: 'user_account', label: '账号', type: 'string' },
          ]
        : [
            { key: 'name', label: '姓名', type: 'string' },
            { key: 'account', label: '账号', type: 'string' },
          ];
    });

    const identityRecord = ref<VObject>({});

    const findIdentityRecord = () => {
      props.identityStore.find(identityId.value).then((res: any) => {
        identityRecord.value = res.data;
      });
    };

    const userTemplate = ref<any>({ form: {} });
    const memberTemplate = ref<any>({ form: {} });

    const fetchTemplates = () => {
      Promise.all([
        new FormsUserSetableTemplateApi({
          parents: [{ type: 'user', id: 'res_model' }],
        }).find(),
        new FormsUserSetableTemplateApi({
          parents: [{ type: 'member', id: 'res_model' }],
        }).find(),
      ]).then(([userTemp, memberTemp]) => {
        userTemplate.value = userTemp.data;
        memberTemplate.value = memberTemp.data;
      });
    };

    fetchTemplates();

    const { mergeFormItem } = useProcessFields();

    const mergedTemplate = computed(() => {
      if (identityId.value) {
        if (
          identityRecord.value &&
          identityRecord.value.form &&
          Object.keys(identityRecord.value.form).length > 0
        ) {
          if (identityRecord.value.form.setting?.confs?.[0]?.conf) {
            return mergeFormItem([
              memberTemplate.value,
              identityRecord.value.form.setting.confs[0].conf,
            ]);
          }
          return mergeFormItem([memberTemplate.value, identityRecord.value]);
        }
        return mergeFormItem([memberTemplate.value]);
      }

      return mergeFormItem([userTemplate.value]);
    });

    const tableColumns = computed(() => {
      let columns = [];
      if (identityId.value) {
        if (identityRecord.value.form && Object.keys(identityRecord.value.form).length > 0) {
          columns = mergeFormItem([
            memberTemplate.value,
            identityRecord.value,
          ])?.column_attributes?.filter((column_info: any) => column_info?.index?.on === true);
        } else {
          columns = memberTemplate.value.form?.column_attributes?.filter(
            (column_info: any) => column_info?.index?.on === true,
          );
        }
      } else {
        columns = userTemplate.value.form?.column_attributes?.filter(
          (column_info: any) => column_info?.index?.on === true,
        );
      }
      columns ||= [];
      columns.push({ key: 'actions' });
      return columns;
    });

    const config = computed(() => ({
      recordName: '人员',
      store: store.value,
      detail: {
        mode: 'drawer',
        width: '1100px',
      },
      formDataEncode: (payload: VObject) => {
        return { ...payload, member_identity_id: identityId.value };
      },
      template: mergedTemplate.value,
      mode: 'table',
      actions: [
        { key: 'create', enabled: true },
        { key: 'update', enabled: true },
        { key: 'delete', enabled: true },
        { key: 'import', enabled: true },
        { key: 'export', enabled: true },
      ],
      table: {
        scroll: { y: 'auto' },
        columns: tableColumns.value,
      },
      searcherSimpleOptions: searcherSimpleOptions.value,
    }));

    const taIndexView = ref<any>(null);
    const drawerTitle = ref('');
    const editRecord = ref<VObject>({});
    const visible = ref(false);

    // const onUpdate = (record: VObject) => {
    //   if (identityId.value) {
    //     drawerTitle.value = '编辑身份';
    //     editRecord.value = record.value;
    //     visible.value = true;
    //     formUserId.value = record.userId;
    //   }
    // };

    // const onCreate = () => {
    //   if (identityId.value) {
    //     editRecord.value = props.memberStore.new({ member_ideitity_id: identityId.value });
    //     formUserId.value = null;
    //     drawerTitle.value = '新建身份';
    //     visible.value = true;
    //   }
    // };

    const formUserId = ref(null);

    watch(
      () => editRecord.value,
      () => {
        const dirty = editRecord.value?.dirty();
        if (dirty?.user_id && formUserId.value !== dirty?.user_id) {
          props.store.find(dirty.user_id).then((res: any) => {
            editRecord.value.formData.user = res.data;
            formUserId.value = dirty.user_id;
          });
        }
      },
      {
        deep: true,
      },
    );

    const onIdentitySelect = (data: VObject) => {
      emit('onIdentitySelect', data);
      identityId.value = data.identityId;
      if (identityId.value) {
        findIdentityRecord();
      }
    };

    const treeKeyword = ref('');

    const afterSave = () => {
      taIndexView.value?.fetchData();
    };

    return {
      ...toRefs(props),
      config,
      taIndexView,
      treeKeyword,
      identityId,
      // onUpdate,
      // onCreate,
      onIdentitySelect,
      mergedTemplate,
      editRecord,
      visible,
      drawerTitle,
      afterSave,
    };
  },
});

export default ComResAdminUserIndex;
</script>

<template lang="pug">
.com-res-admin-user-index.flex.space-between.h-full
  .left-side.p-4.h-full(v-if='!leftHide')
    .mb-4
      a-input(v-model:value='treeKeyword', placeholder='搜索身份')
        template(#prefix)
          TaIcon.w-4.h-4.text-gray-300(type='solid/search')
    ComResMemberIdentityTree(
      :keyword='treeKeyword',
      :store='identityStore',
      @selected='onIdentitySelect'
    )

  .right-side.h-full.flex.flex-col.border-l.border-solid.border-gray-200.pl-4
    .text-2xl.font-semibold.text-gray-900.mr-2.px-4.pt-4 人员管理
    TaIndexView.flex-auto(
      ref='taIndexView',
      :config='config',
    )
      template(#detail='{ record, onClose }')
        ComResUserShow(
          v-if='record.id && !identityId',
          :store='store',
          :memberStore='memberStore',
          :membershipStore='membershipStore',
          :tagRelationStore='tagRelationStore',
          :record='record'
        )
        ComResAdminMemberShow(
          v-if='record.id && identityId',
          :store='memberStore',
          :userStore='store',
          :membershipStore='membershipStore',
          :tagRelationStore='tagRelationStore',
          :record='record'
        )

  TaTemplateFormWithActionsDrawer(
    v-model:visible='visible',
    :template='mergedTemplate',
    :record='editRecord',
    :title='drawerTitle',
    :closable='false',
    width='1100px',
    @afterSave='afterSave'
  )
</template>

<style lang="stylus" scoped>
.com-res-admin-user-index
  height 100%
  width 100%
  >>>.table-header .table-header__title-box .table-header__title
    display none
  .left-side
    width 300px
  .right-side
    width calc(100% - 300px)
</style>
