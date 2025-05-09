import { VObject } from "@/lib/vails";

export const deepFilter = (list: VObject[], keyword: string): any => {
  const newList: VObject[] = [];
  list.forEach((item: VObject) => {
    if (item.children && item.children.length) {
      const children = deepFilter(item.children, keyword);
      if (children && children.length ) {
        newList.push({ ...item, children })
      } else if(item.title.includes(keyword)){
        newList.push({ ...item, children: [] })
      }
    } else if (item.title.includes(keyword)) {
      newList.push(item)
    }
  });
  return newList;
};