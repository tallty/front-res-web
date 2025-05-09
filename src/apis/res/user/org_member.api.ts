import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResOrgMember } from '../../../model';

export class ResUserOrgMembersApi extends MyApi<ResOrgMember> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/user',
      name: 'org_member',
      ...config,
    });
  }
}
