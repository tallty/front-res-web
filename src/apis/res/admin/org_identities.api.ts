import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResOrgIdentity } from '@/res-core/model';

export class ResAdminOrgIdentitiesApi extends MyApi<ResOrgIdentity> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/admin',
      name: 'org_identity',
      ...config,
    });
  }
}
