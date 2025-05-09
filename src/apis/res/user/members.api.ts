import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResMember } from '@/res-core/types/model';

export class ResUserMembersApi extends MyApi<ResMember> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/user',
      name: 'member',
      ...config,
    });
  }
}
