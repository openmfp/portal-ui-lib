import { Inject, Injectable, Optional } from '@angular/core';
import { LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN } from '../../injection-tokens';
import { CustomMessageListener } from './custom-message-listener';
import { ReloadLuigiConfigListener } from './custom-message-listeners/reload-luigi-config.listener';

export interface MessageListener {
  (msg: any, mf: any, mfNodes: any): void;
}

export interface MessageListeners {
  customMessagesListeners: Record<string, MessageListener>;
}

/**
 * This class holds the customMessageListeners for custom messages used by the application portal.
 * See also {@link https://docs.luigi-project.io/docs/communication/?section=luigi-core-to-luigi-client}
 * See also {@link https://docs.luigi-project.io/docs/luigi-core-api/?section=custommessages}
 */
@Injectable({
  providedIn: 'root',
})
export class CustomMessageListenersService {
  private readonly listeners: CustomMessageListener[];

  constructor(
    private messageListeners: ReloadLuigiConfigListener,
    @Optional()
    @Inject(LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN)
    private customMessageListeners: CustomMessageListener[]
  ) {
    this.listeners = [this.messageListeners, ...(this.customMessageListeners || []).filter((l) => !!l)];
  }

  /**
   * An object containing the property 'listeners' in which the message-id and listener assignments are made.
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
