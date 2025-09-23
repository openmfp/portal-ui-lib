import { GettingStartedComponent } from './getting-started.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LuigiCoreService } from '@openmfp/portal-ui-lib';

describe('GettingStartedComponent', () => {
  let component: GettingStartedComponent;
  let fixture: ComponentFixture<GettingStartedComponent>;
  let luigiCoreServiceMock: jest.Mocked<LuigiCoreService>;

  beforeEach(async () => {
    luigiCoreServiceMock = {
      config: {
        settings: {
          links: [
            { title: 'Test Link 1', link: 'https://test1.com' },
            { title: 'Test Link 2', link: 'https://test2.com' },
          ],
          header: {
            title: 'Test Portal',
            logo: 'https://test.com/logo.png',
          },
        },
      },
    } as any;

    await TestBed.configureTestingModule({
      imports: [GettingStartedComponent],
      providers: [
        { provide: LuigiCoreService, useValue: luigiCoreServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GettingStartedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('component initialization', () => {
    it('should initialize links with config links plus default links', () => {
      expect(component.links).toEqual([
        { title: 'Test Link 1', link: 'https://test1.com' },
        { title: 'Test Link 2', link: 'https://test2.com' },
        { title: 'OpemMFP', link: 'https://openmfp.org/' },
        { title: 'OpenMFP GitHub', link: 'https://github.com/openmfp' },
      ]);
    });

    it('should initialize links with only default links when config links is null', () => {
      luigiCoreServiceMock.config.settings.links = null;

      fixture = TestBed.createComponent(GettingStartedComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.links).toEqual([
        { title: 'OpemMFP', link: 'https://openmfp.org/' },
        { title: 'OpenMFP GitHub', link: 'https://github.com/openmfp' },
      ]);
    });

    it('should initialize links with only default links when config links is undefined', () => {
      luigiCoreServiceMock.config.settings.links = undefined;

      fixture = TestBed.createComponent(GettingStartedComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.links).toEqual([
        { title: 'OpemMFP', link: 'https://openmfp.org/' },
        { title: 'OpenMFP GitHub', link: 'https://github.com/openmfp' },
      ]);
    });

    it('should initialize links with only default links when config links is empty array', () => {
      luigiCoreServiceMock.config.settings.links = [];

      fixture = TestBed.createComponent(GettingStartedComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.links).toEqual([
        { title: 'OpemMFP', link: 'https://openmfp.org/' },
        { title: 'OpenMFP GitHub', link: 'https://github.com/openmfp' },
      ]);
    });

    it('should initialize header from config', () => {
      expect(component.header).toBe('Test Portal');
    });

    it('should initialize logo from config', () => {
      expect(component.logo).toBe('https://test.com/logo.png');
    });
  });

  describe('ngOnInit', () => {
    it('should call ngOnInit without errors', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });
  });

  describe('template rendering', () => {
    it('should render logo image with correct src and alt', () => {
      const logoImg = fixture.debugElement.nativeElement.querySelector('.logo');
      expect(logoImg).toBeTruthy();
      expect(logoImg.src).toBe('https://test.com/logo.png');
      expect(logoImg.alt).toBe('logo');
    });

    it('should render header text', () => {
      const headerText = fixture.debugElement.nativeElement.querySelector(
        '.platform-mesh-text',
      );
      expect(headerText).toBeTruthy();
      expect(headerText.textContent.trim()).toBe('Test Portal');
    });

    it('should render welcome title', () => {
      const title = fixture.debugElement.nativeElement.querySelector('.title');
      expect(title).toBeTruthy();
      expect(title.textContent.trim()).toBe("Welcome! Let's get started.");
    });

    it('should render congratulations message', () => {
      const content = fixture.debugElement.nativeElement.querySelector(
        '.platform-mesh-content p',
      );
      expect(content).toBeTruthy();
      expect(content.textContent.trim()).toBe(
        'Congratulations! Your portal is running. 🎉',
      );
    });

    it('should render all links with correct attributes', () => {
      const links =
        fixture.debugElement.nativeElement.querySelectorAll('.pill');
      expect(links.length).toBe(4);

      // Check first config link
      expect(links[0].href).toBe('https://test1.com/');
      expect(links[0].target).toBe('_blank');
      expect(links[0].rel).toBe('noopener');
      expect(links[0].textContent.trim()).toBe('Test Link 1');

      // Check second config link
      expect(links[1].href).toBe('https://test2.com/');
      expect(links[1].target).toBe('_blank');
      expect(links[1].rel).toBe('noopener');
      expect(links[1].textContent.trim()).toBe('Test Link 2');

      // Check default OpenMFP link
      expect(links[2].href).toBe('https://openmfp.org/');
      expect(links[2].target).toBe('_blank');
      expect(links[2].rel).toBe('noopener');
      expect(links[2].textContent.trim()).toBe('OpemMFP');

      // Check default GitHub link
      expect(links[3].href).toBe('https://github.com/openmfp');
      expect(links[3].target).toBe('_blank');
      expect(links[3].rel).toBe('noopener');
      expect(links[3].textContent.trim()).toBe('OpenMFP GitHub');
    });

    it('should render external link icons for all links', () => {
      const svgIcons =
        fixture.debugElement.nativeElement.querySelectorAll('.pill svg');
      expect(svgIcons.length).toBe(4);

      svgIcons.forEach((icon) => {
        expect(icon.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
        expect(icon.getAttribute('height')).toBe('14');
        expect(icon.getAttribute('width')).toBe('14');
        expect(icon.getAttribute('viewBox')).toBe('0 -960 960 960');
        expect(icon.getAttribute('fill')).toBe('currentColor');
      });
    });

    it('should render divider with correct attributes', () => {
      const divider =
        fixture.debugElement.nativeElement.querySelector('.divider');
      expect(divider).toBeTruthy();
      expect(divider.getAttribute('role')).toBe('separator');
      expect(divider.getAttribute('aria-label')).toBe('Divider');
    });
  });

  describe('edge cases', () => {
    it('should handle missing header title gracefully', () => {
      luigiCoreServiceMock.config.settings.header.title = undefined;

      fixture = TestBed.createComponent(GettingStartedComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.header).toBeUndefined();
    });

    it('should handle missing logo gracefully', () => {
      luigiCoreServiceMock.config.settings.header.logo = undefined;

      fixture = TestBed.createComponent(GettingStartedComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.logo).toBeUndefined();
    });

    it('should handle missing header object gracefully', () => {
      luigiCoreServiceMock.config.settings.header = undefined;

      fixture = TestBed.createComponent(GettingStartedComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.header).toBeUndefined();
      expect(component.logo).toBeUndefined();
    });

    it('should handle missing settings object gracefully', () => {
      luigiCoreServiceMock.config.settings = undefined;

      fixture = TestBed.createComponent(GettingStartedComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.links).toEqual([
        { title: 'OpemMFP', link: 'https://openmfp.org/' },
        { title: 'OpenMFP GitHub', link: 'https://github.com/openmfp' },
      ]);
      expect(component.header).toBeUndefined();
      expect(component.logo).toBeUndefined();
    });
  });
});
