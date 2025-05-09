import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { SoaAuthPassword } from '@/res-core/model';

export class SoaAuthAuthPasswordApi extends MyApi<SoaAuthPassword> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/soa-auth/auth',
      name: 'password',
      mode: 'single',
      ...config,
    });
  }
}
