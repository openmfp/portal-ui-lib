# Architecture & Code Documentation (ACD)

## Purpose

This document provides detailed technical information about the Portal UI Library's internal structure, API patterns, and implementation details. It is intended for developers contributing to the library or integrating deeply with its components.

## Component Structure

### Entry Point Components

#### PortalComponent

**Location**: `projects/lib/src/lib/components/portal/portal.component.ts`

**Responsibility**: Root component that bootstraps the portal application.

```typescript
@Component({
  selector: 'app-portal',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PortalComponent {}
```

**Key Features**:
- Sets `ui5-content-density-compact` class on document body
- Provides router outlet for navigation
- Standalone component (no NgModule required)

**Template**:
```html
<router-outlet></router-outlet>
```

#### LuigiComponent

**Location**: `projects/lib/src/lib/components/luigi/luigi.component.ts`

**Responsibility**: Container for Luigi framework initialization and rendering.

**Key Features**:
- Initializes Luigi with configuration
- Renders Luigi container
- Manages Luigi lifecycle

#### LogoutComponent

**Location**: `projects/lib/src/lib/components/logout/logout.component.ts`

**Responsibility**: Handles logout flow and cleanup.

### Configuration Service Modules

#### Portal Services

**Location**: `projects/lib/src/lib/services/portal/`

##### ConfigService

**Purpose**: Centralized configuration retrieval and caching.

**Key Methods**:

```typescript
class ConfigService {
  // Fetch and cache portal configuration
  async getPortalConfig(): Promise<PortalConfig>

  // Fetch entity-specific configuration
  async getEntityConfig(
    entity: string,
    context?: Record<string, string>
  ): Promise<EntityConfig>

  // Reload configuration (clears cache)
  async reloadConfig(
    entity: string,
    context?: Record<string, string>
  ): Promise<void>

  // Clear entity cache only
  clearEntityConfigCache(): void
}
```

**Caching Strategy**:
- Portal config cached as a single Promise
- Entity configs cached by entity type and context (JSON stringified)
- Cache invalidation available for reload scenarios

**Error Handling**:
- 403 errors redirect to `/logout?error=invalidToken`
- Errors are logged and propagated

##### AuthService

**Purpose**: Manages authentication state, token refresh, and user information.

**Key Methods**:

```typescript
class AuthService {
  // Observable for authentication events
  get authEvents(): Observable<AuthEvent>

  // Emit authentication event
  authEvent(event: AuthEvent): void

  // Refresh authentication token
  async refresh(): Promise<AuthTokenData | undefined>

  // Get current auth data
  getAuthData(): AuthData

  // Get ID token
  getToken(): string

  // Get user information from token
  getUserInfo(): UserData
}
```

**Authentication Events**:
```typescript
enum AuthEvent {
  AUTH_SUCCESSFUL = 'AuthSuccessful',
  AUTH_ERROR = 'AuthError',
  AUTH_EXPIRED = 'AuthExpired',
  AUTH_REFRESHED = 'AuthRefreshed',
  AUTH_EXPIRE_SOON = 'AuthExpireSoon',
  AUTH_CONFIG_ERROR = 'AuthConfigError',
  LOGOUT = 'Logout',
}
```

**Token Management**:
- Tokens stored in memory (not localStorage)
- JWT decoded to extract user information
- Expiration date calculated from `expires_in`

**User Info Extraction**:
Supports multiple JWT claim formats:
- `first_name` / `given_name`
- `last_name` / `family_name`
- `mail` / `email`
- `userId` / `sub`

##### EnvConfigService

**Purpose**: Retrieves client environment configuration.

**Key Methods**:

```typescript
class EnvConfigService {
  // Get environment configuration
  async getEnvConfig(): Promise<ClientEnvironment>
}
```

**Environment Config Structure**:
```typescript
interface ClientEnvironment {
  validWebcomponentUrls?: string[];
  uiOptions?: string[];
}
```

##### LocalNodesService

**Purpose**: Manages local development settings for node replacement.

**Key Methods**:

```typescript
class LocalNodesService {
  // Load local development settings
  async getLocalSettings(): Promise<LocalDevelopmentSettings>

  // Save local development settings
  async saveLocalSettings(
    settings: LocalDevelopmentSettings
  ): Promise<void>

  // Check if local development is active
  isLocalDevelopmentActive(): boolean
}
```

#### Luigi Configuration Services

**Location**: `projects/lib/src/lib/services/luigi-config/`

##### NavigationConfigService

