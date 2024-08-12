import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { ServiceProviderService } from './service-provider.service';
import { ConfigService } from './config.service';

describe('ServiceProviderService', () => {
  let service: ServiceProviderService;
  let configService: ConfigService;
  let getFrameConfigSpy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterModule.forRoot([])],
    });
    service = TestBed.inject(ServiceProviderService);
    configService = TestBed.inject(ConfigService);
  });

  describe('getRawConfigsForTenant', () => {
    const response = {
      providers: [],
      tenantId: '123',
      frameContext: {},
      featureToggles: {},
    };

    beforeEach(() => {
      getFrameConfigSpy = jest
        .spyOn(configService, 'getPortalConfig')
        .mockReturnValue(Promise.resolve(response as any));
    });

    it('should get the luigi nodes', async () => {
      // Act
      const configPromise = service.getRawConfigsForTenant();

      // Assert
      expect(getFrameConfigSpy).toHaveBeenCalled();
      expect(await configPromise).toBe(response.providers);
    });
  });

  it('should getRawConfigsForEntity', async () => {
    const response = {
      providers: [],
      entityContext: {},
    };

    const entity = 'entity';
    const context = {};

    const getEntityConfigSpy = jest
      .spyOn(configService, 'getEntityConfig')
      .mockResolvedValue(response);

    // Act
    const configPromise = service.getRawConfigsForEntity(entity, context);

    // Assert
    expect(getEntityConfigSpy).toHaveBeenCalledWith(entity, context);
    expect(await configPromise).toBe(response.providers);
  });

  it('should call clearEntityConfigCache while calling clearCache', () => {
    // Arrange
    configService.clearEntityConfigCache = jest.fn();

    // Act
    service.clearCache();

    // Assert
    expect(configService.clearEntityConfigCache).toHaveBeenCalled();
  });
});
