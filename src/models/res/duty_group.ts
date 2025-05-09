import { VModel, VObject } from '@/lib/vails';
import { ResDutyGroup } from '../../types/model';

export class ResDutyGroupModel extends VModel<ResDutyGroup> {
  // stateConfig = this.computedAttr('stateConfig', () => {
  //  return ResDutyGroupModel.stateMapping()[this.reactiveRecord.state];
  // });
  // static stateMapping(): VObject {
  //   return {
  //     pending: { label: '待提交', color: '#FBBF24' },
  //   };
  // }
}
