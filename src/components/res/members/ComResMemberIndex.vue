<script lang="ts">
import { defineComponent, computed, ref, toRefs, onMounted } from 'vue';
import useProcessFields from '@/components/global/ta-component/ta-template-form-core/useProcessFields';
import { VObject } from '@/lib/vails/model';
import ComResMembersShow from './ComResMembersShow.vue';
import { FormsUserSetableTemplateApi } from '@/components/global/ta-component/ta-template-form-core/templates.api';
import { FormsResourceInfos } from '@/engines/bpm/bpm-core/ta-template-form-core/apis/forms/resource_infos';

const ComResMemberIndex = defineComponent({
  name: 'ComResMemberIndex',
  components: {
    ComResMembersShow,
  },
  props: {
    store: { type: Object, required: true },
    memberIdentity: { type: Object, required: true },
  },
  setup(props, { emit }) {
    const enabledActions: any = ref([]);
    const fetchEnabledActoins = () => {
      new FormsResourceInfos()
        .sendCollectionAction('enable_actions', {
          data: {
            resource_info: {
              path: `/res/manage/member_identities/${props.memberIdentity.id}/members`,
              context: { member_identity_id: props.memberIdentity.id },
            },
          },
        })
        .then(({ data }) => {
          enabledActions.value = data.actions;
        });
    };

    fetchEnabledActoins();

    const memberTemplate = ref<any>({ form: {} });

    const fetchTemplates = () => {
      new FormsUserSetableTemplateApi({
        parents: [{ type: 'member', id: 'res_model' }],
      })
        .find()
        .then(res => {
          memberTemplate.value = res.data;
        });
    };

    fetchTemplates();

    const { mergeFormItem } = useProcessFields();

    const mergedTemplate = computed(() => {
      if (props.memberIdentity.form && Object.keys(props.memberIdentity.form).length > 0) {
        return mergeFormItem([memberTemplate.value, props.memberIdentity]);
      }
      return mergeFormItem([memberTemplate.value]);
    });

    const tableColumns = computed(() => {
      return mergedTemplate.value?.column_attributes?.filter((attr: any) => attr.index.on);
    });

    const config = computed(() => ({
      recordName: props.memberIdentity.name,
      store: props.store,
      template: '',
      mode: 'table',
      actions: [
        { key: 'create', enabled: enabledActions.value.includes('create') },
        { key: 'update', enabled: true },
        { key: 'delete', enabled: true },
        { key: 'import', enabled: enabledActions.value.includes('import') },
        { key: 'export', enabled: enabledActions.value.includes('export') },
      ],
      table: {
        scroll: { y: 'auto' },
        columns: tableColumns.value,
      },
      searcherSimpleOptions: [
        { key: 'user_name', label: '姓名', type: 'string' },
        { key: 'user_account', label: '账号', type: 'string' },
      ],
    }));

    const taIndexView = ref<any>(null);
    const drawerTitle = ref('');
    const editRecord = ref<VObject>({});
    const visible = ref(false);

    const onUpdate = (record: VObject) => {
      drawerTitle.value = `编辑${props.memberIdentity.name}`;
      editRecord.value = record;
      visible.value = true;
    };

    const onCreate = () => {
      editRecord.value = props.store.new({});
      drawerTitle.value = `新建${props.memberIdentity.name}`;
      visible.value = true;
    };

    const afterSave = () => {
      taIndexView.value?.fetchData();
    };

    return {
      ...toRefs(props),
      config,
      taIndexView,
      editRecord,
      drawerTitle,
      mergedTemplate,
      visible,

      onUpdate,
      onCreate,
      afterSave,
    };
  },
});

export default ComResMemberIndex;
</script>

<template lang="pug">
.com-res-member-member-index
  TaIndexView(ref='taIndexView', :config='config', @onCreate='onCreate', @onUpdate='onUpdate', @onShow='onUpdate')

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
.com-res-member-member-index
  height 100%
  width 100%
</style>
