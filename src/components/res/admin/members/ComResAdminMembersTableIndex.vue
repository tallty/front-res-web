<script lang="ts">
import { ResAdminMembersApi } from '@/res-core/apis/res/admin/members.api';
import { defineComponent, computed } from 'vue';
import { VStore } from '@/lib/vails';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';

const ComResAdminMembersTableIndex = defineComponent({
  name: 'ComResAdminMembersTableIndex',
  components: {},
  props: {
    recordName: { type: String, default: '教师' },
  },
  setup(props) {
    const store = new VStore(new ResAdminMembersApi());
    const template: TaTemplateFormItem = {
      type: 'layout',
      model: {},
      key: 'layout_1618990730330',
      model_key: 'layout_1618990730330',
      fields: [
        {
          name: '普通布局',
          type: 'layout',
          fields: [
            {
              name: '名称',
              type: 'input',
              rules: [{ rule_type: 'required', required: true, message: '请填写正确的工行' }],
              model: { attr_type: 'string' },
              options: { span: 24 },
              key: 'member_identity_name',
              model_key: 'member_identity_name',
              fields: [],
            },
          ],
          options: { span: 18, label: { align: 'right', width: 80 } },
          key: 'layout_1618990865263',
          model_key: 'layout_1618990865263',
        },
      ],
    };

    const config = computed(() => ({
      recordName: props.recordName,
      store: store,
      actions: {
        create: true,
      },
      // detail: {
      //   mode: 'drawer',
      //   width: 800,
      // },
      template: template,

      mode: 'table',
    }));

    return {
      config,
    };
  },
});

export default ComResAdminMembersTableIndex;
</script>

<template lang="pug">
.com-res-admin-members-index
  TaIndexView(:config='config')
    template(#header)
      ComIconHeader(icon='home', :title='`${recordName}管理`')
    template(#table)
      a-table-column(:autoHeight='true' title='编号', dataIndex='id')
      a-table-column(:autoHeight='true' title='姓名', dataIndex='member_identity_name')
      a-table-column(:autoHeight='true' title='类型', dataIndex='member_type')
    //- template(#detail='{ record }')
      ComResAdminUserShow(:name="record.name")
</template>

<style lang="stylus" scoped>
.com-res-admin-members-index
  height 100%
  width 100%
  padding 0 20px
</style>
