<script lang="ts">
import { ref, defineComponent, toRefs } from 'vue';
import { merge } from 'lodash';
import draggable from 'vuedraggable';

import { VObject } from '@/lib/vails/model';
// ./sortableEvents
const manageAndEmit = ['Start', 'Add', 'Remove', 'Update', 'End'];
const emit = ['Choose', 'Unchoose', 'Sort', 'Filter', 'Clone'];
const manage = ['Move'];

const eventHandlerNames = [manage, manageAndEmit, emit]
  .flatMap(events => events)
  .map(evt => `on${evt}`);

function isReadOnly(eventName: string) {
  return eventHandlerNames.indexOf(eventName) !== -1;
}

// ../util/string

const regex = /-(\w)/g;
const camelize = (str: string) => str.replace(regex, (_, c) => c.toUpperCase());

// ../util/tags

function isHtmlAttribute(value: string) {
  return (
    ['id', 'class', 'role', 'style'].includes(value) ||
    value.startsWith('data-') ||
    value.startsWith('aria-') ||
    value.startsWith('on')
  );
}

//
function getValidSortableEntries(value: VObject) {
  return Object.entries(value)
    .filter(([key, _]) => !isHtmlAttribute(key))
    .map(([key, value]) => [camelize(key), value])
    .filter(([key, _]) => !isReadOnly(key));
}

// 修复 vue.draggable.next 的 _sortable 使用在 mounted 之前的初始化 bug 版本
const TaDraggable = defineComponent(
  merge(draggable, {
    name: 'TaDraggable',
    watch: {
      $attrs: {
        handler(newOptionValue: VObject) {
          const { _sortable } = this as any;
          if (!_sortable) return;
          getValidSortableEntries(newOptionValue).forEach(([key, value]) => {
            _sortable.option(key, value);
          });
        },
        deep: true,
      },
    },
  }),
);
export default TaDraggable;
</script>
