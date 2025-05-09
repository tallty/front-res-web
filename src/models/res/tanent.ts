import { VModel } from '@/lib/vails';
import { ResTanent } from '../../model';

export class ResTanentModel extends VModel<ResTanent> {
  // stateConfig = this.computedAttr('stateConfig', () => {
  //  return ResOrgModel.stateMapping()[this.reactiveRecord.state];
  // });
  // static stateMapping(): VObject {
  //   return {
  //     pending: { label: '待提交', color: '#FBBF24' },
  //   };
  // }
}
