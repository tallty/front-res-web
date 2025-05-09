import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResOrgMemberIdentity } from '../../../model';

export class ResAdminOrgMemberIdentitiesApi extends MyApi<ResOrgMemberIdentity> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/admin',
      name: 'org_member_identity',
      ...config,
    });
  }
}
