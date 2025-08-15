import { LuigiCoreService } from '../../luigi-core.service';
import { ConfigService } from '../../portal';
import { CustomMessageListener } from '../custom-message-listener';
import { Injectable, inject } from '@angular/core';

interface ReloadLuigiConfigMessage {
  origin: string;
  action: string;
  id: string;
  entity: string;
  context: Record<string, any>;
}

@Injectable({
  providedIn: 'root',
})
export class ReloadLuigiConfigListener implements CustomMessageListener {
  private configService = inject(ConfigService);
  private luigiCoreService = inject(LuigiCoreService);

  messageId(): string {
    return 'openmfp.reload-luigi-config';
  }

  async onCustomMessageReceived(
    customMessage: ReloadLuigiConfigMessage,
    mfObject: any,
    mfNodesObject: any,
  ): Promise<void> {
    console.debug(
      `Reloading Luigi config from ${customMessage.origin}, action: ${customMessage.action}
      for entity: ${customMessage.entity ?? 'global'} 
      with context: ${JSON.stringify(customMessage.context)}`,
    );
    await this.configService.reloadConfig(
      customMessage.entity,
      customMessage.context,
    );
    this.luigiCoreService.resetLuigi();
  }
}
