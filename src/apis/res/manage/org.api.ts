import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResOrg } from '../../../types/model';

export class ResManageOrgApi extends MyApi<ResOrg> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/manage',
      name: 'org',
      ...config,
    });
  }
}
