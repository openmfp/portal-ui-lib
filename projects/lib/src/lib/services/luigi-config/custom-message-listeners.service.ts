import { Inject, Injectable, Optional } from '@angular/core';
import { LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN } from '../../injection-tokens';
import { CustomMessageListener } from './custom-message-listener';

export interface MessageListener {
  (msg: any, mf: any, mfNodes: any): void;
}

export interface MessageListeners {
  customMessagesListeners: Record<string, MessageListener>;
}

/**
 * This class holds the listeners for custom messages used by the application portal.
 * See also {@link https://docs.luigi-project.io/docs/communication/?section=luigi-core-to-luigi-client}
 * See also {@link https://docs.luigi-project.io/docs/luigi-core-api/?section=custommessages}
 */
@Injectable({
  providedIn: 'root',
})
export class CustomMessageListenersService {
  constructor(
    @Optional()
    @Inject(LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN)
    private listeners: CustomMessageListener[]
  ) {
    this.listeners = (listeners || []).filter((l) => !!l);
  }

  /**
   * An object containing the property 'customMessageListeners' in which the message-id and listener assignments are made.
   * See also {@link https://docs.luigi-project.io/docs/communication/?section=luigi-core-to-luigi-client}
   */
  public getMessageListeners(): MessageListeners {
    const result: MessageListeners = { customMessagesListeners: {} };
    for (const listener of this.listeners) {
      const obj = {
        [listener.messageId()]: (msg, mf, mfNodes) => {
          listener.onCustomMessageReceived(msg, mf, mfNodes);
        },
      };
      Object.assign(result.customMessagesListeners, obj);
    }
    return result;
  }
}
