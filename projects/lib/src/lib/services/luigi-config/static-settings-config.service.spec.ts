import { LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { I18nService } from '../i18n.service';
import { IframeService } from './iframe.service';
import {
  StaticSettingsConfigService,
  StaticSettingsConfigServiceImpl,
} from './static-settings-config.service';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MockedObject } from 'vitest';
import { mock } from 'vitest-mock-extended';

describe('StaticSettingsConfigServiceImpl', () => {
  let service: StaticSettingsConfigServiceImpl;
  let iframeServiceMock: MockedObject<IframeService>;
  let i18nServiceMock: MockedObject<I18nService>;
  let customStaticSettingsConfigServiceMock: MockedObject<StaticSettingsConfigService>;

  let interceptFunction;

  beforeEach(() => {
    iframeServiceMock = mock();
    i18nServiceMock = mock();
    customStaticSettingsConfigServiceMock = mock();
    interceptFunction = () => {};
    iframeServiceMock.iFrameCreationInterceptor.mockReturnValue(
      interceptFunction,
    );
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        { provide: IframeService, useValue: iframeServiceMock },
        { provide: I18nService, useValue: i18nServiceMock },
        {
          provide: LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
          useValue: customStaticSettingsConfigServiceMock,
        },
        StaticSettingsConfigServiceImpl,
      ],
    });

    service = TestBed.inject<StaticSettingsConfigServiceImpl>(
      StaticSettingsConfigServiceImpl,
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getStaticSettingsConfig', () => {
    it('should return the correct configuration with MFP logo', async () => {
      const config = await service.getStaticSettingsConfig();

      expect(config).toEqual({
        header: {
          title: 'OpenMFP Portal',
          logo: 'assets/images/logo.png',
          favicon: 'assets/images/favicon.ico',
        },
        experimental: {
          btpToolLayout: true,
          globalNav: true,
        },
        btpToolLayout: true,
        responsiveNavigation: 'Fiori3',
        globalSideNavigation: true,
        featureToggles: {
          queryStringParam: 'ft',
        },
        appLoadingIndicator: {
          hideAutomatically: true,
        },
        iframeCreationInterceptor: interceptFunction,
        customTranslationImplementation: i18nServiceMock,
      });
    });

    it('should merge and override default config with custom settings', async () => {
      const customConfig = {
        header: {
          title: 'Custom Portal Title',
          logo: 'assets/custom-logo.svg',
          favicon: 'assets/custom-favicon.ico',
        },
        experimental: {
          btpToolLayout: false,
          customFeature: true,
        },
        additionalSetting: 'value',
      };

      customStaticSettingsConfigServiceMock.getStaticSettingsConfig.mockResolvedValue(
        customConfig,
      );

      const config = await service.getStaticSettingsConfig();

      expect(config).toEqual({
        header: {
          title: 'Custom Portal Title',
          logo: 'assets/custom-logo.svg',
          favicon: 'assets/custom-favicon.ico',
        },
        experimental: {
          btpToolLayout: false,
          customFeature: true,
        },
        btpToolLayout: true,
        responsiveNavigation: 'Fiori3',
        globalSideNavigation: true,
        featureToggles: {
          queryStringParam: 'ft',
        },
        appLoadingIndicator: {
          hideAutomatically: true,
        },
        iframeCreationInterceptor: interceptFunction,
        customTranslationImplementation: i18nServiceMock,
        additionalSetting: 'value',
      });
    });
  });
});
