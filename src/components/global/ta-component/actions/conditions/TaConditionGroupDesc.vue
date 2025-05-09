<script lang="ts">
import { defineComponent, toRefs, PropType, computed } from 'vue';
import { TaCondition } from '../types';

const TaConditionGroupDesc = defineComponent({
  name: 'TaConditionGroupDesc',
  components: {},
  props: {
    condition: { type: Object as PropType<TaCondition>, required: true },
    root: { type: Boolean, default: false },
  },
  setup(props) {
    const shellClass = computed(() => ({
      'p-2': !props.root,
      'bg-gray-100': props.condition.actions_relation_type !== 'or' && !props.root,
      'bg-white': !(props.condition.actions_relation_type !== 'or' && !props.root),
    }));

    return {
      ...toRefs(props),
      shellClass,
    };
  },
});

export default TaConditionGroupDesc;
// {
//   "actions": [
//     {
//       "condition": {
//         "actions": [
//           {
//             "pipeline": {
//               "form_conf_seq": "489c34f39992961624e6",
//               "type": "data_form"
//             },
//             "condition": {
//               "desc": {
//                 "name": "是否需要专家审核",
//                 "optZh": "含有",
//                 "template": {
//                   "key": "key",
//                   "type": "layout",
//                   "fields": [
//                     {
//                       "key": "ditto_1688744197317_2",
//                       "name": "值",
//                       "type": "select",
//                       "model": {
//                         "attr_type": "array"
//                       },
//                       "rules": [],
//                       "fields": [],
//                       "actions": [],
//                       "options": {
//                         "span": 24,
//                         "ditto": "ditto_single",
//                         "select": [
//                           {
//                             "label": "是",
//                             "value": "是"
//                           },
//                           {
//                             "label": "否",
//                             "value": "否"
//                           }
//                         ],
//                         "disabled": false,
//                         "multiple": true,
//                         "table_items": [],
//                         "formDisabled": false,
//                         "accessibility": "writeable",
//                         "dynamic_component": "",
//                         "import_export_headers": [
//                           {
//                             "_id": "1675178395625_3"
//                           }
//                         ],
//                         "display_configurable_form": {}
//                       },
//                       "model_key": "val",
//                       "conditions": [],
//                       "index_attributes": [],
//                       "model_key_prefix": "rule",
//                       "column_attributes": []
//                     }
//                   ]
//                 },
//                 "modelValue": {
//                   "rule": {
//                     "val": [
//                       "是"
//                     ]
//                   }
//                 }
//               },
//               "rule": {
//                 "key": "requrie_expert",
//                 "opt": "include",
//                 "val": [
//                   "是"
//                 ],
//                 "key_name": "是否需要专家审核",
//                 "type": "Com::Attr::ConditionRules::SingleChoice"
//               },
//               "type": "old"
//             }
//           }
//         ],
//         "actions_relation_type": "or",
//         "type": "group"
//       }
//     }
//   ],
//   "actions_relation_type": "and"
// }123
</script>

<template lang="pug">
.ta-condition-group-desc(:class='shellClass')
  div(
    v-for='(action, index) in condition.actions',
  )
    .flex.items-center.py-1(v-if='index !== 0 && condition.actions_relation_type === "or"')
      .flex-grow.w-0.border-b(class='h-1/2')
      .text-gray-800.bg-white.mx-auto.px-1 或
      .flex-grow.w-0.border-b(class='h-1/2')
    TaConditionOldDesc(v-if='action.condition?.desc', :desc='action.condition.desc')
    TaConditionGroupDesc(
      v-else-if='action.condition?.type === "group"',
      :condition='action.condition'
    )
</template>

<style lang="stylus" scoped></style>
