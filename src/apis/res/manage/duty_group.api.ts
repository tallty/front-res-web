import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResDutyGroup } from '../../../types/model';

export class ResManageDutyGroupApi extends MyApi<ResDutyGroup> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/manage',
      name: 'duty_group',
      ...config,
    });
  }
}
