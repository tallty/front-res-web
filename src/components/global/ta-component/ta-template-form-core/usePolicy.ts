import { VObject } from '@/lib/vails/model/index';
import { computed } from '@vue/reactivity';
import { ref } from '@vue/runtime-core';
import { isEqual } from 'lodash-es';
import { onMounted, provide, reactive, watch } from 'vue';
import { FormsResourceInfos } from './apis/forms/resource_infos';

export const PolicyResourcesKey = 'POLICY_RESOURCES_KEY';
export const PolicyResourceKey = 'POLICY_RESOURCE_KEY';

export interface policyAction {
  uid: string;
  key: string;
  path: string;
  resource_id?: number;
  context?: VObject;
  enabled?: boolean;
}

const groupBy = (array: any[], func: any): VObject => {
  return array.map(typeof func === 'function' ? func : val => val[func]).reduce(
    (group: VObject, val: any, index: number) => ({
      ...group,
      [val]: (group[val] || []).concat(array[index]),
    }),
    {} as VObject,
  );
};

const except = (obj: VObject, exceptKeys: string | string[]) => {
  obj = obj || {};
  if ('string' == typeof exceptKeys) {
    exceptKeys = exceptKeys.split(/ +/);
  }
  const keys = Object.keys(obj);
  return keys.reduce((ret: VObject, key: string) => {
    if (null == obj[key]) {
      return ret;
    }
    if (exceptKeys.includes(key)) {
      return ret;
    }
    ret[key] = obj[key];
    return ret;
  }, {});
};

export const getPolicyActionUniqKey = (action: policyAction) => {
  return `${action.key}-${action.path}-${action.resource_id}-${action.context}`;
};

const usePolicy = () => {
  const resourcesActions = reactive<(policyAction | null)[]>([]);
  provide(PolicyResourcesKey, resourcesActions);

  const resourceActions = reactive<(policyAction | null)[]>([]);
  provide(PolicyResourceKey, resourceActions);

  const reset = () => {
    resourcesActions.splice(0, resourcesActions.length);
    resourceActions.splice(0, resourceActions.length);
  };

  /*
    将没有 context 的归一类于 $all 下，其余的各分一类 在自己的 key 下
  */
  const groupActions = (out: Record<string, policyAction[]>, action: policyAction | null) => {
    if (!action) return out;
    if (typeof action.context === 'object' && Object.keys(action.context).length > 0) {
      if (!out[getPolicyActionUniqKey(action)]) out[getPolicyActionUniqKey(action)] = [];
      out[getPolicyActionUniqKey(action)].push(action);
    } else {
      if (!out.$all) out.$all = [];
      out.$all.push(action);
    }
    return out;
  };

  const resourcesActionsKey2ActionsGrouped = computed(() => {
    return resourcesActions.reduce(groupActions, {} as Record<string, policyAction[]>);
  });

  const resourceActionsKey2ActionsGrouped = computed(() => {
    return resourceActions.reduce(groupActions, {} as Record<string, policyAction[]>);
  });

  const getRemotePolicy = (mode: 'resource' | 'resources', actionsGrouped: policyAction[]) => {
    const routeAction = mode === 'resource' ? 'member_enable_actions' : 'enable_actions';
    const actionsRef = mode === 'resource' ? resourceActions : resourcesActions;
    const key2Enabled: Record<string, boolean> = {};

    const path2ActionGrouped = groupBy(actionsGrouped, 'path'); // 当 resource_id 不一样， path 也会不一样

    Promise.all(
      Object.keys(path2ActionGrouped).map(path => {
        const actions = path2ActionGrouped[path];
        const action = actions[0];
        return new FormsResourceInfos()
          .sendCollectionAction(routeAction, {
            data: {
              resource_info: {
                path: path,
                resource_id: action.resource_id,
                context: action.context,
              },
            },
          })
          .then(({ data }) => {
            actions.forEach((action: policyAction) => {
              let enabled = data.actions.includes(action.key);

              // delete 与 destroy 特殊处理, 后端是 destroy，前端是 delete
              if (action.key === 'delete' && !enabled) {
                enabled = data.actions.includes('destroy');
              }

              key2Enabled[getPolicyActionUniqKey(action)] = enabled;
            });
          });
      }),
    )
      .then(() => {
        // console.log(key2Enabled, 'key2Enabled');

        actionsRef.splice(
          0,
          actionsRef.length,
          ...actionsRef.map(action =>
            action
              ? {
                  ...action,
                  enabled:
                    typeof key2Enabled[getPolicyActionUniqKey(action)] === 'boolean'
                      ? key2Enabled[getPolicyActionUniqKey(action)]
                      : action.enabled,
                }
              : null,
          ),
        );
      })
      .then(() => {});
  };
  const checkPolicyFromRemote = () => {
    if (locked.value) return;

    Object.values(resourcesActionsKey2ActionsGrouped.value).forEach(actions => {
      getRemotePolicy('resources', actions);
    });

    Object.values(resourceActionsKey2ActionsGrouped.value).forEach(actions => {
      getRemotePolicy('resource', actions);
    });
  };

  const locked = ref(true);

  onMounted(() => {
    locked.value = false;
    checkPolicyFromRemote();
  });

  const resourcesActionsExceptEnable = computed(() =>
    resourcesActions.map(action => action && except(action, 'enabled')),
  );
  const resourceActionsExceptEnable = computed(() =>
    resourceActions.map(action => action && except(action, 'enabled')),
  );

  watch(
    [resourcesActionsExceptEnable, resourceActionsExceptEnable],
    (newValue, oldValue) => {
      if (!isEqual(newValue, oldValue)) {
        checkPolicyFromRemote();
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );

  return {
    checkPolicyFromRemote,
    reset,
  };
};

export default usePolicy;