**Purpose**: Builds Luigi navigation configuration from multiple sources.

**Key Method**:

```typescript
async getNavigationConfig(
  childrenByEntity: Record<string, LuigiNode[]>,
  envConfig: ClientEnvironment
): Promise<NavigationConfig>
```

**Configuration Assembly**:
1. Fetch portal configuration
2. Initialize feature toggles
3. Build global context
4. Process nodes through custom processors
5. Build view groups
6. Integrate app switcher
7. Configure profile
8. Setup intent mappings
9. Configure breadcrumbs

**Feature Toggle Initialization**:
- Base toggles from backend configuration
- Overrides from localStorage (if `enableFeatureToggleSetting` enabled)
- Merged into Luigi config

##### StaticSettingsConfigService

**Purpose**: Interface for providing Luigi general settings.

**Interface**:

```typescript
interface StaticSettingsConfigService {
  getStaticSettingsConfig(): any;
}
```

**Configuration Scope**:
- Header (title, logo, favicon)
- App loading indicator
- Links
- Responsive navigation
- Third-party cookies handling

##### RoutingConfigService

**Purpose**: Interface for Luigi routing configuration.

**Interface**:

```typescript
interface RoutingConfigService {
  // Initial routing config (during bootstrap)
  getInitialRoutingConfig(): any;

  // Final routing config (after Luigi init)
  getRoutingConfig(): any;
}
```

**Typical Configuration**:
- `useHashRouting` - Use hash-based routing
- `showModalPathInUrl` - Show modal state in URL
- `modalPathParam` - Parameter name for modal
- `pageNotFoundHandler` - 404 handler function

##### GlobalContextConfigService

**Purpose**: Builds Luigi global context object.

**Key Method**:

```typescript
async getGlobalContext(): Promise<GlobalContext>
```

**Default Global Context**:
```typescript
{
  portalContext: {...},        // From backend
  portalBaseUrl: string,       // Current origin
  userId: string,              // From token
  userEmail: string,           // From token
  token: string,               // ID token
  // ... extended context from custom service
}
```

##### LuigiExtendedGlobalContextConfigService

**Purpose**: Interface for extending global context with custom data.

**Interface**:

```typescript
interface LuigiExtendedGlobalContextConfigService {
  createLuigiExtendedGlobalContext(): Promise<ExtendedGlobalContext>;
}
```

**Use Case**: Add application-specific data available to all micro frontends.

##### UserSettingsConfigService

**Purpose**: Interface for user settings dialog configuration.

**Interface**:

```typescript
interface UserSettingsConfigService {
  getUserSettings(
    childrenByEntity: Record<string, LuigiNode[]>
  ): Promise<UserSettings>;
}
```

##### GlobalSearchConfigService

**Purpose**: Interface for Luigi global search configuration.

**Interface**:

```typescript
interface GlobalSearchConfigService {
  getGlobalSearchConfig(): any;
}
```

**Configuration Scope**:
- Search field position
- Search provider with event handlers
  - `onEnter`
  - `onSearchBtnClick`
  - `onEscape`

##### HeaderBarService (formerly LuigiBreadcrumbConfigService)

**Purpose**: Configures Luigi breadcrumbs with custom renderers.

**Key Method**:

```typescript
async getConfig(): Promise<HeaderBarConfig>
```

**Header Bar Configuration**:

```typescript
interface HeaderBarConfig {
  autoHide?: boolean;
  omitRoot?: boolean;
  pendingItemLabel?: string;
  rightRenderers?: RendererFunction[];
  leftRenderers?: RendererFunction[];
}

type RendererFunction = (
  containerElement: HTMLElement,
  nodeItems: NodeItem[],
  clickHandler: Function
) => void;
```

**Use Case**: Add custom UI elements to the breadcrumb area (e.g., actions, status indicators).

##### UserProfileConfigService

**Purpose**: Interface for Luigi user profile configuration.

**Interface**:

```typescript
interface UserProfileConfigService {
  getProfile(): Promise<UserProfile>;
}

interface UserProfile {
  logout?: {
    label: string;
    icon?: string;
  };
  items?: ProfileItem[];
}
```

##### AppSwitcherConfigService

**Purpose**: Configures Luigi app switcher.

**Default Implementation**: `AppSwitcherConfigServiceImpl`

**Key Method**:

```typescript
getAppSwitcher(luigiNodes: LuigiNode[]): AppSwitcher
```

##### AuthConfigService

