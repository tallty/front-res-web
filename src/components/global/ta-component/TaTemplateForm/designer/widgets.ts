import { TaTemplateFormItem } from '../../ta-template-form-core/types';

export const widgetsGroup = {
  基础控件: {
    输入控件: [
      {
        name: '单行输入',
        icon: 'FolderOutlined',
        type: 'input',
        rules: [],
        model: {
          attr_type: 'string',
        },
        options: {
          span: 24,
        },
      },

      {
        name: '多行输入',
        icon: 'FolderOutlined',
        type: 'textarea',
        rules: [],
        model: {
          attr_type: 'string',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '数字输入',
        icon: 'FolderOutlined',
        type: 'number',
        rules: [],
        model: {
          attr_type: 'number',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '数字范围',
        icon: 'FolderOutlined',
        type: 'number_range',
        rules: [],
        model: {
          attr_type: 'number_range',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '进度条',
        icon: 'FolderOutlined',
        type: 'slider',
        rules: [],
        model: {
          attr_type: 'number',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '百分比输入',
        icon: 'FolderOutlined',
        type: 'percent',
        rules: [],
        model: {
          attr_type: 'number',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '富文本',
        icon: 'FolderOutlined',
        type: 'rich_text',
        rules: [],
        model: {
          attr_type: 'string',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '标签',
        icon: 'FolderOutlined',
        type: 'label',
        rules: [],
        model: {
          attr_type: 'string',
        },
        options: {
          span: 24,
          label: {},
        },
      },
    ],
    高阶基础控件: [
      {
        name: '手机号输入(zh)',
        icon: 'FolderOutlined',
        type: 'input_phone_zh',
        rules: [],
        model: {
          attr_type: 'string',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '密码输入',
        icon: 'FolderOutlined',
        type: 'input_password',
        rules: [],
        model: {
          attr_type: 'string',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '银行卡号输入',
        icon: 'FolderOutlined',
        type: 'input_bank_card_no',
        rules: [],
        model: {
          attr_type: 'string',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '邮箱号输入',
        icon: 'FolderOutlined',
        type: 'input_email_no',
        rules: [],
        model: {
          attr_type: 'string',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '身份证号输入',
        icon: 'FolderOutlined',
        type: 'input_zh_id_no',
        rules: [],
        model: {
          attr_type: 'string',
        },
        options: {
          span: 24,
        },
      },
    ],
    时间控件: [
      {
        name: '日期',
        icon: 'FolderOutlined',
        type: 'date',
        rules: [],
        model: {
          attr_type: 'date',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '日期时间',
        icon: 'FolderOutlined',
        type: 'datetime',
        rules: [],
        model: {
          attr_type: 'date',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '时刻',
        icon: 'FolderOutlined',
        type: 'moment',
        rules: [],
        model: {
          attr_type: 'date',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '日期范围',
        icon: 'FolderOutlined',
        type: 'date_range_new',
        model_key_configuration: [
          {
            key: 'start_at',
            label: '开始时间',
          },
          {
            key: 'end_at',
            label: '结束时间',
          },
        ],
        rules: [],
        model: {
          attr_type: 'array',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '时间范围',
        icon: 'FolderOutlined',
        type: 'time_range_new',
        model_key_configuration: [
          {
            key: 'start_at',
            label: '开始时间',
          },
          {
            key: 'end_at',
            label: '结束时间',
          },
        ],
        rules: [],
        model: {
          attr_type: 'array',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '时刻范围',
        icon: 'FolderOutlined',
        type: 'moment_range_new',
        model_key_configuration: [
          {
            key: 'start_at',
            label: '开始时间',
          },
          {
            key: 'end_at',
            label: '结束时间',
          },
        ],
        rules: [],
        model: {
          attr_type: 'date',
        },
        options: {
          span: 24,
        },
      },
    ],
    选择控件: [
      {
        name: '单项选择',
        icon: 'FolderOutlined',
        type: 'radio',
        rules: [],
        model: {
          attr_type: 'string',
        },
        options: {
          select: [],
          multiple: false,
          span: 24,
        },
      },
      {
        name: '多项选择',
        icon: 'FolderOutlined',
        type: 'checkbox',
        rules: [],
        model: {
          attr_type: 'string',
        },
        options: {
          select: [],
          multiple: true,
          span: 24,
        },
      },
      {
        name: '下拉选择',
        icon: 'FolderOutlined',
        type: 'select',
        rules: [],
        model: {
          attr_type: 'string',
        },
        options: {
          select: [],
          multiple: true,
          span: 24,
        },
      },
    ],
    文件控件: [
      {
        name: '文件',
        icon: 'FolderOutlined',
        type: 'file',
        rules: [],
        model: {
          attr_type: 'array',
        },
        options: {
          span: 24,
          multiple: true,
        },
      },
      {
        name: '图片',
        icon: 'FolderOutlined',
        type: 'image',
        rules: [],
        model: {
          attr_type: 'array',
        },
        options: {
          span: 24,
          multiple: true,
        },
      },
      {
        name: '单张图片',
        icon: 'FolderOutlined',
        type: 'image_single',
        rules: [],
        model: {
          attr_type: 'array',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '单张图片(新)',
        icon: 'FolderOutlined',
        type: 'image_single_new',
        rules: [],
        model: {
          attr_type: 'array',
        },
        options: {
          span: 24,
          size: 'regular',
        },
      },
      {
        name: '图片选择',
        icon: 'FolderOutlined',
        type: 'image_picker',
        rules: [],
        model: {
          attr_type: 'array',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '单个视频',
        icon: 'FolderOutlined',
        type: 'video_single',
        rules: [],
        model: {
          attr_type: 'array',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '单个视频(新)',
        icon: 'FolderOutlined',
        type: 'video_single_new',
        rules: [],
        model: {
          attr_type: 'array',
        },
        options: {
          span: 24,
          size: 'regular',
        },
      },
    ],
    其他控件: [
      {
        name: '地图',
        icon: 'FolderOutlined',
        type: 'map',
        rules: [],
        model: {
          attr_type: 'object',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '地区',
        icon: 'FolderOutlined',
        type: 'region',
        rules: [],
        model: {
          attr_type: 'object',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '地区持久化',
        icon: 'FolderOutlined',
        type: 'region_id',
        rules: [],
        model: {
          attr_type: 'number',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '颜色输入',
        icon: 'FolderOutlined',
        type: 'color',
        rules: [],
        model: {
          attr_type: 'string',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '开关',
        icon: 'FolderOutlined',
        type: 'switch',
        rules: [],
        model: {
          attr_type: 'boolean',
        },
        options: {
          // select: [],
          multiple: false,
          span: 24,
        },
      },
      {
        name: '评价',
        icon: 'FolderOutlined',
        type: 'evaluate',
        rules: [],
        model: {
          attr_type: 'number',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '综合通讯录',
        icon: 'FolderOutlined',
        type: 'user_polymorphic',
        rules: [],
        model: {
          attr_type: 'array',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '综合通讯录（单）',
        icon: 'FolderOutlined',
        type: 'user_type',
        rules: [],
        model: {
          attr_type: 'object',
        },
        options: {
          span: 24,
        },
      },
    ],
  },
  高级控件: {
    高级控件: [
      {
        name: '内容编辑器',
        icon: 'FolderOutlined',
        type: 'content',
        rules: [],
        model: {
          attr_type: 'array',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '权限控制',
        icon: 'FolderOutlined',
        type: 'res_permit_polymorphic',
        rules: [],
        model: {
          attr_type: 'array',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '固定值',
        icon: 'FolderOutlined',
        type: 'fixed',
        rules: [],
        model: {
          attr_type: 'any',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '模板编辑器',
        icon: 'FolderOutlined',
        type: 'forms_template',
        rules: [],
        model: {
          attr_type: 'number',
        },
        options: {
          span: 24,
        },
      },
      {
        name: 'API ID数组',
        icon: 'FolderOutlined',
        type: 'api',
        rules: [],
        model: {
          attr_type: 'array',
        },
        options: {
          span: 24,
          multiple: true,
        },
      },
      {
        name: 'API ID',
        icon: 'FolderOutlined',
        type: 'api_single',
        rules: [],
        model: {
          attr_type: 'number',
        },
        options: {
          span: 24,
          multiple: undefined, // undefined 表示不能设置
        },
      },
      {
        name: 'API 多个 Store',
        icon: 'FolderOutlined',
        type: 'api_store',
        rules: [],
        model: {
          attr_type: 'array',
        },
        options: {
          span: 24,
          multiple: true,
        },
      },
      {
        name: 'API 单个 Store',
        icon: 'FolderOutlined',
        type: 'api_single_store',
        rules: [],
        model: {
          attr_type: 'object',
        },
        options: {
          span: 24,
          multiple: undefined, // undefined 表示不能设置
        },
      },
      {
        name: '层叠多态选择器',
        icon: 'FolderOutlined',
        type: 'nested_attributes_polymorphic',
        fields: [],
        rules: [],
        model: {
          attr_type: 'array',
        },
        options: {
          span: 24,
          disabled_actions: {},
          multiple: true,
        },
      },
      {
        name: '名片扫描',
        icon: 'FolderOutlined',
        type: 'scan_business_card',
        model_key_configuration: [
          {
            key: 'address',
            label: '地址',
          },
          {
            key: 'company',
            label: '公司',
          },
          {
            key: 'department',
            label: '部门',
          },
          {
            key: 'email',
            label: '邮箱',
          },
          {
            key: 'fax',
            label: '传真',
          },
          {
            key: 'QQ',
            label: 'QQ',
          },
          {
            key: 'telephone',
            label: '电话',
          },
          {
            key: 'name',
            label: '名字',
          },
          {
            key: 'other',
            label: '其他信息',
          },
          {
            key: 'title',
            label: '职称',
          },
          {
            key: 'url',
            label: '网址',
          },
          {
            key: 'work_tel',
            label: '工作电话',
          },
        ],
        rules: [],
        model: {
          attr_type: 'array',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '身份证扫描',
        icon: 'FolderOutlined',
        type: 'scan_id_card',
        model_key_configuration: [
          {
            key: 'name',
            label: '名字',
          },
          {
            key: 'address',
            label: '地址',
          },
          {
            key: 'issue_authority',
            label: '签发机关',
          },
          {
            key: 'validate_date',
            label: '有效期限',
          },
          {
            key: 'id_number',
            label: '身份证号',
          },
          {
            key: 'sex',
            label: '性别',
          },
          { key: 'birth', label: '出生日期' },
          { key: 'nationality', label: '民族' },
          { key: 'head_portrait', label: '头像' },
          { key: 'crop_image', label: '切变头像' },
          {
            key: 'is_gray',
            label: '是否为黑白复印件',
          },
          {
            key: 'id_number_image',
            label: '身份证号码图像',
          },
        ],
        rules: [],
        model: {
          attr_type: 'array',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '执照扫描',
        icon: 'FolderOutlined',
        type: 'scan_business_license',
        model_key_configuration: [
          {
            key: 'BizLicenseIsCopy',
            label: '是否是副本',
          },
          {
            key: 'BizLicenseIsElectronic',
            label: '是否是电子营业执照',
          },
          {
            key: 'BizLicenseSerialNumber',
            label: '证照编号',
          },
          {
            key: 'BizLicenseRegistrationCode',
            label: '注册号',
          },
          {
            key: 'BizLicenseRegCapital',
            label: '注册资本',
          },
          {
            key: 'BizLicenseCreditCode',
            label: '统一社会信用代码',
          },
          {
            key: 'BizLicenseCompanyName',
            label: '名称',
          },
          {
            key: 'BizLicenseOwnerName',
            label: '经营者',
          },
          {
            key: 'BizLicenseCompanyType',
            label: '类型',
          },
          {
            key: 'BizLicenseAddress',
            label: '经营场所',
          },
          {
            key: 'BizLicenseScope',
            label: '经营范围',
          },
          {
            key: 'BizLicenseStartTime',
            label: '注册日期',
          },
          {
            key: 'BizLicenseOperatingPeriod',
            label: '营业期限',
          },
          {
            key: 'BizLicenseComposingForm',
            label: '组成形式',
          },
          {
            key: 'BizLicensePaidInCapital',
            label: '实收资本',
          },
          {
            key: 'BizLicenseRegistrationDate',
            label: '登记日期',
          },
        ],
        rules: [],
        model: {
          attr_type: 'array',
        },
        options: {
          span: 24,
        },
      },
    ],
    布局控件: [
      {
        name: '普通布局',
        icon: 'FolderOutlined',
        type: 'layout',
        fields: [],
        options: {
          span: 24,
          label: {},
        },
      },
      {
        name: '容器布局',
        icon: 'FolderOutlined',
        type: 'container_layout',
        fields: [],
        options: {
          span: 24,
          label: {},
        },
      },
      {
        name: '列表布局',
        icon: 'FolderOutlined',
        type: 'list',
        fields: [],
        rules: [],
        model: {
          attr_type: 'array',
        },
        options: {
          span: 24,
          disabled_actions: {},
        },
      },
      {
        name: '层叠数据',
        icon: 'FolderOutlined',
        type: 'nested_attributes',
        fields: [],
        rules: [],
        model: {
          attr_type: 'array',
        },
        options: {
          span: 24,
          disabled_actions: {},
        },
      },

      {
        name: '条件块',
        icon: 'FolderOutlined',
        type: 'condition',
        conditions: [],
        options: {
          span: 24,
        },
      },
      {
        name: '嵌套对象',
        icon: 'FolderOutlined',
        type: 'key_layout',
        options: {
          span: 24,
        },
      },
    ],
  },
  程序控件: {
    程序控件: [
      {
        name: '动态组件',
        icon: 'FolderOutlined',
        type: 'dynamic_component',
        rules: [],
        model: {},
        options: {
          span: 24,
        },
      },
      {
        name: 'JSON',
        icon: 'FolderOutlined',
        type: 'json',
        rules: [],
        model: {
          attr_type: 'object',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '动态表单',
        icon: 'FolderOutlined',
        type: 'form_designer',
        rules: [],
        model: {
          attr_type: 'object',
        },
        options: {
          span: 24,
        },
      },
      {
        name: 'form setting',
        icon: 'FolderOutlined',
        type: 'form_setting_designer',
        rules: [],
        model: {
          attr_type: 'object',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '字符串数组',
        icon: 'FolderOutlined',
        type: 'string_array',
        rules: [],
        model: {
          attr_type: 'array',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '树选择器',
        icon: 'FolderOutlined',
        type: 'tree',
        rules: [],
        model: {
          attr_type: 'string',
        },
        options: {
          span: 24,
        },
      },
      {
        name: '计算模块',
        icon: 'FolderOutlined',
        type: 'computed',
        rules: [],
        model: {},
        options: {
          span: 24,
        },
      },
    ],
  },
};

const widgets: TaTemplateFormItem[] = Object.values(widgetsGroup)
  .map(group => Object.values(group))
  .reduce((a, b) => a.concat(b), [])
  .reduce((a, b) => a.concat(b), []);

// const widgets: TaTemplateFormItem[] = [
//   {
//     name: '角色组',
// icon: 'FolderOutlined',
//     type: 'duty_group',
//     rules: [],
//     model: {
//       attr_type: 'number',
//     },
//     options: {
//       select: [],
//       multiple: true,
//       span: 24,
//     },
//   },

// {
//   name: '用户数组',
// icon: 'FolderOutlined',
//   type: 'user',
//   rules: [],
//   model: {
//     attr_type: 'array',
//   },
//   options: {
//     span: 24,
//     multiple: true,
//   },
// },
// {
//   name: '单个用户',
// icon: 'FolderOutlined',
//   type: 'single_user',
//   rules: [],
//   model: {
//     attr_type: 'number',
//   },
//   options: {
//     span: 24,
//   },
// },
// {
//   name: '单个成员',
// icon: 'FolderOutlined',
//   type: 'single_member',
//   rules: [],
//   model: {
//     attr_type: 'number',
//   },
//   options: {
//     span: 24,
//   },
// },
// ];
export default widgets;
