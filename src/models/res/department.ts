import { VModel } from '@/lib/vails';
import { ResDepartment } from '../../types/model';

export class ResDepartmentModel extends VModel<ResDepartment> {
  // stateConfig = this.computedAttr('stateConfig', () => {
  //  return ResOrgModel.stateMapping()[this.reactiveRecord.state];
  // });

  // static stateMapping(): VObject {
  //   return {
  //     pending: { label: '待提交', color: '#FBBF24' },
  //   };
  // }
  children = [];
  childrenNames = this.computedAttr('childrenNames', () => {
    return this.reactiveRecord.children_names?.join('、');
  });

  userCount = this.computedAttr('userCount', () => {
    return this.reactiveRecord.user_names?.length;
  });

  userNames = this.computedAttr('userNames', () => {
    return this.reactiveRecord.user_names?.join('、');
  });

  pathNames = this.computedAttr('pathNames', () => {
    return this.reactiveRecord.path_names?.reverse();
  });
}