**Purpose**: Configures Luigi OAuth2 authentication.

**Key Methods**:

```typescript
class AuthConfigService {
  // Get auth configuration
  getAuthConfig(): any

  // Trigger logout
  logout(): void
}
```

**OAuth2 Configuration**:
- Uses `@luigi-project/plugin-auth-oauth2`
- Configures authorization endpoint
- Sets token refresh behavior
- Handles logout flow

##### CustomMessageListenersService

**Purpose**: Manages custom message listeners for cross-micro frontend communication.

**Listener Interface**:

```typescript
interface CustomMessageListener {
  // Unique message ID to listen for
  messageId(): string;

  // Handler when message received
  onCustomMessageReceived(
    customMessage: string,
    mfObject: any,
    mfNodesObject: any
  ): void;
}
```

**Built-in Listener**: `ReloadLuigiConfigListener`
- Message ID: `reload-luigi-config`
- Triggers configuration reload

##### NodeChangeHookConfigService

**Purpose**: Interface for reacting to Luigi navigation changes.

**Interface**:

```typescript
interface NodeChangeHookConfigService {
  nodeChangeHook(
    prevNode: LuigiNode,
    nextNode: LuigiNode,
    currentContext: any
  ): void;
}
```

##### IframeService

**Purpose**: Manages iframe settings for micro frontends.

**Configuration Scope**:
- Sandbox attributes
- Allow policies
- Security settings

#### Luigi Node Services

**Location**: `projects/lib/src/lib/services/luigi-nodes/`

##### LuigiNodesService

**Purpose**: Retrieves and processes navigation nodes.

**Key Methods**:

```typescript
class LuigiNodesService {
  // Retrieve all nodes grouped by entity type
  async retrieveChildrenByEntity(): Promise<Record<string, LuigiNode[]>>

  // Retrieve children for specific entity
  async retrieveEntityChildren(
    entityDefinition: EntityDefinition,
    additionalContext?: Record<string, string>
  ): Promise<LuigiNode[]>

  // Node access policy resolver
  nodePolicyResolver(nodeToCheckPermissionFor: any): boolean

  // Clear node cache
  clearNodeCache(): void
}
```

**Node Grouping**:
Nodes are grouped by `entityType`:
- `home` - Default entity type
- `global` - Global navigation
- `global.topnav` - Top navigation bar
- Custom entity types - Application-specific

**Entity Definition**:

```typescript
interface EntityDefinition {
  dynamicFetchId: string;  // Entity type for API call
}
```

**Error Handling**:
- Uses `ErrorComponentConfig.handleEntityRetrievalError` if provided
- Falls back to alert display
- Returns empty array on error

##### NodesProcessingService

**Purpose**: Processes raw nodes before Luigi consumption.

**Key Method**:

```typescript
async processNodes(
  childrenByEntity: Record<string, LuigiNode[]>
): Promise<LuigiNode[]>
```

**Processing Steps**:
1. Group nodes by entity type
2. Process children for each entity
3. Apply custom node processing
4. Filter by node policies
5. Sort by priority

##### ChildrenNodesService

**Purpose**: Processes entity children nodes.

**Key Methods**:

```typescript
class ChildrenNodesService {
  // Process children for entity nodes
  async processEntityChildren(
    entityNodes: LuigiNode[]
  ): Promise<LuigiNode[]>

  // Process single node's children
  async processNodeChildren(
    node: LuigiNode
  ): Promise<LuigiNode>
}
```

##### NodeSortingService

**Purpose**: Sorts nodes by priority.

**Key Method**:

```typescript
sortNodes(nodes: LuigiNode[]): LuigiNode[]
```

**Sorting Logic**:
- Uses `order` property on nodes
- Lower numbers appear first
- Nodes without `order` appear last

##### NodeUtilsService

**Purpose**: Utility functions for node manipulation.

**Key Methods**:

```typescript
class NodeUtilsService {
  // Deep copy node
  cloneNode(node: LuigiNode): LuigiNode

  // Merge contexts
  mergeContexts(
    baseContext: any,
    additionalContext: any
  ): any

  // Check if node matches criteria
  matchesNode(
    node: LuigiNode,
    criteria: Partial<LuigiNode>
  ): boolean
}
```

##### IntentNavigationService

**Purpose**: Builds Luigi intent mappings for semantic navigation.

**Key Method**:

```typescript
buildIntentMappings(
  allNodes: LuigiNode[]
): Record<string, IntentMapping>
```

