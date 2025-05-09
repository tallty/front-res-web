import { VModel, VObject } from '@/lib/vails';
import { ResUser } from '../../../res-core/types/model';

export class ResUserModel extends VModel<ResUser> {
  // stateConfig = this.computedAttr('stateConfig', () => {
  //  return ResUserModel.stateMapping()[this.reactiveRecord.state];
  // });

  // static stateMapping(): VObject {
  //   return {
  //     pending: { label: '待提交', color: '#FBBF24' },
  //   };
  // }
  dutyNames = this.computedAttr('dutyNames', () => {
    return this.reactiveRecord.duty_names
      ?.map((name: string) => name.replace(/【.*】/, ''))
      .join('、');
  });

  dutyCount = this.computedAttr('dutyCount', () => {
    return this.reactiveRecord.duty_names?.length;
  });

  memberIdentityNames = this.computedAttr('memberIdentityNames', () => {
    return this.reactiveRecord.member_identity_names?.join('、');
  });

  departmentNames = this.computedAttr('departmentNames', () => {
    return this.reactiveRecord.department_names?.join('、');
  });

  orgNames = this.computedAttr('orgNames', () => {
    return this.reactiveRecord.org_names?.join('、');
  });
}
