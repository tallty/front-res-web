import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResOrgRequest } from '../../../types/model';

export class ResManageOrgRequestsApi extends MyApi<ResOrgRequest> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/manage',
      name: 'org_request',
      ...config,
    });
  }
}
