import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResDuty } from '../../../types/model';

export class ResManageDutyApi extends MyApi<ResDuty> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/manage',
      name: 'duty',
      ...config,
    });
  }
}