**Intent Mapping Structure**:
```typescript
interface IntentMapping {
  semanticObject: string;
  action: string;
  pathSegment: string;
}
```

##### LocalConfigurationService

**Purpose**: Handles local development mode node replacement.

**Key Method**:

```typescript
async replaceServerNodesWithLocalOnes(
  serverNodes: LuigiNode[],
  entityTypes: string[]
): Promise<LuigiNode[]>
```

**Replacement Logic**:
1. Check if local development is active
2. Fetch local configurations from configured URLs
3. Match nodes by `entityType` and `pathSegment`
4. Replace matching server nodes with local nodes
5. Add `serviceProviderConfig` to node context

**Content Configuration Format**:
```typescript
interface ContentConfiguration {
  nodes: LuigiNode[];
}
```

Loaded from URLs like: `http://localhost:4200/assets/content-configuration.json`

##### CustomGlobalNodesService

**Purpose**: Interface for adding global-level navigation nodes.

**Interface**:

```typescript
interface CustomGlobalNodesService {
  getCustomGlobalNodes(): Promise<LuigiNode[]>;
}
```

**Use Case**: Add nodes that appear at the root level (e.g., admin panels, settings).

##### CustomNodeProcessingService

**Purpose**: Interface for custom node transformation logic.

**Interface**:

```typescript
interface CustomNodeProcessingService {
  processNode(node: LuigiNode): Promise<LuigiNode>;
}
```

**Use Case**: Apply business logic to nodes (e.g., permission checks, URL transformation).

##### NodeContextProcessingService

**Purpose**: Interface for custom node context processing.

**Interface**:

```typescript
interface NodeContextProcessingService {
  processNodeContext(
    node: LuigiNode,
    context: any
  ): Promise<any>;
}
```

#### Supporting Services

##### LuigiCoreService

**Purpose**: Type-safe wrapper around Luigi's global API.

**Key Methods**:

```typescript
class LuigiCoreService {
  // Set Luigi configuration
  setConfig(config: any): void

  // Send custom message
  sendCustomMessage(message: any): void

  // Set feature toggles
  setFeatureToggles(toggles: Record<string, boolean>): void

  // Show alert
  showAlert(alert: { text: string; type: string }): void

  // Navigation methods
  navigate(path: string): void
  linkManager(): any
}
```

##### SessionRefreshService

**Purpose**: Automatically refreshes authentication tokens.

**Key Methods**:

```typescript
class SessionRefreshService {
  // Start monitoring token expiration
  startSessionRefresh(): void

  // Stop monitoring
  stopSessionRefresh(): void
}
```

**Refresh Strategy**:
- Monitors `accessTokenExpirationDate`
- Triggers refresh before expiration (configurable threshold)
- Emits `AuthEvent.AUTH_REFRESHED` on success
- Handles refresh failures

##### RequestHeadersService

**Purpose**: Builds HTTP request headers with authentication.

**Key Method**:

```typescript
createOptionsWithAuthHeader(): { headers: HttpHeaders }
```

**Headers Included**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

##### StorageService

**Purpose**: Provides typed localStorage access.

**Constants**:

```typescript
const featureToggleLocalStorage = {
  read: (): Record<string, boolean> => { ... },
  write: (toggles: Record<string, boolean>) => { ... }
};
```

##### NavigationRedirectStrategy

**Purpose**: Interface for managing post-login redirect URLs.

**Interface**:

```typescript
interface NavigationRedirectStrategy {
  getRedirectUrl(): string;
  saveRedirectUrl(url: string): void;
  clearRedirectUrl(): void;
}
```

**Default Implementation**: `DefaultNavigationRedirectStrategy`
- Uses `localStorage` with key `returnUrl`

##### ThemingService

**Purpose**: Interface for theme management.

**Interface**:

```typescript
interface ThemingService {
  applyTheme(theme: string): void;
  getCurrentTheme(): string;
}
```

##### I18nService

**Purpose**: Manages internationalization.

**Key Methods**:

```typescript
class I18nService {
  // Get translated text
  translate(key: string, params?: any): string

  // Change language
  setLanguage(language: string): void

  // Get current language
  getCurrentLanguage(): string
}
```

##### DependenciesVersionsService

**Purpose**: Tracks and reports library dependency versions.

**Use Case**: Debug version mismatches, report dependency information.

## State Management Patterns

### Configuration State

**Pattern**: Promise-based caching with single source of truth.

