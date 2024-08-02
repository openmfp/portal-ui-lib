export interface MessagesListeners {
  customMessagesListeners: Record<string, any>;
}

export interface CommunicationConfigService {
  getCommunicationConfig(): MessagesListeners;
}

export class CommunicationConfigServiceImpl
  implements CommunicationConfigService
{
  getCommunicationConfig(): MessagesListeners {
    return undefined;
  }
}
