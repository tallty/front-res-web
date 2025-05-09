import { VModel, VObject } from '@/lib/vails';
import { ResDuty } from '../../types/model';

export class ResDutyModel extends VModel<ResDuty> {
  // stateConfig = this.computedAttr('stateConfig', () => {
  //  return ResDutyModel.stateMapping()[this.reactiveRecord.state];
  // });

  userCount = this.computedAttr('userCount', () => {
    return this.reactiveRecord.user_names?.length;
  });

  userNames = this.computedAttr('userNames', () => {
    return this.reactiveRecord.user_names?.join('、');
  });
}
