import { VModel, VObject } from '@/lib/vails';
import { ResOrgMemberIdentity } from '../../model';

export class ResOrgMemberIdentityModel extends VModel<ResOrgMemberIdentity> {
  // stateConfig = this.computedAttr('stateConfig', () => {
  //  return ResMemberIdentityModel.stateMapping()[this.reactiveRecord.state];
  // });
  // static stateMapping(): VObject {
  //   return {
  //     pending: { label: '待提交', color: '#FBBF24' },
  //   };
  // }
}
