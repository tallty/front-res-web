import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResOrg } from '@/res-core/types/model';

export class ResChargeOrgsApi extends MyApi<ResOrg> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/charge',
      name: 'org',
      ...config,
    });
  }
}
