import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';

export const permitTemplate: TaTemplateFormItem = {
  type: 'layout',
  model: {},
  key: 'layout_1668603742054_0',
  model_key: 'layout_1668603742054_0',
  fields: [
    {
      name: '是否开启权限',
      type: 'switch',
      rules: [],
      model: { attr_type: 'boolean' },
      options: { span: 24, label: { width: 100 } },
      key: 'switch_1668603753568_2',
      model_key: 'permit_enable',
      fields: [],
      conditions: [],
      model_key_prefix: '',
    },
    {
      name: '条件块',
      type: 'condition',
      conditions: [
        {
          name: '条件1',
          model_key: '',
          val: '',
          fields: [
            {
              name: '权限控制',
              type: 'res_permit_polymorphic',
              rules: [
                {
                  rule_type: 'required',
                  type: 'array',
                  required: true,
                  message: '请填写正确的权限控制',
                },
              ],
              model: { attr_type: 'array' },
              options: {
                span: 24,
                paths: [
                  null,
                  null,
                  '/res/admin/duties',
                  '/res/admin/orgs',
                  '/res/admin/departments',
                ],
              },
              key: 'res_permit_polymorphic_1668603791052_7',
              model_key: 'permit_res_permit_actions',
              fields: [],
              conditions: [],
              model_key_prefix: '',
            },
          ],
          type: 'complex',
          complex_condition: {
            groups: [
              {
                items: [
                  {
                    _id: '1668603773441_0',
                    rule: {
                      type: 'Com::Attr::ConditionRules::Boolean',
                      key: 'permit_enable',
                      key_name: '是否开启权限',
                      opt: '==',
                      val: true,
                    },
                    desc: {
                      name: '是否开启权限',
                      optZh: '等于',
                      modelValue: { rule: { val: true } },
                      template: {
                        key: 'key',
                        type: 'layout',
                        fields: [
                          {
                            key: 'switch_1632802235314_19',
                            name: '值',
                            type: 'switch',
                            model: { attr_type: 'boolean' },
                            rules: [],
                            fields: [],
                            options: { span: 24, placeholder: '' },
                            model_key: 'val',
                            conditions: [],
                            model_key_prefix: 'rule',
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
      options: { span: 24 },
      key: 'condition_1668603769084_4',
      model_key: 'condition_1668603769084_4',
      fields: [],
      model_key_prefix: '',
    },
  ],
  conditions: [],
  options: {
    label: {},
    disabled_actions: {},
    theme: { card: {}, background: {} },
    create_text: '提交',
    update_text: '提交',
  },
  actions: [
    { key: 'create', enabled: true },
    { key: 'update', enabled: true },
    { key: 'delete', enabled: true },
    { key: 'import', enabled: true },
    { key: 'export', enabled: true },
  ],
};
