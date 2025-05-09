import { VObject } from '../model/index';

class requestError extends Error {
  response: VObject | undefined = undefined;
  constructor(message: string, response?: VObject) {
    super(message);
    this.response = response;
  }
}

export default requestError;
