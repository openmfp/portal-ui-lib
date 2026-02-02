import { LuigiCoreService } from '../../luigi-core.service';
import { ConfigService } from '../../portal';
import { ReloadLuigiConfigListener } from './reload-luigi-config.listener';
import { TestBed } from '@angular/core/testing';
import { MockedObject, beforeEach, describe, expect, it, vi } from 'vitest';

describe('ReloadLuigiConfigListener', () => {
  let listener: ReloadLuigiConfigListener;
  let configService: MockedObject<ConfigService>;
  let luigiCoreService: MockedObject<LuigiCoreService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReloadLuigiConfigListener,
        { provide: ConfigService, useValue: { reloadConfig: vi.fn() } },
        { provide: LuigiCoreService, useValue: { resetLuigi: vi.fn() } },
      ],
    });

    listener = TestBed.inject(ReloadLuigiConfigListener);
    configService = TestBed.inject(
      ConfigService,
    ) as MockedObject<ConfigService>;
    luigiCoreService = TestBed.inject(
      LuigiCoreService,
    ) as MockedObject<LuigiCoreService>;
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
      entity: undefined as any,
      context: { foo: 'bar' },
    };
    await listener.onCustomMessageReceived(message, {}, {});
    expect(configService.reloadConfig).toHaveBeenCalledWith(undefined, {
      foo: 'bar',
    });
    expect(luigiCoreService.resetLuigi).toHaveBeenCalled();
  });
});
