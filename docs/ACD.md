# Architecture & Code Documentation (ACD)

## Overview

This document provides the architectural decisions and technical design for the Portal UI Library (`@openmfp/portal-ui-lib`), an Angular-based library that enables applications to consume Luigi micro frontend framework configurations dynamically.

**Purpose**: Provide portal server applications with authentication, dynamic navigation, and local development capabilities for Luigi-based micro frontend architectures.

**Related Documentation**:
- [Detailed Architecture](./ARCHITECTURE.md) - Complete architectural overview with diagrams
- [Local Setup Guide](./readme-local-setup.md) - Local development configuration
- [Nodes Configuration](./readme-nodes-configuration.md) - Navigation node structure
- [Luigi Context](./readme-luigi-context.md) - Context data patterns

---

## 1. Requirements

### Major Architectural Requirements

- **Dynamic Configuration**: Library must consume Luigi configuration from backend services at runtime, not compile-time
- **Authentication Integration**: Seamless OAuth2 authentication with Auth Server and automatic token refresh
- **Micro Frontend Support**: Enable multiple teams to develop and deploy micro frontends independently
- **Local Development**: Allow developers to test local micro frontends in a portal environment without deploying
- **Cross-Framework Communication**: Support custom messages between micro frontends regardless of framework
- **Entity-Based Navigation**: Dynamic loading of navigation nodes based on context (projects, accounts, etc.)

### Technical Requirements

- **Framework**: Angular 20+ with standalone components
- **Browser Support**: Modern browsers (ES2022+)
- **Build Artifacts**:
  - NPM package with TypeScript definitions
  - Standalone web components for development tools
- **Testing**: 95% code coverage for library, 95% for web components

---

## 2. Product/Service Specific Qualities

### Critical Success Factors

- **Developer Experience**: Simple integration with minimal boilerplate (single `providePortal()` call)
- **Extensibility**: All configuration services are optional and overridable via dependency injection
- **Performance**: Promise-based caching prevents duplicate configuration requests
- **Security**: Tokens stored in memory only, automatic 403 handling redirects to logout
- **Reliability**: Automatic token refresh prevents session expiration during user activity

### Quality Attributes

- **Modularity**: Standalone Angular components, no NgModule required
- **Type Safety**: Full TypeScript support with exported interfaces for all extension points
- **Testability**: High test coverage with Vitest, all services injectable and mockable
- **Documentation**: Comprehensive inline documentation, examples for all extension points

---

## 3. Architectural Design Decisions

### 3.1 Technology Decisions

#### Frontend Framework: Angular 20+

**Decision**: Use Angular with standalone components architecture.

**Rationale**:
- Standalone components eliminate NgModule complexity
- Modern dependency injection with `inject()` function
- Strong TypeScript integration for type safety
- Angular CLI tooling for library development (`ng-packagr`)

