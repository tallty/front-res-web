import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResBook } from '@/res-core/types/model';

export class ResUserBooksApi extends MyApi<ResBook> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/user',
      name: 'book',
      ...config,
    });
  }
}
