import { TestBed } from '@angular/core/testing';
import { LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN } from '../../injection-tokens';
import { Subject } from 'rxjs';
import { CustomMessageListener } from './custom-message-listener';
import { CustomMessageListeners } from './custom-message-listeners.service';

class ProjectCreatedListener implements CustomMessageListener {
  messageId(): string {
    return 'ProjectCreatedListener';
  }
  changed?: Subject<void>;
  onCustomMessageReceived(): void {}
}

class EntityChangedListener implements CustomMessageListener {
  messageId(): string {
    return 'EntityChangedListener';
  }
  changed?: Subject<void>;
  onCustomMessageReceived(): void {}
}

describe('CustomMessageListeners', () => {
  let customMessageListeners: CustomMessageListeners;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
          multi: true,
          useClass: ProjectCreatedListener,
        },
        {
          provide: LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
          multi: true,
          useClass: EntityChangedListener,
        },
      ],
    }).compileComponents();

    customMessageListeners = TestBed.inject(CustomMessageListeners);
  });

  it('should be defined', () => {
    expect(customMessageListeners).toBeDefined();
  });

  it('should provide a customMessageListeners object', () => {
    expect(Object.keys(customMessageListeners.messageListeners)).toContain(
      'customMessagesListeners'
    );
  });

  it('should provide custom message listeners', () => {
    expect(listeners()).toBeDefined();
    expect(listeners()).toContain('ProjectCreatedListener');
    expect(listeners()).toContain('EntityChangedListener');
    expect(listeners().length).toBe(2);
  });

  function listeners(): string[] {
    return Object.keys(
      customMessageListeners.messageListeners.customMessagesListeners
    );
  }
});
