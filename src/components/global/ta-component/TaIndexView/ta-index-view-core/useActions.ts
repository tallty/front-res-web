import { TaIndexViewAction, TaIndexViewTableOldActionsInterface } from './types';
import { ComputedRef, computed, Ref } from 'vue';
import { VObject } from '@/lib/vails/model';
import { TaTemplateFormItem } from '../../ta-template-form-core/types';

const useActions = (
  config: ComputedRef<TaIndexViewTableOldActionsInterface | TaIndexViewAction[]>,
  defaultCallbackMap: ComputedRef<Record<string, (arg: any) => void>>,
  localTemplate?: Ref<TaTemplateFormItem>,
) => {
  const defaultActionsKeyToItemMap = computed<Record<string, TaIndexViewAction>>(() => ({
    create: {
      label: '创建',
      key: 'create',
      icon: 'PlusCircleOutlined',
      enabled: true,
      action_type: 'collection',
      callback: defaultCallbackMap.value.create,
    },
    update: {
      label: '编辑',
      key: 'update',
      icon: 'EditOutlined',
      action_type: 'member',
      enabled: true,
      callback: defaultCallbackMap.value.update,
    },
    delete: {
      label: '删除',
      key: 'delete',
      icon: 'DeleteOutlined',
      action_type: 'member',
      confirm: true,
      enabled: true,
      callback: defaultCallbackMap.value.delete,
    },
    batch_delete: {
      label: '批量删除',
      icon: 'DeleteOutlined',
      key: 'batch_delete',
      action_type: 'selectable',
      enabled: true,
      confirm: true,
      callback: defaultCallbackMap.value.batch_delete,
    },
    import: {
      label: '导入',
      key: 'import',
      icon: 'UploadOutlined',
      enabled: true,
      action_type: 'collection',
    },
    export: {
      label: '导出',
      key: 'export',
      icon: 'ExportOutlined',
      enabled: true,
      action_type: 'collection',
    },
    export_file: {
      label: '导出文件',
      key: 'export_file',
      icon: 'ExportOutlined',
      enabled: true,
      action_type: 'collection',
    },
  }));

  const activeActions = computed<TaIndexViewAction[]>(() => {
    if (Array.isArray(config.value) || !config.value) {
      // 新版本，actions 数组，注入默认值
      return deDupActions([...(localTemplate?.value?.actions || []), ...(config.value || [])])
        .filter(i => i.enabled)
        .map(item => ({
          ...(defaultActionsKeyToItemMap.value[item.key] || []),
          ...item,
        }));
    } else {
      // 旧版本，对象 TaIndexViewTableOldActionsInterface
      return Object.keys(config.value)
        .filter((key: string) => (config.value as VObject)[key])
        .map((key: string) =>
          typeof (config.value as VObject)[key] === 'object'
            ? { ...defaultActionsKeyToItemMap.value[key], options: (config.value as VObject)[key] }
            : defaultActionsKeyToItemMap.value[key],
        )
        .filter(i => i && i.enabled);
    }
  });

  const deDupActions = (ary: TaIndexViewAction[]) => {
    const map: Record<string, TaIndexViewAction> = {};
    // 后覆盖前，代码覆盖远程，代码优先级更高
    ary.forEach(action => (map[action.key] = action));
    return Object.values(map);
  };

  const activeActionsKeyToItemMap = computed(() =>
    activeActions.value.reduce((out, item) => {
      out[item.key] = item;
      return out;
    }, {} as VObject),
  );

  const activeActionsMemberActions = computed(() =>
    activeActions.value.filter(item => item.action_type === 'member'),
  );

  const activeActionsHeaderActions = computed(() =>
    activeActions.value.filter(
      item => ['selectable', 'collection'].includes(item.action_type || '') && !item.collapsed,
    ),
  );

  const activeActionsHeaderCollapsedActions = computed(() =>
    activeActions.value.filter(
      item => ['selectable', 'collection'].includes(item.action_type || '') && item.collapsed,
    ),
  );

  return {
    activeActions,
    activeActionsKeyToItemMap,
    activeActionsMemberActions,
    activeActionsHeaderActions,
    activeActionsHeaderCollapsedActions,
  };
};

export default useActions;
