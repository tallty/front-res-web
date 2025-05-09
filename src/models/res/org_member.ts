import { VModel, VObject } from '@/lib/vails';
import { ResOrgMember } from '../../model';

export class ResOrgMemberModel extends VModel<ResOrgMember> {
  // stateConfig = this.computedAttr('stateConfig', () => {
  //  return ResMemberIdentityModel.stateMapping()[this.reactiveRecord.state];
  // });
  // static stateMapping(): VObject {
  //   return {
  //     pending: { label: '待提交', color: '#FBBF24' },
  //   };
  // }
}
