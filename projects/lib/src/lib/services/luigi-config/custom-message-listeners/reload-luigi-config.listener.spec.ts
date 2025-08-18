import { LuigiCoreService } from '../../luigi-core.service';
import { ConfigService } from '../../portal';
import { ReloadLuigiConfigListener } from './reload-luigi-config.listener';
import { TestBed } from '@angular/core/testing';

describe('ReloadLuigiConfigListener', () => {
  let listener: ReloadLuigiConfigListener;
  let configService: jest.Mocked<ConfigService>;
  let luigiCoreService: jest.Mocked<LuigiCoreService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReloadLuigiConfigListener,
        { provide: ConfigService, useValue: { reloadConfig: jest.fn() } },
        { provide: LuigiCoreService, useValue: { resetLuigi: jest.fn() } },
      ],
    });

    listener = TestBed.inject(ReloadLuigiConfigListener);
    configService = TestBed.inject(ConfigService) as jest.Mocked<ConfigService>;
    luigiCoreService = TestBed.inject(
      LuigiCoreService,
    ) as jest.Mocked<LuigiCoreService>;
  });

  it('should return correct messageId', () => {
    expect(listener.messageId()).toBe('openmfp.reload-luigi-config');
  });

  it('should reload config and reset luigi', async () => {
    const message = {
      origin: 'test-origin',
      action: 'test-action',
      id: '123',
      entity: 'entity1',
      context: { key: 'value' },
    };
    await listener.onCustomMessageReceived(message, {}, {});
    expect(configService.reloadConfig).toHaveBeenCalledWith('entity1', {
      key: 'value',
    });
    expect(luigiCoreService.resetLuigi).toHaveBeenCalled();
  });

  it('should use global if entity is undefined', async () => {
    const message = {
      origin: 'test-origin',
      action: 'test-action',
      id: '123',
      entity: undefined,
      context: { foo: 'bar' },
    };
    await listener.onCustomMessageReceived(message, {}, {});
    expect(configService.reloadConfig).toHaveBeenCalledWith(undefined, {
      foo: 'bar',
    });
    expect(luigiCoreService.resetLuigi).toHaveBeenCalled();
  });
});
