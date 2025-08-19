import { LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN } from '../../injection-tokens';
import { CustomMessageListener } from './custom-message-listener';
import { CustomMessageListenersService } from './custom-message-listeners.service';
import { ReloadLuigiConfigListener } from './custom-message-listeners/reload-luigi-config.listener';
import { TestBed } from '@angular/core/testing';

describe('CustomMessageListenersService', () => {
  let customMessageListenersService: CustomMessageListenersService;

  const projectCreatedListener: CustomMessageListener = {
    messageId(): string {
      return 'ProjectCreatedListener';
    },
    onCustomMessageReceived: jest.fn(),
  } as CustomMessageListener;

  const entityChangedListener: CustomMessageListener = {
    messageId(): string {
      return 'EntityChangedListener';
    },
    onCustomMessageReceived: jest.fn(),
  } as CustomMessageListener;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ReloadLuigiConfigListener,
          useValue: {
            messageId(): string {
              return 'ReloadLuigiConfigListener';
            },
            onCustomMessageReceived: jest.fn(),
          },
        },
        {
          provide: LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
          multi: true,
          useValue: projectCreatedListener,
        },
        {
          provide: LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
          multi: true,
          useValue: entityChangedListener,
        },
      ],
    }).compileComponents();

    customMessageListenersService = TestBed.inject(
      CustomMessageListenersService,
    );
  });

  it('should be defined', () => {
    expect(customMessageListenersService).toBeDefined();
  });

  it('should provide a customMessageListenersService object', () => {
    expect(
      Object.keys(customMessageListenersService.getMessageListeners()),
    ).toContain('customMessagesListeners');
  });

  it('should provide custom message listeners', () => {
    expect(listeners()).toBeDefined();
    expect(listeners()).toContain('ProjectCreatedListener');
    expect(listeners()).toContain('EntityChangedListener');
    expect(listeners().length).toBe(3);
  });

  it('should call onCustomMessageReceived when a custom message is received', () => {
    const messageListeners =
      customMessageListenersService.getMessageListeners();
    const testMessage = { data: 'test' };
    const testMf = {};
    const testMfNodes = [];

    messageListeners.customMessagesListeners['ProjectCreatedListener'](
      testMessage,
      testMf,
      testMfNodes,
    );

    expect(projectCreatedListener.onCustomMessageReceived).toHaveBeenCalledWith(
      testMessage,
      testMf,
      testMfNodes,
    );
  });

  function listeners(): string[] {
    return Object.keys(
      customMessageListenersService.getMessageListeners()
        .customMessagesListeners,
    );
  }
});
