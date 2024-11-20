import { TestBed } from '@angular/core/testing';
import { LuigiComponent } from './luigi.component';
import {
  AuthService,
  LuigiConfigService,
  LuigiCoreService,
} from '../../services';

describe('LuigiComponent', () => {
  let component: LuigiComponent;
  let luigiConfigService: jest.Mocked<LuigiConfigService>;
  let luigiCoreService: jest.Mocked<LuigiCoreService>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    luigiConfigService = {
      getLuigiConfiguration: jest.fn(),
    } as any;

    luigiCoreService = {
      setConfig: jest.fn(),
      setAuthData: jest.fn(),
    } as any;

    authService = {
      getAuthData: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [LuigiComponent],
      providers: [
        { provide: LuigiConfigService, useValue: luigiConfigService },
        { provide: LuigiCoreService, useValue: luigiCoreService },
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    component = TestBed.createComponent(LuigiComponent).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize Luigi configuration successfully', async () => {
      const mockConfig = { navigation: 'config' };
      const mockAuthData = {
        idToken: 'test-token',
        accessTokenExpirationDate: 256,
      };

      luigiConfigService.getLuigiConfiguration.mockResolvedValue(mockConfig);
      authService.getAuthData.mockReturnValue(mockAuthData);

      await component.ngOnInit();

      expect(luigiConfigService.getLuigiConfiguration).toHaveBeenCalled();
      expect(luigiCoreService.setConfig).toHaveBeenCalledWith(mockConfig);
      expect(authService.getAuthData).toHaveBeenCalled();
      expect(luigiCoreService.setAuthData).toHaveBeenCalledWith(mockAuthData);
    });

    it('should handle initialization error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error');
      const error = new Error('Config error');

      luigiConfigService.getLuigiConfiguration.mockRejectedValue(error);

      await component.ngOnInit();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Luigi Component init failed: ${error.toString()}`
      );
      expect(luigiCoreService.setConfig).not.toHaveBeenCalled();
      expect(luigiCoreService.setAuthData).not.toHaveBeenCalled();
    });
  });
});
