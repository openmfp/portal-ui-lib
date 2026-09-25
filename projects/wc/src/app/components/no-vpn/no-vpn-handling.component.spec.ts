import { NoVPNHandlingComponent } from './no-vpn-handling.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { I18nService, LuigiCoreService } from '@openmfp/portal-ui-lib';
import { MockedObject } from 'vitest';

describe('NoVPNHandlingComponent', () => {
  let component: NoVPNHandlingComponent;
  let fixture: ComponentFixture<NoVPNHandlingComponent>;
  let i18nServiceMock: MockedObject<I18nService>;
  let luigiCoreServiceMock: MockedObject<LuigiCoreService>;
  let hideAppLoadingIndicator: ReturnType<typeof vi.fn>;
  let reload: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    i18nServiceMock = {
      getTranslation: vi.fn((key) => `translated_${key}`),
      translationTable: {},
    } as any;
    hideAppLoadingIndicator = vi.fn();
    reload = vi.fn();
    vi.spyOn(document, 'defaultView', 'get').mockReturnValue({
      location: { reload },
    } as any);
    luigiCoreServiceMock = {
      ux: vi.fn(() => ({ hideAppLoadingIndicator })),
    } as any;

    await TestBed.configureTestingModule({
      imports: [NoVPNHandlingComponent],
      providers: [
        { provide: I18nService, useValue: i18nServiceMock },
        { provide: LuigiCoreService, useValue: luigiCoreServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NoVPNHandlingComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('context', {
      translationTable: { en: {} },
    });
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide the app loading indicator on init', () => {
    expect(luigiCoreServiceMock.ux).toHaveBeenCalled();
    expect(hideAppLoadingIndicator).toHaveBeenCalled();
  });

  it('should read translations from the context translation table', () => {
    expect(i18nServiceMock.translationTable).toEqual({ en: {} });
    expect(i18nServiceMock.getTranslation).toHaveBeenCalledWith(
      'VPN_NEEDED_PAGE_TITLE',
    );
    expect(i18nServiceMock.getTranslation).toHaveBeenCalledWith(
      'VPN_NEEDED_PAGE_DESCRIPTION',
    );
    expect(i18nServiceMock.getTranslation).toHaveBeenCalledWith(
      'VPN_NEEDED_PAGE_RETRY_BUTTON',
    );
  });

  it('should expose translated title, description and retry label', () => {
    expect((component as any).texts()).toEqual({
      title: 'translated_VPN_NEEDED_PAGE_TITLE',
      description: 'translated_VPN_NEEDED_PAGE_DESCRIPTION',
      retryButton: 'translated_VPN_NEEDED_PAGE_RETRY_BUTTON',
    });
  });

  it('should render title, description and retry button', () => {
    const root = fixture.debugElement.nativeElement.shadowRoot;
    expect(
      root.querySelector('[data-e2e="no-vpn-title"]').textContent.trim(),
    ).toBe('translated_VPN_NEEDED_PAGE_TITLE');
    expect(
      root.querySelector('[data-e2e="no-vpn-description"]').textContent.trim(),
    ).toBe('translated_VPN_NEEDED_PAGE_DESCRIPTION');
    expect(
      root.querySelector('[data-e2e="no-vpn-retry-button"]').textContent.trim(),
    ).toBe('translated_VPN_NEEDED_PAGE_RETRY_BUTTON');
  });

  it('should render the disconnected icon when no illustration is provided', () => {
    const root = fixture.debugElement.nativeElement.shadowRoot;
    expect(
      root.querySelector('[data-e2e="no-vpn-icon"]').getAttribute('name'),
    ).toBe('disconnected');
    expect(root.querySelector('[data-e2e="no-vpn-illustration"]')).toBeNull();
  });

  it('should render the illustration when the host provides one', () => {
    const illustratedFixture = TestBed.createComponent(NoVPNHandlingComponent);
    illustratedFixture.nativeElement.style.setProperty(
      '--mfp-no-vpn-illustration-scene',
      "url('/scene.svg')",
    );
    illustratedFixture.componentRef.setInput('context', {
      translationTable: { en: {} },
    });
    illustratedFixture.detectChanges();

    const root = illustratedFixture.nativeElement.shadowRoot;
    expect(root.querySelector('[data-e2e="no-vpn-illustration"]')).not.toBeNull();
    expect(root.querySelector('[data-e2e="no-vpn-icon"]')).toBeNull();
  });

  it('should reload the page on retry', () => {
    component.retry();

    expect(reload).toHaveBeenCalled();
  });

  it('should reload the page when the retry button is clicked', () => {
    const button = fixture.debugElement.nativeElement.shadowRoot.querySelector(
      '[data-e2e="no-vpn-retry-button"]',
    );
    button.click();

    expect(reload).toHaveBeenCalled();
  });
});
