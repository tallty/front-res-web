import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResMember } from '@/res-core/model';

export class ResAdminSubtreeMembersApi extends MyApi<ResMember> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/admin/subtree',
      name: 'member',
      ...config,
    });
  }
}
