import { VApiConfig } from '@/lib/vails/api';
import { FormsTemplate } from './types';
import { MyApi } from '../../../../apis/MyApi';

export class FormsUserSetableTemplateApi extends MyApi<FormsTemplate> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/forms/user/setable',
      name: 'template',
      mode: 'single',
      ...config,
    });
  }
}
