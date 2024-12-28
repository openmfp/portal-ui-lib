import { TestBed } from '@angular/core/testing';
import { LuigiNode } from '../../models';
import { LuigiCoreService } from '../luigi-core.service';
import { IframeService } from './iframe.service';

describe('IframeService', () => {
  let service: IframeService;
  let luigiCoreService: LuigiCoreService;
  let interceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IframeService, LuigiCoreService],
      imports: [],
    }).compileComponents();
  });
  beforeEach(() => {
    service = TestBed.inject(IframeService);
    luigiCoreService = TestBed.inject(LuigiCoreService);
    jest.spyOn(luigiCoreService, 'getConfigValue').mockImplementation();
    interceptor = service.iFrameCreationInterceptor();
  });

  describe('Node permissions', () => {
    let node: LuigiNode;

    beforeEach(() => {
      node = {
        label: 'label',
        requiredIFramePermissions: {
          allow: ['clipboard-read', 'clipboard-write'],
          sandbox: ['allow-top-navigation', 'allow-forms'],
        },
      };
    });

    function createFrame(src: string = 'http://foo.com') {
      const frame = document.createElement('iframe');
      frame.setAttribute('src', src);
      return frame;
    }

    it('should set iframe allow and sandbox attributes correctly', async () => {
      const frame = createFrame();

      interceptor(frame, undefined, node, undefined);

      expect(frame.getAttribute('allow')).toBe(
        'clipboard-read; clipboard-write;'
      );
      expect(frame.getAttribute('sandbox')).toBe(
        'allow-top-navigation allow-forms'
      );
    });

    it('should append iframe allow and sandbox attributes correctly', async () => {
      const frame = createFrame();
      frame.setAttribute('allow', 'somethingWithoutSemicolon');
      frame.setAttribute('sandbox', 'nospace');
      const frame2 = createFrame();
      frame2.setAttribute('allow', '   somethingWithSemicolon;   ');
      frame2.setAttribute('sandbox', '   space      ');

      interceptor(frame, undefined, node, undefined);
      interceptor(frame2, undefined, node, undefined);

      expect(frame.getAttribute('allow')).toBe(
        'somethingWithoutSemicolon; clipboard-read; clipboard-write;'
      );
      expect(frame.getAttribute('sandbox')).toBe(
        'nospace allow-top-navigation allow-forms'
      );

      expect(frame2.getAttribute('allow')).toBe(
        'somethingWithSemicolon; clipboard-read; clipboard-write;'
      );
      expect(frame2.getAttribute('sandbox')).toBe(
        'space allow-top-navigation allow-forms'
      );
    });

    it('should not do anything if no iframe permissions specified', async () => {
      const frame = createFrame();
      frame.setAttribute('allow', 'allow ');
      frame.setAttribute('sandbox', ' sandbox ');
      node.requiredIFramePermissions = undefined;

      interceptor(frame, undefined, node, undefined);

      expect(frame.getAttribute('allow')).toBe('allow ');
      expect(frame.getAttribute('sandbox')).toBe(' sandbox ');
    });

    it('should use iframe permissions defined under viewGroupSettings as fallback', async () => {
      const frame = createFrame();
      const frame2 = createFrame();
      const frame3 = createFrame();

      jest.spyOn(luigiCoreService, 'getConfigValue').mockReturnValue({
        vg1: {
          requiredIFramePermissions: {
            allow: ['vg-clipboard-read', 'vg-clipboard-write'],
            sandbox: ['vg-allow-top-navigation', 'vg-allow-forms'],
          },
        },
      });

      interceptor(frame, 'vg1', undefined, undefined);

      expect(frame.getAttribute('allow')).toBe(
        'vg-clipboard-read; vg-clipboard-write;'
      );
      expect(frame.getAttribute('sandbox')).toBe(
        'vg-allow-top-navigation vg-allow-forms'
      );

      interceptor(frame2, 'vg1', node, undefined);

      expect(frame2.getAttribute('allow')).toBe(
        'clipboard-read; clipboard-write;'
      );
      expect(frame2.getAttribute('sandbox')).toBe(
        'allow-top-navigation allow-forms'
      );

      node.requiredIFramePermissions = undefined;
      interceptor(frame3, 'vg1', node, undefined);

      expect(frame3.getAttribute('allow')).toBe(
        'vg-clipboard-read; vg-clipboard-write;'
      );
      expect(frame3.getAttribute('sandbox')).toBe(
        'vg-allow-top-navigation vg-allow-forms'
      );
    });
  });

  describe('Theming query param sync', () => {
    let iframe: HTMLElement;

    beforeEach(() => {
      iframe = document.createElement('iframe');
    });

    it('should not do anything if no theme query param present', () => {
      iframe.setAttribute('src', 'https://foo.bar/#/bla/blub?x=y');

      interceptor(iframe, 'vg1', undefined, undefined);

      expect(iframe.getAttribute('src')).toEqual(
        'https://foo.bar/#/bla/blub?x=y'
      );
    });

    it('should not do anything if theme param already present in hash', () => {
      iframe.setAttribute(
        'src',
        'https://foo.bar/?sap-theme=t1#/bla/blub?x=y&sap-theme=t2'
      );

      interceptor(iframe, 'vg1', undefined, undefined);

      expect(iframe.getAttribute('src')).toEqual(
        'https://foo.bar/?sap-theme=t1#/bla/blub?x=y&sap-theme=t2'
      );
    });
  });
});
