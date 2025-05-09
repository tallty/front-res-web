import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResDuty } from '@/res-core/model';

export class ResAdminDutiesApi extends MyApi<ResDuty> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/admin',
      name: 'duty',
      ...config,
    });
  }
}