**Implementation**: See [ARCHITECTURE.md](./ARCHITECTURE.md#component-architecture) for component structure.

#### Luigi Micro Frontend Framework

**Decision**: Build on top of Luigi framework for micro frontend orchestration.

**Rationale**:
- Industry-proven micro frontend solution
- Framework-agnostic for micro frontends (Angular, React, Vue, etc.)
- Built-in authentication support via plugins
- Extensive navigation and routing capabilities
- Active open source community

**Dependencies**:
- `@luigi-project/core` - Core framework
- `@luigi-project/client` - Client API for micro frontends
- `@luigi-project/client-support-angular` - Angular integration
- `@luigi-project/plugin-auth-oauth2` - OAuth2 authentication

#### UI Components: SAP UI5 Web Components

**Decision**: Use `@fundamental-ngx/ui5-webcomponents` for UI elements.

**Rationale**:
- SAP Fiori design system compliance
- Web components work across frameworks
- Accessibility built-in
- Consistent with SAP ecosystem

#### Testing Framework: Vitest

**Decision**: Use Vitest instead of Karma/Jasmine.

**Rationale**:
- Faster test execution (native ESM support)
- Modern API with better TypeScript support
- Compatible with Angular testing utilities
- Better developer experience with watch mode

**Coverage Requirements**:
- Library: 95% statements, 90% branches, 95% functions, 95% lines
- Web components: 95% statements, 75% branches, 95% functions, 95% lines

#### Build System: Dual Build Strategy

**Decision**: Build two separate artifacts (library + web components).

**Rationale**:
- **Library**: Standard Angular library for NPM consumption
  - Uses `ng-packagr` for optimal tree-shaking
  - TypeScript definitions included
  - i18n translations bundled
- **Web Components**: Standalone development tools
  - Uses `ngx-build-plus` for single bundle output
  - No dependency on consuming application
  - Can be loaded in any environment

**Build Commands**:
```bash
npm run build      # Build both artifacts
npm run build:lib  # Library only
npm run build:wc   # Web components only
```

---

### 3.2 Architecture Decisions (Non-Technology)

#### Provider-Based Configuration

**Decision**: Use functional provider pattern (`providePortal()`) instead of NgModule imports.

**Rationale**:
- Aligns with Angular standalone components
- Simpler API surface (single function call)
- Better tree-shaking support
- Clearer dependency injection

**Implementation**:
```typescript
bootstrapApplication(PortalComponent, {
  providers: [
    provideRouter(appRoutes),
    providePortal(portalOptions),
  ]
});
```

#### Promise-Based Caching Pattern

**Decision**: Cache configuration as Promises, not resolved values.

**Rationale**:
- Multiple concurrent calls share the same Promise (no race conditions)
- Automatic deduplication of requests
- Handles async operations cleanly
- Memory efficient (single Promise per resource)

**Implementation**: See [ARCHITECTURE.md - State Management Patterns](./ARCHITECTURE.md#state-management-patterns).

#### In-Memory Token Storage

**Decision**: Store authentication tokens in memory, not localStorage.

**Rationale**:
- Security: Prevents XSS attacks from stealing tokens
- Session management: Tokens cleared on browser close
- Automatic cleanup: No manual token cleanup required

**Trade-off**: User must re-authenticate on page reload (acceptable for security).

#### Entity-Based Dynamic Loading

**Decision**: Load navigation nodes dynamically based on entity context.

**Rationale**:
- Scalability: Navigation doesn't grow with number of entities
- Performance: Only load nodes when needed
- Flexibility: Each entity can have different navigation structure
- Context-aware: Nodes can vary based on entity state

**Implementation**: See [Nodes Configuration](./readme-nodes-configuration.md).

#### Local Development Mode

**Decision**: Support replacing server nodes with local configurations via URL.

**Rationale**:
- Developer experience: Test micro frontends without deployment
- Fast feedback: See changes immediately
- Independence: Develop without relying on server changes
- Configuration testing: Validate node configurations locally

**Implementation**: See [Local Setup Guide](./readme-local-setup.md).

---

### 3.3 Usage of Services (Internal/External)

#### Internal Services

| Service | Purpose | Reference |
|---------|---------|-----------|
| **ConfigService** | Portal and entity configuration retrieval | [ACD - Configuration Services](./ARCHITECTURE.md#configservice) |
| **AuthService** | Authentication state and token management | [ACD - Authentication Services](./ARCHITECTURE.md#authservice) |
| **LuigiNodesService** | Navigation node retrieval and processing | [ACD - Luigi Node Services](./ARCHITECTURE.md#luiginodesservice) |
| **NavigationConfigService** | Luigi navigation configuration assembly | [ACD - Luigi Configuration Services](./ARCHITECTURE.md#navigationconfigservice) |
| **LuigiCoreService** | Type-safe wrapper for Luigi global API | [ACD - Supporting Services](./ARCHITECTURE.md#luigicoreservice) |
| **SessionRefreshService** | Automatic token refresh before expiration | [ACD - Supporting Services](./ARCHITECTURE.md#sessionrefreshservice) |

#### External Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **Portal Server** | Provides portal and entity configurations | Proxied via `/rest/**` (see [README - Configure Proxy](../README.md#configure-proxy-for-backend-rest-calls)) |
| **Auth Server** | OAuth2 authentication and token refresh | Configured via AuthConfigService |

**Service Dependencies**:
- Library depends on [portal-server-lib](https://github.com/openmfp/portal-server-lib) for backend integration
- Micro frontends can use `@luigi-project/client` to communicate with portal

---

### 3.4 Offered APIs (Library Exports)

#### Core Exports

**Provider Function**:
- `providePortal(options?: PortalOptions)` - Main provider for dependency injection

**Components**:
- `PortalComponent` - Root component for bootstrapping

**Services** (Injectable):
- `AuthService` - Authentication management
- `ConfigService` - Configuration retrieval
- `LuigiCoreService` - Luigi API wrapper
- `LuigiNodesService` - Node management

**Models** (Types/Interfaces):
- `LuigiNode` - Navigation node definition
- `PortalConfig`, `EntityConfig` - Configuration structures
- `AuthData`, `UserData`, `AuthEvent` - Authentication types
- `PortalOptions` - Provider configuration

**Extension Interfaces**:
- `StaticSettingsConfigService` - Luigi general settings
- `RoutingConfigService` - Routing configuration
- `LuigiExtendedGlobalContextConfigService` - Global context extension
- `CustomMessageListener` - Custom message handling
- `NavigationRedirectStrategy` - Redirect URL storage
- Many more (see [ACD - Configuration Options](./ARCHITECTURE.md#portaloptions-interface))

**Utilities**:
- `CustomReuseStrategy` - Angular route reuse strategy
- JMESPath utilities - JSON query functions

**Full API Surface**: See `projects/lib/src/public-api.ts` for complete exports.

---

### 3.5 APIs Used (Internal/External)

#### Backend REST APIs

**Portal Configuration API**:
```
GET /rest/config
Response: { providers: [], portalContext: {}, featureToggles: {} }
```

**Entity Configuration API**:
```
GET /rest/config/:entity?param1=value1
Response: { providers: [], entityContext: {} }
```

**Authentication API**:
```
POST /rest/auth/refresh
Response: { idToken: "...", expiresIn: 3600 }
```

**Error Handling**:
- 403 errors redirect to `/logout?error=invalidToken`
- Other errors logged and propagated

**API Documentation**: Backend APIs provided by [portal-server-lib](https://github.com/openmfp/portal-server-lib).

#### Luigi Framework APIs

**Luigi Core API** (via LuigiCoreService):
- `setConfig(config)` - Set Luigi configuration
- `sendCustomMessage(message)` - Send cross-micro frontend messages
- `setFeatureToggles(toggles)` - Update feature toggles
- `navigate(path)` - Programmatic navigation
- `showAlert(alert)` - Display alerts

**Luigi Client API** (used by micro frontends):
- Micro frontends use `@luigi-project/client` to communicate with portal
- Not directly used by library (library is the portal, not a micro frontend)

---

### 3.6 Deployment Process

#### Build Process

**Build Command**:
```bash
npm run build
```

**Build Steps**:
1. Build library with `ng build lib` (uses ng-packagr)
2. Convert XLIFF translations to JSON
3. Build web components with `ng build wc` (uses ngx-build-plus)
4. Rename web component bundle to `openmfp-portal-ui-wc.js`
5. Copy web components to `dist/` directory

**Build Output**:
- `dist/` - NPM package ready for publishing
  - Library code with TypeScript definitions
  - Asset files (translations, Luigi core files)
  - Web component bundle

#### CI/CD Pipeline

**GitHub Actions Workflow**: `.github/workflows/pipeline.yaml`

**Trigger Conditions**:
- Push to `main` branch
- Pull request (opened or synchronized)

**Pipeline Steps**:
1. Uses shared workflow: `openmfp/gha/.github/workflows/pipeline-node-module.yml@main`
2. Runs tests with coverage requirements
3. Builds library and web components
4. Publishes to NPM registry (`npmjs:@openmfp/portal-ui-lib`) on main branch

**Configuration**:
- `publishFromDist: true` - Publish from `dist/` directory
- Secrets inherited from repository settings

**Build Status**: ![Build Status](https://github.com/openmfp/portal-ui-lib/actions/workflows/pipeline.yaml/badge.svg)

#### NPM Package Deployment

**Package Registry**: NPM public registry (npmjs.com)

**Package Name**: `@openmfp/portal-ui-lib`

**Deployment Strategy**:
- Automatic deployment on merge to main (via CI/CD)
- Semantic versioning (current: see `package.json`)
- Package includes library code, TypeScript definitions, and assets

**Consuming Applications**:
1. Add dependency: `npm install @openmfp/portal-ui-lib`
2. Configure `angular.json` to include assets (see [README - Angular Configuration](../README.md#angular-configuration))
3. Import and bootstrap (see [README - Getting Started](../README.md#getting-started))

#### Asset Management

**Asset Requirements**: Consuming applications must configure `angular.json`:

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

**Rationale**: Luigi framework requires core JavaScript and CSS files to be served as static assets.

---

### 3.7 Operations Concept

#### Key Performance Indicators (KPIs)

**Build Metrics**:
- Build time: Target < 2 minutes for full build
- Test coverage: 95% (library), 95% (web components)
- Bundle size: Monitor via npm publish logs

**Runtime Metrics** (responsibility of consuming applications):
- Time to First Render (TTFR)
- Luigi initialization time
- Configuration fetch time
- Token refresh success rate

#### Support Model

**Open Source Support**:
- **Issue Tracking**: GitHub Issues ([openmfp/portal-ui-lib](https://github.com/openmfp/portal-ui-lib/issues))
- **Contributions**: See [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Code of Conduct**: See [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)
- **Documentation**: README.md, docs/ folder, inline code comments

**Community Resources**:
- OpenMFP Documentation: [openmfp.org](https://openmfp.org/)
- Luigi Documentation: [docs.luigi-project.io](https://docs.luigi-project.io/)

#### Operational Responsibilities

**Library Maintainers**:
- Maintain compatibility with Luigi framework versions
- Update Angular peer dependencies
- Review and merge pull requests
- Publish releases to NPM
- Security vulnerability management

**Consuming Applications**:
- Configure backend integration (portal-server-lib)
- Implement authentication server integration
- Configure micro frontend routing and permissions
- Monitor runtime performance and errors
- Provide support to end users

#### Monitoring and Troubleshooting

**Debug Mode**:
```javascript
// Enable Luigi debug logging
localStorage.setItem('luigi.debug', 'true');
location.reload();
```

**Common Issues**: See [ACD - Troubleshooting](./ARCHITECTURE.md#troubleshooting)

**Network Inspection**:
- Monitor `GET /rest/config` - Portal configuration
- Monitor `GET /rest/config/:entity` - Entity configuration
- Monitor `POST /rest/auth/refresh` - Token refresh
- Check browser console for Luigi errors

#### Security Operations

**Token Management**:
- Tokens stored in memory (cleared on browser close)
- Automatic token refresh before expiration
- 403 errors trigger immediate logout
- No sensitive data in localStorage

**Dependency Updates**:
- Regular dependency audits via `npm audit`
- Renovate bot for automated dependency updates (see `renovate.json`)
- Security patches prioritized for rapid release

**Vulnerability Reporting**: Follow OpenMFP security policy for responsible disclosure.

---

## Related Documentation

- [README.md](../README.md) - Getting started guide and usage examples
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture with diagrams and code examples
- [Local Setup Guide](./readme-local-setup.md) - Local development configuration
- [Nodes Configuration](./readme-nodes-configuration.md) - Navigation node structure
- [Luigi Context](./readme-luigi-context.md) - Context data patterns
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) - Community standards

---

## References

- [SLC-2] CI/CD Pipeline: `.github/workflows/pipeline.yaml`
- [SLC-3] Deployment Process: See [Section 3.6](#36-deployment-process)
- [SLC-23] Service Usage: See [Section 3.3](#33-usage-of-services-internalexternal)
- Luigi Framework: https://docs.luigi-project.io/
- Portal Server Library: https://github.com/openmfp/portal-server-lib
- OpenMFP: https://openmfp.org/
