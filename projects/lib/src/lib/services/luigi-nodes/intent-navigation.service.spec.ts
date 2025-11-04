import { LuigiNode } from '../../models/luigi';
import { IntentNavigationService } from './intent-navigation.service';
import { TestBed } from '@angular/core/testing';
import { NodeContext } from '@openmfp/portal-ui-lib';

describe('Intent Navigation functions', () => {
  let service: IntentNavigationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IntentNavigationService],
    }).compileComponents();
    service = TestBed.inject(IntentNavigationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('Build final intent mappings: buildIntentMappings', () => {
    it('Build intent mapping with one intentMapping pre-defined', () => {
      const nodes: LuigiNode[] = [
        {
          label: 'someRandomLabel',
          pathSegment: 'someparentPath',
          context: {} as NodeContext,
          _intentMappings: [
            {
              baseEntityId: 'project.alpha',
              relativePath: '/some/own/target/node/path',
              semanticObject: 'Alfa',
              action: 'view',
              // pathSegment: should be undefined here
            },
          ],
          _entityRelativePaths: {
            project: {
              pathSegment: '/projects/:projectId',
              parentEntity: 'global',
            },
            alpha: {
              pathSegment: '/components/:alphaId',
              parentEntity: 'project',
            },
          },
        },
        {
          pathSegment: 'someparentPath',
          context: {} as NodeContext,
        },
      ];

      const expectedIntentMapping = [
        {
          baseEntityId: 'project.alpha',
          relativePath: '/some/own/target/node/path',
          semanticObject: 'Alfa',
          action: 'view',
          pathSegment:
            '/projects/:projectId/components/:alphaId/some/own/target/node/path',
        },
      ];
      const intentMappings = service.buildIntentMappings(nodes);
      expect(intentMappings).toBeDefined();
      expect(intentMappings).toStrictEqual(expectedIntentMapping);
    });

    it('Build intent mapping with multiple intentMapping pre-defined', () => {
      const nodes: LuigiNode[] = [
        {
          label: 'someRandomLabel',
          pathSegment: 'someparentPath',
          context: {} as NodeContext,
          _intentMappings: [
            {
              baseEntityId: 'project.beta',
              relativePath: '/some/beta/target/path',
              semanticObject: 'Alfa',
              action: 'view',
              // pathSegment: should be undefined here
            },
            {
              baseEntityId: 'project.component',
              relativePath: '/some/other/target',
              semanticObject: 'Other',
              action: 'view',
              // pathSegment: should be undefined here
            },
            {
              baseEntityId: 'project',
              relativePath: '/my/own/project/target',
              semanticObject: 'Own',
              action: 'view',
              // pathSegment: should be undefined here
            },
          ],
          _entityRelativePaths: {
            beta: {
              pathSegment: '/versions/:beta',
              parentEntity: 'project',
            },
            project: {
              pathSegment: '/projects/:projectId',
              parentEntity: 'global',
            },
            component: {
              pathSegment: '/components/:componentId',
              parentEntity: 'project',
            },
          },
        },
        {
          pathSegment: 'someparentPath',
          context: {} as NodeContext,
        },
      ];

      const expectedIntentMapping = [
        {
          baseEntityId: 'project.beta',
          relativePath: '/some/beta/target/path',
          semanticObject: 'Alfa',
          action: 'view',
          pathSegment:
            '/projects/:projectId/versions/:beta/some/beta/target/path',
        },
        {
          baseEntityId: 'project.component',
          relativePath: '/some/other/target',
          semanticObject: 'Other',
          action: 'view',
          pathSegment:
            '/projects/:projectId/components/:componentId/some/other/target',
        },
        {
          baseEntityId: 'project',
          relativePath: '/my/own/project/target',
          semanticObject: 'Own',
          action: 'view',
          pathSegment: '/projects/:projectId/my/own/project/target',
        },
      ];
      const intentMappings = service.buildIntentMappings(nodes);
      expect(intentMappings).toBeDefined();
      expect(intentMappings).toStrictEqual(expectedIntentMapping);
    });
  });

  describe('removeDuplicate slash', () => {
    it('test multiple slashes in path', () => {
      const expectedPath = '/test/project/:projectId/component/:componentId/';

      const cleanedPath = service.removeDuplicateSlash(
        '//test/project/:projectId//component/:componentId///',
      );
      expect(cleanedPath).toEqual(expectedPath);
    });
  });
});
