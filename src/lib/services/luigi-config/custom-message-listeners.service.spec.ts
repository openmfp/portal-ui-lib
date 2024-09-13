import { TestBed } from '@angular/core/testing';
import { LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN } from '../../injection-tokens';
import { Observable, Subject } from 'rxjs';
import { CustomMessageListener } from './custom-message-listener';
import { CustomMessageListenersService } from './custom-message-listeners.service';

describe('CustomMessageListenersService', () => {
  let customMessageListenersService: CustomMessageListenersService;

  const projChanged$ = new Subject<void>();
  const projectCreatedListener: CustomMessageListener = {
    messageId(): string {
      return 'ProjectCreatedListener';
    },
    changed$: projChanged$,
    changed: projChanged$.asObservable(),
    onCustomMessageReceived: jest.fn(),
  };

  const customChanged$ = new Subject<void>();
  const entityChangedListener: CustomMessageListener = {
    messageId(): string {
      return 'EntityChangedListener';
    },
    changed$: customChanged$,
    changed: customChanged$.asObservable(),
    onCustomMessageReceived: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
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
      CustomMessageListenersService
    );
  });

  it('should be defined', () => {
    expect(customMessageListenersService).toBeDefined();
  });

  it('should provide a customMessageListenersService object', () => {
    expect(
      Object.keys(customMessageListenersService.getMessageListeners())
    ).toContain('customMessagesListeners');
  });

  it('should provide custom message listeners', () => {
    expect(listeners()).toBeDefined();
    expect(listeners()).toContain('ProjectCreatedListener');
    expect(listeners()).toContain('EntityChangedListener');
    expect(listeners().length).toBe(2);
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
      testMfNodes
    );

    expect(projectCreatedListener.onCustomMessageReceived).toHaveBeenCalledWith(
      testMessage,
      testMf,
      testMfNodes
    );
  });

  it('should emit a change when the listener emits a change', (done) => {
    const messageListeners =
      customMessageListenersService.getMessageListeners();

    customMessageListenersService.changed.subscribe(() => {
      done();
    });

    messageListeners.customMessagesListeners['ProjectCreatedListener'](
      {},
      {},
      []
    );

    projectCreatedListener['changed$'].next();
  });

  it('should not emit a change when the listener does not emit a change', () => {
    const messageListeners =
      customMessageListenersService.getMessageListeners();
    const changeSpy = jest.spyOn(
      customMessageListenersService['changed$'],
      'next'
    );

    messageListeners.customMessagesListeners['ProjectCreatedListener'](
      {},
      {},
      []
    );

    expect(changeSpy).not.toHaveBeenCalled();
  });

  function listeners(): string[] {
    return Object.keys(
      customMessageListenersService.getMessageListeners()
        .customMessagesListeners
    );
  }
});
