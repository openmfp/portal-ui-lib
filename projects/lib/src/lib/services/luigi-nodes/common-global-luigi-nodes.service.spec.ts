import { TestBed } from '@angular/core/testing';
import { CommonGlobalLuigiNodesService } from './common-global-luigi-nodes.service';
import { LuigiNode } from '../../models';

describe('CommonGlobalLuigiNodesService', () => {
  let service: CommonGlobalLuigiNodesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommonGlobalLuigiNodesService],
    });
    service = TestBed.inject(CommonGlobalLuigiNodesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getContentNotFoundGlobalNode', () => {
    let result: LuigiNode;

    beforeEach(() => {
      result = service.getContentNotFoundGlobalNode();
    });

    it('should return a LuigiNode object', () => {
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Object);
    });

    it('should have correct top-level properties', () => {
      expect(result.pathSegment).toBe('error');
      expect(result.label).toBe('Content not found');
      expect(result.hideFromNav).toBe(true);
      expect(Array.isArray(result.children)).toBe(true);
    });

    it('should have one child node', () => {
      expect(result.children).toHaveLength(1);
    });

    describe('child node', () => {
      let childNode: LuigiNode;

      beforeEach(() => {
        childNode = result.children[0];
      });

      it('should have correct properties', () => {
        expect(childNode.pathSegment).toBe(':id');
        expect(childNode.hideSideNav).toBe(true);
        expect(childNode.viewUrl).toBe('/error-handling#:id');
        expect(childNode.context).toEqual({ id: ':id' });
        expect(childNode.loadingIndicator).toEqual({ enabled: false });
        expect(childNode.showBreadcrumbs).toBe(false);
      });
    });
  });
});
