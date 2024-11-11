import { TestBed } from '@angular/core/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import {
  DEV_MODE_SETTINGS_KEY,
  DevModeSettingsService,
} from './dev-mode-settings.service';
import { EnvConfigService } from '../../portal';

describe('DevModeSettingsService', () => {
  let service: DevModeSettingsService;
  let envConfigMock: MockProxy<EnvConfigService>;

  beforeEach(() => {
    envConfigMock = mock<EnvConfigService>();
    TestBed.configureTestingModule({
      providers: [DevModeSettingsService, EnvConfigService],
      imports: [],
    }).overrideProvider(EnvConfigService, {
      useValue: envConfigMock,
    });
    service = TestBed.inject(DevModeSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  const mockEnvConfig = (developmentInstance: boolean) => {
    envConfigMock.getEnvConfig.mockResolvedValue({
      oauthServerUrl: '',
      clientId: '',
      developmentInstance,
      githubSettings: undefined,
      qualtricsId: '',
      qualtricsSiteInterceptUrl: '',
      validWebcomponentUrls: [],
      minimalPluginVersion: 2,
    } as any);
  };

  it('returns dev mode configs setting defaults', async () => {
    mockEnvConfig(true);
    const devModeSettings = await service.getDevModeSettings();

    expect(devModeSettings).toBeTruthy();
    expect(devModeSettings).toEqual({
      configs: [
        {
          url: 'http://localhost:4200/assets/content-configuration-global.json',
        },
        { url: 'http://localhost:4200/assets/content-configuration.json' },
      ],
      serviceProviderConfig: {},
    });
  });

  it('returns empty if non-dev environment and not active in the local storage', async () => {
    mockEnvConfig(false);
    window.localStorage.setItem(
      DEV_MODE_SETTINGS_KEY,
      JSON.stringify({
        serviceProviderConfig: { a: 'b' },
      })
    );
    const devModeSettings = await service.getDevModeSettings();

    expect(devModeSettings).toBeTruthy();
    expect(devModeSettings).toEqual({
      configs: [],
      serviceProviderConfig: {},
    });
  });

  it('returns empty if non-dev environment and active in the local storage', async () => {
    mockEnvConfig(false);
    window.localStorage.setItem(
      DEV_MODE_SETTINGS_KEY,
      JSON.stringify({
        isActive: true,
        serviceProviderConfig: { a: 'b' },
      })
    );
    const devModeSettings = await service.getDevModeSettings();

    expect(devModeSettings).toBeTruthy();
    expect(devModeSettings).toEqual({
      configs: [
        {
          url: 'http://localhost:4200/assets/content-configuration-global.json',
        },
        {
          url: 'http://localhost:4200/assets/content-configuration.json',
        },
      ],
      serviceProviderConfig: { a: 'b' },
    });
  });

  it('overwrites the configs & serviceProviderConfig from the local storage', async () => {
    mockEnvConfig(true);
    window.localStorage.setItem(
      DEV_MODE_SETTINGS_KEY,
      JSON.stringify({
        configs: [
          { url: 'http://localhost:4200/assets/content-configuration.json' },
        ],
        serviceProviderConfig: { a: 'b' },
      })
    );
    const devModeSettings = await service.getDevModeSettings();

    expect(devModeSettings).toBeTruthy();
    expect(devModeSettings).toEqual({
      configs: [
        { url: 'http://localhost:4200/assets/content-configuration.json' },
      ],
      serviceProviderConfig: { a: 'b' },
    });
  });
});
