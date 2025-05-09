import { VObject } from '../../../../../../lib/vails/model/index';
import {
  TaTemplateFormSelect,
  TaTemplateFormItem,
} from '../../../../../../components/global/ta-component/ta-template-form-core/types';
export const dutyGroupTemplate = {
  type: 'layout',
  model: {},
  key: 'layout_1637323445698_0',
  model_key: 'layout_1637323445698_0',
  fields: [
    {
      name: '普通布局',
      type: 'layout',
      fields: [
        {
          name: '名称',
          type: 'input',
          rules: [
            { rule_type: 'required', type: 'string', required: true, message: '请填写正确的名称' },
          ],
          model: { attr_type: 'string' },
          options: { span: 24 },
          key: 'input_1637323449769_2',
          model_key: 'name',
          fields: [],
          conditions: [],
          model_key_prefix: '',
        },
      ],
      options: { span: 24, label: { width: 80, align: 'left' } },
      key: 'layout_1637323448150_1',
      model_key: 'layout_1637323448150_1',
      conditions: [],
      model_key_prefix: '',
    },
  ],
  conditions: [],
  options: { label: {}, disabled_actions: {} },
};

export const dutyTemplateFunc = (dutyGroupSelect: TaTemplateFormSelect[]) => ({
  type: 'layout',
  model: {},
  key: 'layout_1637323445698_0',
  model_key: 'layout_1637323445698_0',
  fields: [
    {
      name: '普通布局',
      type: 'layout',
      fields: [
        {
          name: '名称',
          type: 'input',
          rules: [
            { rule_type: 'required', type: 'string', required: true, message: '请填写正确的名称' },
          ],
          model: { attr_type: 'string' },
          options: { span: 24 },
          key: 'input_1637323449769_2',
          model_key: 'name',
          fields: [],
          conditions: [],
          model_key_prefix: '',
        },
        {
          name: '等级',
          type: 'input',
          rules: [],
          model: { attr_type: 'string' },
          options: { span: 24 },
          key: 'input_1637323869825_3',
          model_key: 'rank',
          fields: [],
          conditions: [],
          model_key_prefix: '',
        },
        {
          name: '角色组',
          type: 'select',
          rules: [
            {
              rule_type: 'required',
              type: 'number',
              required: true,
              message: '请填写正确的角色组',
            },
          ],
          model: { attr_type: 'number' },
          options: { select: dutyGroupSelect, multiple: false, span: 24 },
          key: 'select_1637323934346_4',
          model_key: 'duty_group_id',
          fields: [],
          conditions: [],
          model_key_prefix: '',
        },
      ],
      options: { span: 24, label: { width: 80, align: 'left' } },
      key: 'layout_1637323448150_1',
      model_key: 'layout_1637323448150_1',
      conditions: [],
      model_key_prefix: '',
    },
  ],
  conditions: [],
  options: { label: {}, disabled_actions: {} },
  actions: [],
});

export const dutyMembershipTemplate: TaTemplateFormItem = {
  key: 'layout_1637045146744_0',
  type: 'layout',
  model: {},
  fields: [],
  options: { label: {}, disabled_actions: {} },
  model_key: 'layout_1637045146744_0',
  conditions: [],
  column_attributes: [
    { title: '用户名', dataIndex: 'member.name' },
    { title: '账号', dataIndex: 'member.account' },
    { title: '角色', dataIndex: 'member.member_identity_name' },
    { title: '岗位', dataIndex: 'duty.name' },
    { title: '部门', dataIndex: 'department.name' },
    { title: '组织', dataIndex: 'org.name' },
  ],
  index_attributes: [],
};
