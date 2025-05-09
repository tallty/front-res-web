import { VModel, VObject } from '@/lib/vails';
import { ResMemberIdentity } from '../../types/model';

export class ResMemberIdentityModel extends VModel<ResMemberIdentity> {
  // stateConfig = this.computedAttr('stateConfig', () => {
  //  return ResMemberIdentityModel.stateMapping()[this.reactiveRecord.state];
  // });
  // static stateMapping(): VObject {
  //   return {
  //     pending: { label: '待提交', color: '#FBBF24' },
  //   };
  // }
}
