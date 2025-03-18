import { ApolloFactory } from '../../../services/apollo-factory';
import { generateFields } from '../../../utils/columns-to-gql-fields';
import { ListViewComponent } from './list-view.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LinkComponent } from '@fundamental-ngx/core';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import * as gqlBuilder from 'gql-query-builder';
import jsonpath from 'jsonpath';
import { of, throwError } from 'rxjs';

jest.mock('../../../utils/columns-to-gql-fields', () => ({
  generateFields: jest.fn().mockImplementation((columns) => {
    return [{ metadata: ['name'] }];
  }),
}));

describe('ListViewComponent', () => {
  let component: ListViewComponent;
  let fixture: ComponentFixture<ListViewComponent>;
  let mockApollo: jest.Mocked<Apollo>;
  let mockApolloFactory: Partial<ApolloFactory>;
  let mockLuigiClient: any;
  let mockSubscriptionResult: any;

  beforeEach(async () => {
    mockApollo = {
      subscribe: jest.fn(),
    } as unknown as jest.Mocked<Apollo>;

    mockApolloFactory = {
      apollo: mockApollo,
    };

    mockLuigiClient = {
      linkManager: jest.fn().mockReturnValue({
        navigate: jest.fn(),
      }),
    };

    mockSubscriptionResult = of({
      data: { test_group_resources: [{ id: '1' }] },
    });
    mockApollo.subscribe.mockReturnValue(mockSubscriptionResult);

    await TestBed.configureTestingModule({
      imports: [ListViewComponent, LinkComponent],
      providers: [
        { provide: ApolloFactory, useValue: mockApolloFactory },
        HttpLink,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ListViewComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set properties from context input', () => {
    const context = {
      group: 'test.group',
      plural: 'resources',
      genericUI: {
        columns: [{ property: 'test.property', label: 'Test' }],
      },
    };

    component.context = context;

    expect(component.group).toBe('test.group');
    expect(component.plural).toBe('resources');
    expect(component.operation).toBe('test_group_resources');
    expect(component.columns).toEqual([
      { property: 'test.property', label: 'Test' },
    ]);
    expect(component.heading).toBe('Resources');
  });

  it('should use default columns when not provided in context', () => {
    const context = {
      group: 'test.group',
      plural: 'resources',
    };

    component.context = context;

    expect(component.columns).toEqual([
      { property: 'metadata.name', label: 'Name' },
      {
        property: 'status.conditions[?(@.type=="Ready")].status',
        label: 'Ready',
      },
    ]);
  });

  it('should replace dots with underscores in operation name', () => {
    const context = {
      group: 'api.test.group',
      plural: 'resources',
    };

    component.context = context;

    expect(component.operation).toBe('api_test_group_resources');
  });

  it('should capitalize first letter of plural for heading', () => {
    const context = {
      group: 'test.group',
      plural: 'resources',
    };

    component.context = context;

    expect(component.heading).toBe('Resources');
  });

  it('should subscribe to GraphQL query on init', () => {
    const subscriptionSpy = jest
      .spyOn(gqlBuilder, 'subscription')
      .mockReturnValue({
        query: 'subscription { test_group_resources { metadata { name } } }',
        variables: {},
      });

    component.context = {
      group: 'test.group',
      plural: 'resources',
    };
    component.ngOnInit();

    expect(generateFields).toHaveBeenCalledWith(component.columns);
    expect(subscriptionSpy).toHaveBeenCalledWith({
      operation: 'test_group_resources',
      fields: [{ metadata: ['name'] }],
      variables: {},
    });
    expect(mockApollo.subscribe).toHaveBeenCalled();
    expect(component.resources).toEqual([{ id: '1' }]);
  });

  it('should handle GraphQL subscription errors', () => {
    const mockError = throwError(() => new Error('Test error'));
    mockApollo.subscribe.mockReturnValue(mockError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    component.context = {
      group: 'test.group',
      plural: 'resources',
    };
    component.ngOnInit();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error executing GraphQL query',
      expect.any(Error),
    );
  });

  it('should navigate to account when clicked', () => {
    component.LuigiClient = mockLuigiClient;
    const mockItem = { metadata: { name: 'test-name' } };

    component.navigateToResource(mockItem);

    expect(mockLuigiClient.linkManager).toHaveBeenCalled();
    expect(mockLuigiClient.linkManager().navigate).toHaveBeenCalledWith(
      'test-name',
    );
  });

  it('should get nested value using jsonpath', () => {
    const jsonpathSpy = jest
      .spyOn(jsonpath, 'query')
      .mockReturnValue(['test-value']);

    const testItem = { metadata: { name: 'test-name' } };
    const result = component.getNestedValue(testItem, {
      property: 'metadata.name',
      label: 'Test name',
    });

    expect(jsonpathSpy).toHaveBeenCalledWith(testItem, '$.metadata.name');
    expect(result).toBe('test-value');
  });

  it('should return undefined for non-existent jsonpath', () => {
    jest.spyOn(jsonpath, 'query').mockReturnValue([]);

    const testItem = { metadata: { name: 'test-name' } };
    const result = component.getNestedValue(testItem, {
      property: 'nonexistent.path',
      label: 'Test name',
    });

    expect(result).toBeUndefined();
  });
});
