import { MyApi } from '@/apis/MyApi';
import { VApiConfig } from '@/lib/vails/api';
import { ComModelSetting } from '@/engines/com/types/model';

export class ComUserModelSettingsApi extends MyApi<ComModelSetting> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/com/user',
      name: 'model_settings',
      ...config,
    });
  }
}
