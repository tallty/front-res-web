<script lang="ts">
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';
import { ResAdminUsersApi } from '@/res-core/apis/res/admin/users.api';
import { VStore } from '@/lib/vails';
import { VObject } from '@/lib/vails/model';
import { computed, defineComponent } from 'vue';
import ComResAdminUserShow from './ComResAdminUserShow.vue';

const ComResAdminUsersIndex = defineComponent({
  name: 'ComResAdminUsersIndex',
  components: { ComResAdminUserShow },
  setup() {
    const store = new VStore(new ResAdminUsersApi());
    const template: TaTemplateFormItem = {
      type: 'layout',
      model: {},
      key: 'layout_1618990730330',
      model_key: 'layout_1618990730330',
      fields: [
        {
          name: '普通布局',
          type: 'layout',
          fields: [],
          options: { span: 2, label: {} },
          key: 'layout_1618990830140',
          model_key: 'layout_1618990830140',
        },
        {
          name: '普通布局',
          type: 'layout',
          fields: [
            {
              name: 'label1',
              type: 'label',
            },
            {
              name: '工号',
              type: 'input',
              rules: [{ rule_type: 'required', required: true, message: '请填写正确的工行' }],
              model: { attr_type: 'string' },
              options: { span: 24 },
              key: 'account',
              model_key: 'account',
              fields: [],
            },
            {
              name: '姓名',
              type: 'input',
              rules: [{ rule_type: 'required', required: true, message: '请填写正确的姓名' }],
              model: { attr_type: 'string' },
              options: { span: 24 },
              key: 'name',
              model_key: 'name',
              fields: [],
            },
            {
              name: '部门',
              type: 'input',
              rules: [],
              model: { attr_type: 'string' },
              options: { span: 24 },
              key: 'input_1618990734840',
              model_key: 'input_1618990734840',
              fields: [],
            },
            {
              name: '单行输入',
              type: 'input',
              rules: [],
              model: { attr_type: 'string' },
              options: { span: 24 },
              key: 'input_1618990735680',
              model_key: 'input_1618990735680',
              fields: [],
            },
            {
              name: 'label22',
              type: 'label',
            },
            {
              name: '普通布局',
              type: 'layout',
              fields: [
                {
                  name: '手机',
                  type: 'input',
                  rules: [{ rule_type: 'required', required: true, message: '请填写正确的手机' }],
                  model: { attr_type: 'string' },
                  options: { span: 24 },
                  key: 'input_1618992213082',
                  model_key: 'input_1618992213082',
                  fields: [],
                },
                {
                  name: '邮箱',
                  type: 'input',
                  rules: [{ rule_type: 'required', required: true, message: '请填写正确的邮箱' }],
                  model: { attr_type: 'string' },
                  options: { span: 24 },
                  key: 'input_1618992218665',
                  model_key: 'input_1618992218665',
                  fields: [],
                },
                {
                  name: '家庭住址',
                  type: 'input',
                  rules: [],
                  model: { attr_type: 'string' },
                  options: { span: 24 },
                  key: 'input_1618992217599',
                  model_key: 'input_1618992217599',
                  fields: [],
                },
                {
                  name: '资格证书类别',
                  type: 'input',
                  rules: [],
                  model: { attr_type: 'string' },
                  options: { span: 24 },
                  key: 'input_1618992212020',
                  model_key: 'input_1618992212020',
                  fields: [],
                },
              ],
              options: { span: 24 },
              key: 'layout_1618992208648',
              model_key: 'layout_1618992208648',
            },
          ],
          options: { span: 18, label: { align: 'right', width: 80 } },
          key: 'layout_1618990865263',
          model_key: 'layout_1618990865263',
        },
      ],
    };
    const config = computed(() => ({
      recordName: '账号',
      store: store,
      actions: {
        create: true,
      },
      detail: {
        mode: 'drawer',
        width: 800,
      },
      template: template,

      mode: 'table',
    }));
    const onShow = (record: VObject) => {
      console.log('onShow', record);
    };
    return {
      config,
      template,
      onShow,
    };
  },
});

export default ComResAdminUsersIndex;
</script>

<template lang="pug">
.com-res-admin-users-index
  TaIndexView(:config='config', @onShow='onShow')
    template(#header)
      ComIconHeader(icon='home', title='项目管理')
    template(#table)
      a-table-column(:autoHeight='true' title='编号', dataIndex='account')
      a-table-column(:autoHeight='true' title='姓名', dataIndex='name')
      a-table-column(:autoHeight='true' title='性别', dataIndex='sex')
      a-table-column(:autoHeight='true' title='手机号', dataIndex='phone')
      a-table-column(:autoHeight='true' title='身份证号', dataIndex='')
      a-table-column(:autoHeight='true' title='部门', dataIndex='members')
      a-table-column(:autoHeight='true' title='岗位', dataIndex='mobile')
      a-table-column(:autoHeight='true' title='当前状态', dataIndex='state')
    template(#detail='{ record }')
      ComResAdminUserShow(:name='record.name')
</template>

<style lang="stylus" scoped>
.com-res-admin-users-index
  height 100%
  width 100%
  padding 0 20px
</style>
