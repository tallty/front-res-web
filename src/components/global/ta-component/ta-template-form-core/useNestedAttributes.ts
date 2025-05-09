import { VObject } from '../../../../lib/vails/model/index';
import { WritableComputedRef, Ref } from 'vue';

const useNestedAttributes = () => {
  const appendNestedAttributes = (
    payload: VObject,
    valueRef: Ref<VObject[]> | WritableComputedRef<VObject[]>,
    primaryKey: string | string[] = 'id',
  ) => {
    if (!valueRef.value) {
      valueRef.value = [] as any;
    }

    const primaryKeys: string[] = Array.isArray(primaryKey) ? primaryKey : [primaryKey];

    // if (payload._id || primaryKeys.some(primaryKey => payload[primaryKey])) {
    //   const existsIndex = valueRef.value.findIndex(
    //     (item: VObject) =>
    //       (item._id && item._id === payload._id) ||
    //       primaryKeys
    //         .map(
    //           (primaryKey: string) => item[primaryKey] && item[primaryKey] === payload[primaryKey],
    //         )
    //         .reduce((a, b) => a && b, true),
    //   );
    //   if (existsIndex > -1) {
    //     valueRef.value.splice(existsIndex, 1, payload);
    //     valueRef.value = valueRef.value.filter(
    //       // 没有 id 且 _destroy 为 true，是新建后又删除的数据
    //       (item: VObject) => !(!item.id && item._destroy),
    //     );
    //     return;
    //   }
    // }
    valueRef.value.unshift(payload);

    // 过滤 对象重复 的数据

    valueRef.value = valueRef.value.filter((item: VObject, index: number) => {
      if (payload._id || primaryKeys.some(primaryKey => payload[primaryKey])) {
        // 找到 primary_key 或 _id 相同的对象
        const primaryKeyTheSameFn = (i: VObject) =>
          (i._id && i._id === item._id) ||
          primaryKeys
            .map((primaryKey: string) => i[primaryKey] && i[primaryKey] === item[primaryKey])
            .reduce((a, b) => a && b, true);

        const itemsPrimaryKeyTheSame = valueRef.value.filter(primaryKeyTheSameFn);

        let isCreateAndDelete = false;

        for (let i = 0; i < itemsPrimaryKeyTheSame.length; i++) {
          for (let j = i + 1; j < itemsPrimaryKeyTheSame.length; j++) {
            if (
              itemsPrimaryKeyTheSame[i]._destroy !== itemsPrimaryKeyTheSame[j]._destroy ||
              itemsPrimaryKeyTheSame[i].id !== itemsPrimaryKeyTheSame[j].id
            ) {
              isCreateAndDelete = true;
            }
          }
        }

        if (isCreateAndDelete) {
          return false;
        }

        return valueRef.value.findIndex(primaryKeyTheSameFn) === index;
      }
      return true;
    }) as any;
  };

  return { appendNestedAttributes };
};

export default useNestedAttributes;
