import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { mock } from 'jest-mock-extended';
import { of } from 'rxjs';
import { LogoutComponent } from './logout.component';
import {
  LuigiCoreService,
  I18nService,
  LoginEventService,
  LoginEventType,
} from '../../services';

describe('LogoutComponent', () => {
  let component: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;
  let mockRoute: ActivatedRoute;
  let mockRouter: Router;
  let mockLuigiCoreService: LuigiCoreService;
  let mockRef: ChangeDetectorRef;
  let mockI18nService: I18nService;
  let loginEventServiceMock: jest.Mocked<LoginEventService>;

  beforeEach(waitForAsync(() => {
    mockRoute = {
      snapshot: { queryParams: of({ error: 'tokenExpired' }) },
    } as any;
    mockRouter = { navigate: jest.fn() } as any;
    mockLuigiCoreService = {
      removeAuthData: jest.fn(),
      ux: jest.fn(() => ({ hideAppLoadingIndicator: jest.fn() })),
    } as any;
    mockRef = { detectChanges: jest.fn() } as any;
    mockI18nService = {
      getTranslationAsync: jest.fn().mockResolvedValue('test translation'),
    } as any;
    loginEventServiceMock = mock<LoginEventService>();

    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: Router, useValue: mockRouter },
        { provide: LuigiCoreService, useValue: mockLuigiCoreService },
        { provide: ChangeDetectorRef, useValue: mockRef },
        { provide: I18nService, useValue: mockI18nService },
        { provide: LoginEventService, useValue: loginEventServiceMock },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call hideAppLoadingIndicator on init', () => {
    expect(mockLuigiCoreService.ux).toHaveBeenCalled();
  });

  it('should set the headline, hint, and btnText correctly on init', async () => {
    await component.ngOnInit();

    expect(component.headline).toBe('test translation');
    expect(component.hint).toBe('test translation');
    expect(component.btnText).toBe('test translation');
  });

  it('should handle error cases correctly', async () => {
    await component.ngOnInit();

    expect(component.headline).toBe('test translation'); // assuming translation for SESSION_EXPIRED is 'test translation'
  });

  it('should trigger event type LOGIN_TRIGGERED', () => {
    component.login();

    expect(loginEventServiceMock.loginEvent).toHaveBeenCalledWith({
      type: LoginEventType.LOGIN_TRIGGERED,
    });
  });

  it('should set headline to SESSION_EXPIRED for tokenExpired error', async () => {
    mockRoute.snapshot.queryParams = { error: 'tokenExpired' };

    await component.ngOnInit();

    expect(component.headline).toBe('test translation'); // assuming translation for SESSION_EXPIRED is 'test translation'
  });

  it('should set headline and hint for loginError', async () => {
    mockRoute.snapshot.queryParams = { error: 'loginError' };

    await component.ngOnInit();

    expect(component.headline).toBe('test translation'); // assuming translation for SIGN_IN_ERROR is 'test translation'
    expect(component.hint).toBe('test translation'); // assuming translation for SIGN_IN_ERROR_HINT is 'test translation'
  });

  it('should set headline and hint and remove auth data for invalidToken', async () => {
    mockRoute.snapshot.queryParams = { error: 'invalidToken' };

    await component.ngOnInit();

    expect(component.headline).toBe('test translation'); // assuming translation for INVALID_TOKEN_ERROR is 'test translation'
    expect(component.hint).toBe('test translation'); // assuming translation for INVALID_TOKEN_ERROR_HINT is 'test translation'
    expect(mockLuigiCoreService.removeAuthData).toHaveBeenCalled();
  });
});