**Implementation**:
```typescript
private portalConfigCachePromise: Promise<PortalConfig> | undefined;

async getPortalConfig(): Promise<PortalConfig> {
  if (this.portalConfigCachePromise) {
    return this.portalConfigCachePromise;
  }

  this.portalConfigCachePromise = firstValueFrom(
    this.http.get<PortalConfig>('/rest/config')
  );

  return this.portalConfigCachePromise;
}
```

**Benefits**:
- Multiple concurrent calls share the same Promise
- No race conditions
- Automatic deduplication

### Authentication State

**Pattern**: In-memory state with Observable events.

**Implementation**:
```typescript
private authData: AuthData;
private authEventSubject = new Subject<AuthEvent>();

get authEvents(): Observable<AuthEvent> {
  return this.authEventSubject.asObservable();
}
```

**Benefits**:
- Reactive updates via Observable
- Decoupled components
- Type-safe events

### Feature Toggle State

**Pattern**: Dual storage (config + localStorage override).

**Implementation**:
```typescript
private initFeatureToggles(
  configFeatureToggles: Record<string, boolean>,
  envConfig: ClientEnvironment
) {
  if (envConfig.uiOptions?.includes('enableFeatureToggleSetting')) {
    const featureToggleSettings = featureToggleLocalStorage.read();
    this.luigiCoreService.setFeatureToggles({
      ...configFeatureToggles,
      ...featureToggleSettings,
    });
    return;
  }

  this.luigiCoreService.setFeatureToggles(configFeatureToggles);
}
```

**Benefits**:
- Backend control by default
- Developer overrides during testing
- Persists across page reloads

### Node Cache State

**Pattern**: Two-level caching (portal + entity).

**Implementation**:
```typescript
private entityConfigCache: Record<
  string /* entity */,
  Record<string /* ctx */, Promise<EntityConfig>>
> = {};

async getEntityConfig(
  entity: string,
  context?: Record<string, string>
): Promise<EntityConfig> {
  if (!this.entityConfigCache[entity]) {
    this.entityConfigCache[entity] = {};
  }

  const entityCacheKey = JSON.stringify(context);
  const cachedConfig = this.entityConfigCache[entity][entityCacheKey];
  if (cachedConfig) {
    return cachedConfig;
  }

  const entityConfig = firstValueFrom(/* fetch */);
  this.entityConfigCache[entity][entityCacheKey] = entityConfig;
  return entityConfig;
}
```

**Benefits**:
- Separate cache per entity type
- Context-aware caching
- Selective cache invalidation

## API Integration Utilities

### HTTP Request Pattern

**Standard Pattern**:
```typescript
const options = this.requestHeadersService.createOptionsWithAuthHeader();
return firstValueFrom(
  this.http.get<ResponseType>(url, options)
);
```

**With Parameters**:
```typescript
const options = {
  ...this.requestHeadersService.createOptionsWithAuthHeader(),
  params: context
};
return firstValueFrom(
  this.http.get<ResponseType>(url, options)
);
```

### Error Handling Pattern

**Standard Pattern**:
```typescript
try {
  const result = await this.configService.getEntityConfig(entity);
  return result;
} catch (e) {
  console.warn('Error message', e);
  return this.handleError(e);
}
```

**With HTTP Status Handling**:
```typescript
.catch((e) => {
  if (e instanceof HttpErrorResponse && e.status === 403) {
    window.location.assign('/logout?error=invalidToken');
  }
  throw e;
});
```

### Context Passing Pattern

**Luigi Node Context**:
```typescript
const node: LuigiNode = {
  // ... node properties
  context: {
    // Default context
    portalContext: { ... },
    portalBaseUrl: '...',
    userId: '...',
    token: '...',

    // Entity context (from backend)
    ...entityConfig.entityContext,

    // Local dev context
    serviceProviderConfig: { ... },

    // Extended context (custom)
    ...extendedGlobalContext
  }
};
```

## Usage Patterns

### Basic Integration

**Minimal Setup**:

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { providePortal, PortalComponent } from '@openmfp/portal-ui-lib';
import { appRoutes } from './app/app-routes';

bootstrapApplication(PortalComponent, {
  providers: [
    provideRouter(appRoutes),
    providePortal(),
  ]
});
```

**index.html**:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Portal</title>
    <base href="/">
    <link rel="stylesheet" href="/luigi-core/luigi_horizon.css" />
  </head>
  <body>
    <script src="/luigi-core/luigi.js"></script>
    <app-portal></app-portal>
  </body>
</html>
```

