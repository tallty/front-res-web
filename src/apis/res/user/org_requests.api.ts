import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResOrgRequest } from '../../../types/model';

export class ResUserOrgRequestsApi extends MyApi<ResOrgRequest> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/user',
      name: 'org_request',
      ...config,
    });
  }
}
