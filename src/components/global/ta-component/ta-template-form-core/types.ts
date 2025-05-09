import type { IFile } from '@/components/global/ta-component/file/servers/types';
import type {
	TaIndexImportHeader,
	TaIndexViewAction
} from '@/components/global/ta-component/TaIndexView/ta-index-view-core/types';
import { TaIndexSearcherOptionInterface } from '@/components/global/ta-component/TaIndexView/ta-index-view-core/types';
import { VObject } from '../../../../lib/vails/model/index';

export interface TaTemplateFormItem {
	type?: TaTemplateFormComponentType | TaTemplateFormLayoutType;
	index_attributes?: TaTemplateFormIndexAttribute[];
	column_attributes?: TaTemplateFormColumnAttribute[];
	name?: string;
	sub_name?: string;
	key?: string;
	model_key?: string | string[];
	model_key_prefix?: string;
	model_key_configuration?: TaTemplateFormModelKeyConfiguration[];
	model?: {
		summary?: boolean;
		attr_type?:
			| 'string'
			| 'number'
			| 'json'
			| 'array'
			| 'boolean'
			| 'object'
			| 'datetime'
			| 'date';
		default_value?: any;
		create_default_value?: VObject;
		update_default_value?: VObject;
	};
	rules?: TaTemplateFormRule[];
	options?: TaTemplateFormOptions;
	conditions?: TaTemplateFormCondition[];
	fields?: TaTemplateFormItem[];
	actions?: TaIndexViewAction[];
	icon?: string;
}

export interface TaTemplateFormModelKeyConfiguration {
	// 组件定义显示的 label
	label: string;
	// 显示在数据树上的 label
	custom_label?: string;
	// 输出值使用的 key
	model_key: string;
	// 组件内使用的 key
	key: string;
}

export type FormItemSize = 'small' | 'regular' | 'large';

export type RangePickerType = 'date' | 'time';

export interface TaTemplateFormOptions {
	label?: TaTemplateFormLabelConfig;
	multiple?: boolean;
	width?: number | string;
	height?: number | string;
	border?: boolean;
	size?: FormItemSize;
	layout?: 'horizontal' | 'vertical' | 'inline';
	listNormalCard?: boolean;
	span?: number;
	// 是否必填
	required?: boolean;

	select?: TaTemplateFormSelect[];
	treeData?: TaTemplateFormItemTreeData[];
	custom_class?: string;
	placeholder?: string;
	disabled?: boolean;
	icon?: string;
	unit?: string;
	accessibility?: 'read_and_write' | 'readonly' | 'hidden' | 'writeable';
	table_items?: TaTemplateFormTableItem[];
	path?: string;
	ransack?: VObject | string;
	attrs?: string[];
	import_export_headers?: TaIndexImportHeader[];
	max?: number;
	min?: number;
	prefix?: string;
	thousand_separator?: boolean;
	amount_to_chinese?: boolean; //大写数字
	defaultValue?: any;
	viewHidden?: boolean;
	formHidden?: boolean;
	formDisabled?: boolean;
	dynamic_component?: string;
	ditto?: string; // 占位组件标识，用于代码搜索
	slot?: string;
	edit_directly?: boolean;
	props?: {
		model_key?: {
			type: 'array' | 'string';
			length: number;
		};
	};
	disabled_actions?: {
		destroy?: boolean;
		create?: boolean;
		update?: boolean;
	};
	precision?: number;
	meta?: VObject;
	cardLabel?: (item: TaTemplateFormItem, index: number) => string;
	display?: string;
	display_configurable_form?: TaTemplateFormItem;
	mobile_style?: {
		background_image: IFile;
		margin: string;
	};
	create_text?: string;
	update_text?: string;
	start_time?: string;
	end_time?: string;
	theme?: TaTemplateFormTheme | string;
	anchor?: boolean;
	// content fields
	use_normal_text?: boolean;
	hide_video?: boolean;
	hide_image?: boolean;
	hide_text?: boolean;
	hide_audio?: boolean;
	hide_file?: boolean;
	// ta nested attributes polymorphic field
	nested_attributes_polymorphic_tabs?: {
		key?: string;
		tagColor?: string;
		table_items?: TaTemplateFormTableItem[];
		label?: string;
		path?: string;
		ransack?: VObject | string;
		polymorphicType?: string;
	}[];
	// 图片、视频
	aspect_ratio?: number;
	// 备选文件
	preset_files?: IFile[];
	// 计算模块
	computedFunc?: string;
	// input
	maxLength?: number;
	// textarea
	minLength?: number;
	// fileSize
	fileSize?: number;
	// layout
	collapse?: boolean;
	// ta input 记录历史
	cached?: boolean;
	// api，是否使用树显示
	use_tree?: boolean;
	// api，是否禁用树的父级节点
	disable_tree_parent?: boolean;
	// api，是否显示通讯录
	use_book?: boolean;
	// api，创建时 form
	form?: string;

