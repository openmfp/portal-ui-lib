import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import { LogoutComponent } from './logout.component';
import { I18nService } from '../services/i18n.service';
import { LuigiCoreService } from '../services/luigi-core.service';

describe('LogoutComponent', () => {
  let component: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;
  let mockRoute: ActivatedRoute;
  let mockRouter: Router;
  let mockLuigiCoreService: LuigiCoreService;
  let mockRef: ChangeDetectorRef;
  let mockI18nService: I18nService;

  beforeEach(waitForAsync(() => {
    mockRoute = { queryParams: of({ error: 'tokenExpired' }) } as any;
    mockRouter = { navigate: jest.fn() } as any;
    mockLuigiCoreService = {
      ux: jest.fn(() => ({ hideAppLoadingIndicator: jest.fn() })),
      auth: jest.fn(() => ({ store: { removeAuthData: jest.fn() } })),
    } as any;
    mockRef = { detectChanges: jest.fn() } as any;
    mockI18nService = {
      getTranslationAsync: jest.fn().mockResolvedValue('test translation'),
    } as any;

    TestBed.configureTestingModule({
      declarations: [LogoutComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: Router, useValue: mockRouter },
        { provide: LuigiCoreService, useValue: mockLuigiCoreService },
        { provide: ChangeDetectorRef, useValue: mockRef },
        { provide: I18nService, useValue: mockI18nService },
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
    expect(sessionStorage.getItem('portal.relogin.url')).toBeNull();
  });

  it('should navigate to login target on login if loginTarget is set', () => {
    history.replaceState = jest.fn();
    window.dispatchEvent = jest.fn();

    component.loginTarget = 'http://example.com';
    component.login();

    expect(history.replaceState).toHaveBeenCalledWith(
      {},
      '',
      'http://example.com'
    );
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      new CustomEvent('popstate')
    );
  });

  it('should navigate to home on login if loginTarget is not set', () => {
    component.loginTarget = '';
    component.login();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should parse URL parameters', () => {
    component.parseUrlParameters();
    expect(component['urlParams']['error']).toBe('tokenExpired');
  });
});
