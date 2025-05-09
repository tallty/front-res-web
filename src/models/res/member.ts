import { VModel, VObject } from '@/lib/vails';
import { ResMember } from '../../types/model';

export class ResMemberModel extends VModel<ResMember> {
  // stateConfig = this.computedAttr('stateConfig', () => {
  //  return ResMembershipModel.stateMapping()[this.reactiveRecord.state];
  // });

  // static stateMapping(): VObject {
  //   return {
  //     pending: { label: '待提交', color: '#FBBF24' },
  //   };
  // }
  departmentNames = this.computedAttr('departmentNames', () => {
    return this.reactiveRecord.department_names?.join('、');
  });

  orgNames = this.computedAttr('orgNames', () => {
    return this.reactiveRecord.org_names?.join('、');
  });

  dutyNames = this.computedAttr('dutyNames', () => {
    return this.reactiveRecord.duty_names
      ?.map((name: string) => name.replace(/【.*】/, ''))
      .join('、');
  });
}