	paths?: (null | string)[];
	// label 旁 i 标志的悬浮信息
	info?: string;
	// 列表搜索框
	searcher?: TaIndexSearcherOptionInterface[];
	// 是否容器化
	container?: boolean;

	// 是否有框线
	layout_border?: boolean;

	// 是否显示统计数字
	collapse_stats?: boolean;
	// 是否默认展开
	collapse_default_open?: boolean;
	// form setting action 配置
	data_form_options?: TaTemplateFormSelect[];
	// 回调
	callback?: () => void;
	// 文件接收的类型
	accept?: string;
	// 多态选择器的多态关键字
	polymorphic_key?: string;
	// region_id 组件的供选择深度
	depth?: number;
	// region允许点击选中任意级数
	region_change_on_select?: boolean;
	// evalution 组件
	evaluate_icon?: string;
	// evalution 组件
	step?: string;
	// evalution 组件
	length?: number;
	// evalution 组件
	color?: string;
	// content 组件
	image_fileSize?: number;
	// content 组件
	video_fileSize?: number;
	// content 组件
	audio_fileSize?: number;
	// content 组件
	file_fileSize?: number;

	// 上传最大文件限制
	file_max_count?: number;

	// 是否发送
	sendCodeBth?: boolean;

	// 是否显示序号
	showSerial?: boolean;
	// 序号类型
	serialType?: 'number' | 'letter';
	// 是否跳过单个item的No
	skipNo?: boolean;
	// 多选时的最大选择数量
	select_max?: number;
	// 隐藏时是否仍然进行验证
	validateWhenHidden?: boolean;
}

export interface TaTemplateFormTheme {
	radius?: boolean;
	background?: {
		image?: IFile[];
		color?: string;
	};
	form?: {
		background?: string;
	};
	card?: {
		image?: IFile[];
		title?: string;
		content?: string;
		files?: IFile[];
	};
}

export interface TaTemplateFormAccessibility {
	key: string;
	accessibility: string;
}

export interface TaTemplateFormStepsStep {
	title: string;
	type: 'form' | 'dynamicComponent' | 'slot';
	key?: string;
	dynamicComponent?: any;
	// type === dynamicComponent 时， 作为 v-bind 的 key 使用,
	// type === form 时，作为 表单嵌套字段使用
	bindKey?: string;
	form?: TaTemplateFormItem | string;
	// 表单显示模式
	mode?: 'edit' | 'show';
	modelKeyPrefix?: string; // form 时，功能与 bindKey 重复，NOTE: 已废弃
}

export interface TaTemplateFormLabelConfig {
	width?: number | string;
	emWidth?: number;
	height?: number | string;
	align?: 'left' | 'center' | 'right';
	font_size?: number;
	hidden?: boolean;
	padding_top?: number | string;
	padding_right?: number | string;
	padding_bottom?: number | string;
	padding_left?: number | string;
	background_color?: string;
}

export interface TaTemplateFormCondition {
	name?: string;
	model_key: string;
	val: string;
	opt?: string;
	type?: 'complex' | 'simple';
	complex_condition?: TaTemplateFormComplexCondition;
	fields: TaTemplateFormItem[];
}

export interface TaTemplateFormComplexCondition {
	name?: string;
	groups: TaTemplateFormComplexConditionGroup[];
}

export interface TaTemplateFormComplexConditionDescItem {
	name: string;
	optZh: string;
	modelValue: { rule: { val: any } };
	template: TaTemplateFormItem;
}

export interface TaTemplateFormComplexConditionGroup {
	_id?: string | number;
	name?: string;
	items: TaTemplateFormComplexConditionItem[];
}

export interface TaTemplateFormComplexConditionItem {
	_id?: string | number;
	name?: string;
	rule?: TaTemplateFormComplexConditionRule;
	desc?: TaTemplateFormComplexConditionDescItem;
	source_type?: string;
	user_mode?: string;
	user_rule?: VObject;
}

