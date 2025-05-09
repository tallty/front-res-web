import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResOrgRequest } from '../../../types/model';

export class ResAdminOrgRequestsApi extends MyApi<ResOrgRequest> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/admin',
      name: 'org_request',
      ...config,
    });
  }
}
