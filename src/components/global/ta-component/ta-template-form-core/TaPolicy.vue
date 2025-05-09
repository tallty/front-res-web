<script lang="ts">
import {
  ref,
  defineComponent,
  toRefs,
  PropType,
  computed,
  inject,
  Ref,
  watch,
  onUnmounted,
} from 'vue';
import { VStore, VObject, VApi } from '@/lib/vails';
import {
  PolicyResourcesKey,
  PolicyResourceKey,
  policyAction,
  getPolicyActionUniqKey,
} from './usePolicy';
import { merge, cloneDeep } from 'lodash-es';

export const TaPolicyProps = {
  actionKey: { type: String, required: true },
  mode: {
    type: String as PropType<'resources' | 'resource'>,
    default: 'resources',
  },

  resource_id: { type: Number, default: null },
  context: { type: Object, default: () => ({}) },

  store: { type: Object as PropType<VStore<VObject>>, default: null },
  api: { type: Object as PropType<VApi<VObject>>, default: null },

  alwaysEnabled: { type: Boolean, default: false },
};

let seq = 0;

const TaPolicy = defineComponent({
  name: 'TaPolicy',
  components: {},
  props: TaPolicyProps,
  setup(props) {
    const uid = `${Date.now()}-${seq++}`;
    const api = computed(() => {
      return props.store?.api || props.store?.apiRef || props.api;
    });

    const path = computed(() => {
      if (props.mode === 'resources') {
        return api.value?.indexPath;
      } else {
        return api.value?.getMemberPath(resourceId.value);
      }
    });

    const resourcesActions = inject<(policyAction | null)[] | null>(PolicyResourcesKey, null);
    const resourceActions = inject<(policyAction | null)[] | null>(PolicyResourceKey, null);

    const actions = computed(() =>
      props.mode === 'resources' ? resourcesActions : resourceActions,
    );

    const resourceId = computed(
      () =>
        props.resource_id ||
        Number(props.mode === 'resource' ? props.store?.record?.value?.id : null) ||
        undefined,
    );

    const context = computed(() => merge({}, props.context, api.value?.formData || {}));

    const existsActionIndex = computed(() => {
      const index = actions.value?.findIndex(
        (action: policyAction | null) => {
          return action && action.uid === uid;
          // return (
          //   getPolicyActionUniqKey(action) ===
          //   getPolicyActionUniqKey({
          //     uid,
          //     key: props.actionKey!,
          //     path: path.value,
          //     resource_id: resourceId.value,
          //     context: context.value,
          //   })
          // );
        },

        // action.key === props.actionKey &&
        // action.path === path.value &&
        // (!action.resource_id ||
        //   action.resource_id === (props.resource_id || props.store?.record?.value?.id)) &&
        // (!action.context || action.context === context.value),
      );
      // console.log(index, 'index');
      return typeof index === 'number' ? index : -1;
    });

    const existsAction = computed(() => actions.value?.[existsActionIndex.value]);

    watch(
      [context, api, resourceId],
      () => {
        if (!actions.value) return;

        const newValue = {
          uid,
          key: props.actionKey!,
          path: path.value,
          resource_id: resourceId.value,
          context: context.value,
          enabled: false,
        };

        if (existsAction.value) {
          actions.value.splice(existsActionIndex.value, 1, {
            ...actions.value[existsActionIndex.value],
            ...newValue,
          });
        } else {
          actions.value.push(newValue);
        }
        // console.log(cloneDeep(actions.value), ' actions.value');
      },
      {
        deep: true,
        immediate: true,
      },
    );

    onUnmounted(() => {
      if (actions.value && existsActionIndex.value > 0) {
        // console.log('delete, unmoupnted', existsActionIndex.value);
        actions.value.splice(existsActionIndex.value, 1, null);
      }
    });

    // 默认开启
    const enabled = computed(() => {
      return typeof existsAction.value?.enabled === 'boolean' ? existsAction.value?.enabled : true;
    });

    return {
      ...toRefs(props),
      enabled,
      existsAction,
    };
  },
});
export default TaPolicy;
</script>

<template lang="pug">
//- h1 enabled {{ enabled }} {{ alwaysEnabled }}
template(v-if='alwaysEnabled || enabled')
  slot
template(v-else)
  slot(name='disabled')
</template>

<style lang="stylus" scoped></style>
