import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ComTheme } from '@/engines/com/types/model';

export class ComUserThemeApi extends MyApi<ComTheme> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/com/user',
      name: 'theme',
      ...config,
    });
  }
}
