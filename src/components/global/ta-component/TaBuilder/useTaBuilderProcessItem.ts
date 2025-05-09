import { TaBuilderComponent } from './types';

const useTaBuilderProcessItem = () => {
  const generateTreeData = (items: TaBuilderComponent[], rootCell?: TaBuilderComponent) => {
    if (!items) return [];
    // 按 parent_key 分组
    const grouped: Record<string, TaBuilderComponent[]> = { $root: [] };
    items.forEach(item => {
      if (item.parent_key) {
        if (!grouped[item.parent_key]) grouped[item.parent_key] = [];
        grouped[item.parent_key].push(item);
      } else {
        grouped.$root.push(item);
      }
    });
    // 组成树
    const result: TaBuilderComponent[] = [];
    const processChildren = (item: TaBuilderComponent) => {
      item.children = sortByZIndex(grouped[item.key]?.map(processChildren) || []);
      //   .sort((a: TaBuilderComponent, b: TaBuilderComponent) =>
      //   (a.index || 0) > (b.index || 0) ? -1 : 1,
      // );
      return item;
    };
    grouped[rootCell?.parent_key || '$root']?.forEach(item => {
      result.push(processChildren(item));
    });
    return result;
  };

  const generateKey = () => `k${String(Math.random()).substr(2)}${Date.now()}`;

  const groupBy = (ary: any[], key: string) => {
    const result: Record<string, any> = {};
    ary.forEach(item => {
      if (!result[item[key]]) result[item[key]] = [];
      result[item[key]].push(item);
    });
    return result;
  };

  const sortByZIndex = (ary: TaBuilderComponent[]) => {
    return ary.sort((a, b) => (a.cssc.zIndex || 0) - (b.cssc.zIndex || 0));
  };

  const deleteChildren = (ary: TaBuilderComponent[]) => {
    return ary.map(item => (item.children = undefined));
  };

  const processTree = (
    tree: TaBuilderComponent,
    process: (item: TaBuilderComponent, index?: number) => void,
  ) => {
    process(tree);
    tree.children?.forEach((child: TaBuilderComponent) => processTree(child, process));
  };

  return {
    generateTreeData,
    generateKey,
    groupBy,
    sortByZIndex,
    deleteChildren,
    processTree,
  };
};

export default useTaBuilderProcessItem;
