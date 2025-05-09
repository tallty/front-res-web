import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResMembership } from '@/res-core/types/model';

export class ResUserMembershipsApi extends MyApi<ResMembership> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/user',
      name: 'membership',
      ...config,
    });
  }
}

export class ResUserBpmMembershipsApi extends MyApi<ResMembership> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/user/bpm',
      name: 'membership',
      ...config,
    });
  }
}
