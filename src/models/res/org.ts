import { VModel, VObject } from '@/lib/vails';
import { ResOrg } from '../../types/model';

export class ResOrgModel extends VModel<ResOrg> {
  // stateConfig = this.computedAttr('stateConfig', () => {
  //  return ResOrgModel.stateMapping()[this.reactiveRecord.state];
  // });

  // static stateMapping(): VObject {
  //   return {
  //     pending: { label: '待提交', color: '#FBBF24' },
  //   };
  // }
  ancestryPath = this.computedAttr('ancestryPath', () => {
    return this.reactiveRecord.ancestor_names?.reverse().join(' > ');
  });
}