**angular.json**:
```json
{
  "assets": [
    {
      "glob": "**",
      "input": "node_modules/@luigi-project/core",
      "output": "/luigi-core"
    },
    {
      "glob": "**",
      "input": "node_modules/@openmfp/portal-ui-lib/assets/",
      "output": "/assets/"
    }
  ]
}
```

### Custom Configuration

**With Custom Services**:

```typescript
// Custom static settings
@Injectable()
export class CustomStaticSettingsService
  implements StaticSettingsConfigService
{
  getStaticSettingsConfig() {
    return {
      header: {
        title: 'My Portal',
        logo: 'assets/logo.svg',
        favicon: 'assets/favicon.ico',
      },
      appLoadingIndicator: {
        hideAutomatically: true,
      },
    };
  }
}

// Custom global context
@Injectable()
export class CustomGlobalContextService
  implements LuigiExtendedGlobalContextConfigService
{
  async createLuigiExtendedGlobalContext() {
    return {
      environment: 'production',
      analyticsEnabled: true,
    };
  }
}

// Main.ts
const portalOptions: PortalOptions = {
  staticSettingsConfigService: CustomStaticSettingsService,
  luigiExtendedGlobalContextConfigService: CustomGlobalContextService,
};

bootstrapApplication(PortalComponent, {
  providers: [
    provideRouter(appRoutes),
    providePortal(portalOptions),
  ]
});
```

### Custom Message Communication

**Sending Messages**:

```typescript
import { inject } from '@angular/core';
import { LuigiCoreService } from '@openmfp/portal-ui-lib';

export class MyComponent {
  private luigiCore = inject(LuigiCoreService);

  notifyOtherMicrofrontends() {
    this.luigiCore.sendCustomMessage({
      id: 'data-updated',
      data: { timestamp: Date.now() }
    });
  }
}
```

**Receiving Messages**:

```typescript
import { Injectable } from '@angular/core';
import { CustomMessageListener } from '@openmfp/portal-ui-lib';

@Injectable()
export class DataUpdateListener implements CustomMessageListener {
  messageId(): string {
    return 'data-updated';
  }

  onCustomMessageReceived(customMessage: any, mfObject: any, mfNodesObject: any) {
    console.log('Received update:', customMessage.data);
    // Handle the message
  }
}

// Register in main.ts
const portalOptions: PortalOptions = {
  customMessageListeners: [DataUpdateListener],
};
```

### Authentication Event Handling

**Listening to Auth Events**:

```typescript
import { inject, Injectable } from '@angular/core';
import { AuthService, AuthEvent } from '@openmfp/portal-ui-lib';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MyAuthHandler {
  private authService = inject(AuthService);

  constructor() {
    this.authService.authEvents
      .pipe(
        filter(event => event === AuthEvent.AUTH_SUCCESSFUL)
      )
      .subscribe(() => {
        console.log('User authenticated successfully');
        // Initialize user-specific data
      });

    this.authService.authEvents
      .pipe(
        filter(event => event === AuthEvent.AUTH_EXPIRED)
      )
      .subscribe(() => {
        console.log('Session expired');
        // Show session expired message
      });
  }
}
```

### Local Development Setup

**Enable Local Development**:

1. Create `content-configuration.json` in your micro frontend:

```json
{
  "nodes": [
    {
      "label": "My Feature",
      "entityType": "project",
      "pathSegment": "my-feature",
      "viewUrl": "/my-feature",
      "context": {
        "title": "My Feature"
      }
    }
  ]
}
```

2. Serve your micro frontend on `localhost:4200`

3. In portal development settings:
   - Enable "Development Mode Active"
   - Add configuration URL: `http://localhost:4200/assets/content-configuration.json`
   - Add service provider config (optional): `{"key": "value"}`
   - Save settings

4. Navigate to where your feature should appear - local version will be loaded

### Dynamic Node Loading

**Entity-Based Navigation**:

```typescript
const node: LuigiNode = {
  label: 'Projects',
  pathSegment: 'projects',
  entityType: 'project-list',
  children: [
    {
      pathSegment: ':projectId',
      entityType: 'project',
      dynamicFetchId: 'project',  // Triggers GET /rest/config/project
      viewUrl: '/project/:projectId',
      context: {
        projectId: ':projectId'  // Will be resolved from URL
      }
    }
  ]
};
```

When navigating to `/projects/123`:
1. Luigi resolves `:projectId` to `123`
2. Library calls `GET /rest/config/project?projectId=123`
3. Backend returns entity-specific children
4. Children are added to navigation tree

