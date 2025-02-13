import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { mock } from 'jest-mock-extended';
import { IframeService } from './iframe.service';
import { StaticSettingsConfigServiceImpl } from './static-settings-config.service';
import { I18nService } from '../i18n.service';

describe('StaticSettingsConfigServiceImpl', () => {
  let service: StaticSettingsConfigServiceImpl;
  let iframeService: jest.Mocked<IframeService>;
  let i18nService: jest.Mocked<I18nService>;
  let interceptFunction;

  beforeEach(() => {
    iframeService = mock();
    i18nService = mock();
    interceptFunction = () => {};
    iframeService.iFrameCreationInterceptor.mockReturnValue(interceptFunction);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        { provide: IframeService, useValue: iframeService },
        { provide: I18nService, useValue: i18nService },
        StaticSettingsConfigServiceImpl,
      ],
    });

    service = TestBed.inject<StaticSettingsConfigServiceImpl>(
      StaticSettingsConfigServiceImpl
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
          logo: 'assets/images/mfp_mark.svg',
          favicon: 'assets/images/mfp_mark.svg',
        },
        experimental: {
          btpToolLayout: true,
        },
        btpToolLayout: true,
        responsiveNavigation: 'Fiori3',
        featureToggles: {
          queryStringParam: 'ft',
        },
        appLoadingIndicator: {
          hideAutomatically: true,
        },
        iframeCreationInterceptor: interceptFunction,
        customTranslationImplementation: i18nService,
      });
    });
  });
});
