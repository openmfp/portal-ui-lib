import { Subject } from 'rxjs';
import { PortalModule } from './portal.module';
import * as tokens from './injection-tokens';
import { CustomMessageListener } from './services';

class ProjectCustomMessageListener implements CustomMessageListener {
  messageId(): string {
    return 'ProjectCreatedListener';
  }
  changed$ = new Subject<void>();
  changed = this.changed$.asObservable();
  onCustomMessageReceived = jest.fn();
}

class EntityCustomMessageListener implements CustomMessageListener {
  messageId(): string {
    return 'EntityChangedListener';
  }
  changed$ = new Subject<void>();
  changed = this.changed$.asObservable();
  onCustomMessageReceived = jest.fn();
}

describe('PortalModule', () => {
  it('should create portal module without undefined configuration options', () => {
    const module = PortalModule.forRoot();

    expect(module).not.toBeFalsy();
  });

  it('should create portal module without empty configuration options', () => {
    const module = PortalModule.forRoot({});

    expect(module).not.toBeFalsy();
  });

  it('should add custom message listeners when provided', () => {
    const module = PortalModule.forRoot({
      customMessageListeners: [
        ProjectCustomMessageListener,
        EntityCustomMessageListener,
      ],
    });

    const customListenerProvider = module.providers.filter(
      (provider) =>
        provider['provide'] ===
        tokens.LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN
    );

    expect(customListenerProvider).toHaveLength(2);
    expect(customListenerProvider[0]['useClass']).toBe(
      ProjectCustomMessageListener
    );
    expect(customListenerProvider[0]['multi']).toBe(true);
    expect(customListenerProvider[1]['useClass']).toBe(
      EntityCustomMessageListener
    );
    expect(customListenerProvider[1]['multi']).toBe(true);
  });
});