export interface TaTemplateFormComplexConditionRule {
	type:
		| 'Com::Attr::ConditionRules::Boolean'
		| 'Com::Attr::ConditionRules::Number'
		| 'Com::Attr::ConditionRules::String'
		| 'Com::Attr::ConditionRules::SingleChoice'
		| 'Com::Attr::ConditionRules::MultiChoice';
	opt: string;
	key: string;
	key_name?: string;
	val: any;
}

export interface TaTemplateFormItemTreeData {
	_record?: any;
	key?: string | number;
	parent_id?: number;
	value: any;
	targetValue?: string;
	title: string;
	children?: TaTemplateFormItemTreeData[];
}

export interface TaTemplateFormTableItem {
	name: string;
	data_index: string;
	search: boolean;
	type: string;
}

export interface TaTemplateFormSelect {
	label: any;
	value?: any;
	group?: string;
	vertical?: boolean;
	meta?: VObject;
	_id?: string;
}

export interface TaTemplateFormRule {
	rule_type?: 'required' | 'type' | 'pattern';
	trigger?: string;
	enum?: string;
	len?: number;
	max?: number;
	message?: string;
	min?: number;
	pattern?: RegExp;
	required?: boolean;
	transform?: (value: any) => any; // function(value) => transformedValue:any
	type?:
		| 'string'
		| 'number'
		| 'boolean'
		| 'method'
		| 'regexp'
		| 'integer'
		| 'float'
		| 'array'
		| 'object'
		| 'enum'
		| 'date'
		| 'url'
		| 'hex'
		| 'email'
		| 'any';
	validator?: (rule: TaTemplateFormRule, value: any, callback: any) => void; // function(rule, value, callback)
	whitespace?: boolean;
}

export const TaTemplateFormLayoutTypeAry = [
	'layout',
	'list',
	'condition',
	'key_layout',
	'container_layout',
	'nested_attributes'
];
export type TaTemplateFormLayoutType =
	typeof TaTemplateFormLayoutTypeAry[number];

export const defaultThemeImageUrl =
	'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/public/%E6%A8%A1%E7%89%88%3A%E6%97%A0%E6%A8%A1%E7%89%88.png';
export const defaultThemeBackgroundColor = 'rgb(243, 244, 246)';

export type TaTemplateFormComponentType =
	| 'input'
	| 'input_phone_zh'
	| 'input_password'
	| 'input_bank_card_no'
	| 'input_email_no'
	| 'input_zh_id_no'
	| 'color'
	| 'number'
	| 'number_range'
	| 'slider'
	| 'password'
	| 'percent'
	| 'textarea'
	| 'date'
	| 'time'
	| 'datetime'
	| 'moment'
	| 'date_range'
	| 'time_range'
	| 'moment_range'
	| 'radio'
	| 'checkbox'
	| 'select'
	| 'switch'
	| 'string_array'
	| 'form_designer'
	| 'duty_group'
	| 'forms_template'
	| 'user'
	| 'single_user'
	| 'single_member'
	| 'tree'
	| 'file'
	| 'image_single'
	| 'image_single_new'
	| 'image_picker'
	| 'video_single'
	| 'video_single_new'
	| 'image'
	| 'api'
	| 'api_single'
	| 'api_store'
	| 'api_single_store'
	| 'fixed'
	| 'nested_attributes_polymorphic'
	| 'user_polymorphic'
	| 'res_permit_polymorphic'
	| 'user_type'
	| 'dynamic_component'
	| 'computed'
	| 'map'
	| 'json'
	| 'region'
	| 'region_id'
	| 'evaluate'
	| 'content'
	| 'rich_text'
	| 'nested_attributes';

export interface FormsTemplate {
	id: number;
	uuid: number;
	form: TaTemplateFormItem;
}

export interface TaTemplateFormIndexAttribute {
	key: string;
	data_index: string;
	name: string;
}

export type TaTemplateFormColumnAttribute = any & {
	_id?: string;
	render?: string;
	color?: string;
	index?: {
		on?: boolean;
	};
	width?: number;
	fixed?: string;
	colSpan?: number;
	filtered?: boolean;
	filterDropdownVisible?: boolean;
	filteredValue?: string[];
	filteredDetails?: { label: string; ransack: VObject }[];

	sorter?: boolean;

	export?: {
		on?: boolean;
		aggre?: {
			type?: string;
			$cond?: VObject;
		}[];
	};
	import?: {
		on?: boolean;
		aggre?: {
			type?: string;
			$cond?: VObject;
		}[];
	};
};