### Custom Error Handling

**Override Default Error Behavior**:

```typescript
const errorComponentConfig: ErrorComponentConfig = {
  handleEntityRetrievalError: (
    entityDefinition: EntityDefinition,
    errorCode: number,
    additionalContext?: Record<string, string>
  ): LuigiNode[] => {
    if (errorCode === 404) {
      return [{
        pathSegment: 'not-found',
        label: 'Not Found',
        viewUrl: '/error/404',
        context: { errorCode: 404 }
      }];
    }

    if (errorCode === 403) {
      return [{
        pathSegment: 'forbidden',
        label: 'Access Denied',
        viewUrl: '/error/403'
      }];
    }

    return [{
      pathSegment: 'error',
      label: 'Error',
      viewUrl: `/error/${errorCode}`
    }];
  }
};

const portalOptions: PortalOptions = {
  errorComponentConfig,
};
```

### Custom Navigation Redirect Strategy

**Use SessionStorage Instead of LocalStorage**:

```typescript
@Injectable()
export class SessionNavigationRedirectStrategy
  implements NavigationRedirectStrategy
{
  getRedirectUrl(): string {
    return sessionStorage.getItem('returnUrl') || '/';
  }

  saveRedirectUrl(url: string): void {
    sessionStorage.setItem('returnUrl', url);
  }

  clearRedirectUrl(): void {
    sessionStorage.removeItem('returnUrl');
  }
}

const portalOptions: PortalOptions = {
  navigationRedirectStrategy: SessionNavigationRedirectStrategy,
};
```

## Configuration Options

### PortalOptions Interface

```typescript
interface PortalOptions {
  // Luigi general settings (header, logo, etc.)
  staticSettingsConfigService?: Type<StaticSettingsConfigService>;

  // Custom message listeners for cross-MFE communication
  customMessageListeners?: Type<CustomMessageListener>[];

  // Local development configuration
  localConfigurationService?: Type<LocalConfigurationService>;

  // Global search configuration
  globalSearchConfigService?: Type<GlobalSearchConfigService>;

  // App switcher configuration
  appSwitcherConfigService?: Type<AppSwitcherConfigService>;

  // Extended global context data
  luigiExtendedGlobalContextConfigService?: Type<LuigiExtendedGlobalContextConfigService>;

  // Custom global-level navigation nodes
  customGlobalNodesService?: Type<CustomGlobalNodesService>;

  // Node context processing
  nodeContextProcessingService?: Type<NodeContextProcessingService>;

  // User profile dropdown configuration
  userProfileConfigService?: Type<UserProfileConfigService>;

  // Breadcrumb/header bar configuration
  headerBarConfigService?: Type<HeaderBarConfigService>;

  // Node change hook
  nodeChangeHookConfigService?: Type<NodeChangeHookConfigService>;

  // Custom node processing
  customNodeProcessingService?: Type<CustomNodeProcessingService>;

  // Authentication event callbacks
  luigiAuthEventsCallbacksService?: Type<LuigiAuthEventsCallbacksService>;

  // Error handling configuration
  errorComponentConfig?: ErrorComponentConfig;

  // Theme management
  themingService?: Type<ThemingService>;

  // Luigi routing configuration
  routingConfigService?: Type<RoutingConfigService>;

  // Redirect URL storage strategy
  navigationRedirectStrategy?: Type<NavigationRedirectStrategy>;
}
```

### Default Implementations

Services with default implementations:
- `AppSwitcherConfigService` → `AppSwitcherConfigServiceImpl`
- `UserProfileConfigService` → `DefaultUserProfileConfigService`
- `NavigationRedirectStrategy` → `DefaultNavigationRedirectStrategy`

Services without defaults (optional):
- `StaticSettingsConfigService`
- `RoutingConfigService`
- `LuigiExtendedGlobalContextConfigService`
- `CustomGlobalNodesService`
- `NodeContextProcessingService`
- `CustomNodeProcessingService`
- `NodeChangeHookConfigService`
- `LuigiAuthEventsCallbacksService`
- `GlobalSearchConfigService`
- `HeaderBarConfigService`
- `ThemingService`
- `LocalConfigurationService`

### Injection Tokens

All services use injection tokens for dependency injection:

```typescript
export const LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN =
  new InjectionToken<StaticSettingsConfigService>('...');

export const LUIGI_AUTH_EVENTS_CALLBACKS_SERVICE_INJECTION_TOKEN =
  new InjectionToken<LuigiAuthEventsCallbacksService>('...');

// ... and more
```

