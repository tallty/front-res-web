import { VModel, VObject } from '@/lib/vails';
import { ResOrgRequest } from '../../types/model';

export class ResOrgRequestModel extends VModel<ResOrgRequest> {
  stateConfig = this.computedAttr('stateConfig', () => {
    if (this.reactiveRecord.state == 'draft') {
      return ResOrgRequestModel.stateMapping()[this.reactiveRecord.state];
    } else {
      return ResOrgRequestModel.stateMapping()[this.reactiveRecord.create_instance_state];
    }
  });

  static stateMapping(): VObject {
    return {
      draft: {
        text: '草稿',
        style: {
          background: '#E5E7EB',
        },
      },
      processing: {
        text: '审批中',
        style: {
          background: '#1890ff',
        },
      },
      completed: {
        text: '已完成',
        style: {
          background: '#31C48D',
        },
      },
      terminated: {
        text: '已终止',
        style: {
          background: '#F05252',
        },
      },
    };
  }
}