This allows services to be optional and overridable.

## Testing Utilities

### Test Setup

**Vitest Configuration**:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95,
    },
  },
});
```

### Mocking Services

**Mock ConfigService**:

```typescript
import { vi } from 'vitest';

const mockConfigService = {
  getPortalConfig: vi.fn().mockResolvedValue({
    providers: [],
    portalContext: {},
    featureToggles: {},
  }),
  getEntityConfig: vi.fn().mockResolvedValue({
    providers: [],
    entityContext: {},
  }),
};
```

**Mock AuthService**:

```typescript
const mockAuthService = {
  authEvents: new Subject<AuthEvent>(),
  getAuthData: vi.fn().mockReturnValue({
    idToken: 'mock-token',
    accessTokenExpirationDate: Date.now() + 3600000,
  }),
  getUserInfo: vi.fn().mockReturnValue({
    name: 'Test User',
    email: 'test@example.com',
    userId: 'test-user-id',
  }),
};
```

## Performance Considerations

### Caching Strategy

**Cache Levels**:
1. **Portal Config** - Single Promise cache, cleared on explicit reload
2. **Entity Config** - Two-level map (entity → context → Promise)
3. **Luigi Nodes** - Cached by ConfigService, cleared via `clearNodeCache()`

### Lazy Loading

**Entity Children**: Loaded on-demand when navigating to entity routes.

**Custom Message Listeners**: Registered at startup but only invoked when messages received.

### Bundle Size Optimization

**Tree Shaking**: Library uses Angular's build optimizer for tree shaking.

**Web Components**: Built separately to avoid bloating main bundle.

**Peer Dependencies**: Heavy dependencies (Angular, Luigi, UI5) are peer dependencies.

## Security Considerations

### Token Management

- Tokens stored in memory only (not localStorage)
- Tokens included in HTTP headers for backend calls
- Automatic token refresh before expiration
- 403 errors trigger logout flow

### CSRF Protection

- Backend should implement CSRF protection
- Library passes tokens in Authorization header

### Content Security Policy

Applications should configure CSP to allow:
- Luigi framework scripts
- Micro frontend iframe sources
- API endpoints

### Iframe Sandbox

Configure via `IframeService` to restrict capabilities:
- `allow-scripts`
- `allow-same-origin`
- `allow-forms`
- etc.

## Migration Guide

### From Older Versions

**Breaking Changes**:
- Service interfaces may have changed method signatures
- Check CHANGELOG for version-specific breaking changes

**Recommended Approach**:
1. Update package version in `package.json`
2. Run `npm install`
3. Update Luigi peer dependencies
4. Check for TypeScript compilation errors
5. Update custom service implementations if needed
6. Run tests

## Troubleshooting

### Common Issues

**Issue**: Portal config not loading
- **Check**: Backend is running and `/rest/config` endpoint is accessible
- **Check**: Proxy configuration in `angular.json`
- **Check**: CORS headers from backend

**Issue**: Authentication fails
- **Check**: Auth server configuration
- **Check**: Redirect URIs configured correctly
- **Check**: Token endpoint accessible

**Issue**: Local development nodes not appearing
- **Check**: Development mode is active in settings
- **Check**: Configuration URL is accessible from portal domain
- **Check**: `content-configuration.json` format is valid
- **Check**: `entityType` and `pathSegment` match server nodes

**Issue**: Micro frontend not loading in iframe
- **Check**: `viewUrl` is correct
- **Check**: CORS headers allow iframe embedding
- **Check**: CSP allows iframe source
- **Check**: Micro frontend is running

### Debug Mode

Enable verbose logging:

```typescript
// In browser console
localStorage.setItem('luigi.debug', 'true');
location.reload();
```

### Network Inspection

Monitor network requests:
- `GET /rest/config` - Portal configuration
- `GET /rest/config/:entity` - Entity configuration
- `POST /rest/auth/refresh` - Token refresh
- Micro frontend URL requests

## Related Resources

- [Architecture Documentation](./ARCHITECTURE.md)
- [Local Setup Guide](./readme-local-setup.md)
- [Node Configuration](./readme-nodes-configuration.md)
- [Luigi Context](./readme-luigi-context.md)
- [Luigi Documentation](https://docs.luigi-project.io/)
- [Portal Server Library](https://github.com/openmfp/portal-server-lib)
- [OpenMFP Documentation](https://openmfp.org/)
