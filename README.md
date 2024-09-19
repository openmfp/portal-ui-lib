# PortalUiLib

This project helps you to set up your angular project consuming luigi configuration and ui library

Main features of this library are:

* Provide a dynamic Luigi configuration consumption
* Authentication capabilities with Auth Server
* Dynamic development capabilities - embed your local MicroFrontend into a running luigi frame.

# Getting started

## Import the module and bootstrap component

The Portal module: `PortalModule.forRoot(portalOptions)`

Bootstrapping the app: `bootstrap: [PortalComponent]`


```ts
import { PortalComponent, PortalModule, PortalModuleOptions } from '@openmfp/portal-ui-lib';

const portalOptions: PortalModuleOptions = {
    // ... portal module options
}

@NgModule({
    declarations: [
        HelpCenterComponent,
        // ... any required components
    ],
    imports: [
        ApolloModule,
        FormsModule,
        AppRoutingModule,
        // ... any required imports
        PortalModule.forRoot(portalOptions),
    ],
    providers: [
        HelpCenterService,
        // ... any required services
    ],
    bootstrap: [PortalComponent],
})
export class AppModule {
}
```

Remember to put any routing module (like in the example `AppRoutingModule`) before `PortalModule` import
(because it contains wildcard route mapping '**', matching any URL, being before other routes will consume all provided)

## Implement and set your custom services with portal options

### Configuration services

#### staticSettingsConfigService

In order to customize the [Luigi general settings](https://docs.luigi-project.io/docs/general-settings) and override the defaults, 
the `staticSettingsConfigService` option should be provided with the `StaticSettingsConfigService` implementation, 
constructing and returning the configuration object according to the mentioned Luigi documentation.

```ts
export class StaticSettingsConfigServiceImpl
    implements StaticSettingsConfigService
{
    constructor() {}

    getInitialStaticSettingsConfig() {
        const logo = 'assets/my-logo.svg';

        return {
            header: {
                title: 'My App',
                logo: logo,
                favicon: logo,
            },
            appLoadingIndicator: {
                hideAutomatically: false,
            },
            // ... the rest of the configuration 
        };
    }

    getStaticSettingsConfig() {
        return {
            ...this.getInitialStaticSettingsConfig(),
            appLoadingIndicator: {
                hideAutomatically: true,
            },
            // ... the rest of the configuration 
        }
    }
}
```

The `getInitialStaticSettingsConfig` is called while constructing the Luigi initial config object, whereas the `getStaticSettingsConfig` 
while [Luigi lifecycle hook luigiAfterInit](https://docs.luigi-project.io/docs/lifecycle-hooks?section=luigiafterinit) which
adds additional setup to the root of the Luigi configuration object.


Setting the options:

```ts
const portalOptions: PortalModuleOptions = {
    staticSettingsConfigService: StaticSettingsConfigServiceImpl,
    // ... other portal module options
}
```

#### userSettingsConfigService

The option `userSettingsConfigService` adds possibility of setting the [Luigi user settings and a corresponding userSettingGroups configuration](https://docs.luigi-project.io/docs/user-settings?section=user-settings)

```ts
export class UserSettingsConfigServiceImpl implements UserSettingsConfigService {

    async getUserSettings(childrenByEntity: Record<string, LuigiNode[]>) {
        return {
            userSettingsDialog: {
                dialogHeader: 'User Settings',
            },
            userSettingGroups: {
                // ...the rest of the configuration  
            }
            // ...the rest of the configuration  
        }
    }
}
```

Setting the options:

```ts
const portalOptions: PortalModuleOptions = {
    userSettingsConfigService: UserSettingsConfigServiceImpl,
    // ... other portal module options
}
```

#### globalSearchConfigService

With the option `globalSearchConfigService` there is a possibility to provide implementation of the `GlobalSearchConfigService` 
to be able to use the [Luigi global search element](https://docs.luigi-project.io/docs/global-search) 
with provided configuration and events handlers.

```ts
export class GlobalSearchConfigServiceImpl implements GlobalSearchConfigService {

    getGlobalSearchConfig() {
        return {
            searchFieldCentered: true,
            searchProvider: {
                onEnter: () => {
                    // ... handler implementation
                },
                onSearchBtnClick: () => {
                    // ... handler implementation
                },
                onEscape: () => {
                    // ... handler implementation
                },
                
                // ...the rest of the configuration
            },
            // ...the rest of the configuration
        };
    }
}
```

Setting the options:

```ts
const portalOptions: PortalModuleOptions = {
    globalSearchConfigService: GlobalSearchConfigServiceImpl,
    // ... other portal module options
}
```

#### luigiBreadcrumbConfigService

With the option `luigiBreadcrumbConfigService` there is a possibility to add with the implementation 
of the `GlobalSearchConfigService` interface the [Luigi breadcrumbs to your application](https://docs.luigi-project.io/docs/navigation-advanced?section=breadcrumbs)


```ts
export class LuigiBreadcrumbConfigServiceImpl implements LuigiBreadcrumbConfigService
{
    getBreadcrumbsConfig(): LuigiBreadcrumb {
        return  {
            autoHide: true,
            omitRoot: false,
            pendingItemLabel: '...',
            renderer: (
                containerElement: HTMLElement,
                nodeItems: NodeItem[],
                clickHandler,
            ) => {
                // ... renderer implementation
            },
        };
    }
}
```

Setting the options:

```ts
const portalOptions: PortalModuleOptions = {
    luigiBreadcrumbConfigService: LuigiBreadcrumbConfigServiceImpl,
    // ... other portal module options
}
```


#### userProfileConfigService

With the option `userProfileConfigService` there is a possibility to add with the implementation
of the `UserProfileConfigService` interface the [Luigi user profile](https://docs.luigi-project.io/docs/navigation-advanced?section=profile)


```ts
export class UserProfileConfigServiceImpl implements UserProfileConfigService
{
    async getProfile(): Promise<UserProfile> {
        return {
            logout: {
                label: 'Sign out',
                icon: 'log',
            },
            items: [
                {
                    label: 'Overview',
                    icon: 'overview',
                    link: `/users/overview`,
                },
            ],
        };
    }
}
```

Setting the options:

```ts
const portalOptions: PortalModuleOptions = {
    userProfileConfigService: UserProfileConfigServiceImpl,
    // ... other portal module options
}
```

### Functional services

#### luigiAuthEventsCallbacksService

The service provided for this option has to implement the interface `LuigiAuthEventsCallbacksService` which provides callback functionality
that is being called in response to the provides by Luigi authentication life cycle [events](https://docs.luigi-project.io/docs/authorization-events)

The example to execute some actions in response to authentication events:

```ts
export class LuigiAuthEventsCallbacksServiceImpl
    implements LuigiAuthEventsCallbacksService {

    onAuthSuccessful(settings: any, authData: any) {
        concole.log('User succesfully authenticated.');
    }

    // ...

    onLogout(settings: any) {
        concole.log('User succesfully logged out.');
    }
}
```
Setting the options:

```ts

const portalOptions: PortalModuleOptions = {
    luigiAuthEventsCallbacksService: LuigiAuthEventsCallbacksServiceImpl,
    // ... other portal module options
}
```

#### customMessageListeners

The `customMessageListeners` option should contain an array of custom message listeners implementing the interface `CustomMessageListener`

```ts
export class CustomMessageListenerImpl
    implements CustomMessageListener
{
    messageId(): string {
        return `unique.message.id`;
    }

    onCustomMessageReceived(
        customMessage: string,
        mfObject: any,
        mfNodesObject: any,
    ): void {
        // ... logic to be executed
    }
}
```

once the application calls `sendCustomMessage({ id: 'unique.message.id'});`
the callback function `onCustomMessageReceived` of `CustomMessageListenerImpl` will be executed.

```ts
import { inject, Injectable } from '@angular/core';
import { LuigiCoreService } from '@openmfp/portal-ui-lib';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private luigiCoreService: LuigiCoreService = inject(LuigiCoreService);

  public sendMessage() {
    this.luigiCoreService.sendCustomMessage({ id: 'unique.message.id' });
  }
}
```

Setting the options:

```
const portalOptions: PortalModuleOptions = {
    customMessageListeners: [CustomMessageListenerImpl, CustomMessageListenerImpl2, ...],
    // ... other portal module options
}
```

#### customGlobalNodesService

The option `customGlobalNodesService` adds possibility to define and add the custom global level Luigi nodes to the portal.

```ts
import { LuigiNode, CustomGlobalNodesService } from '@openmfp/portal-ui-lib';

export class CustomGlobalNodesServiceImpl implements CustomGlobalNodesService {

    async getCustomGlobalNodes(): Promise<LuigiNode[]> {
        return [
            this.createGlobalNode1(),
            this.createGlobalNode2(),
            // ...other globaL nodes
        ];
    }

    private async createGlobalNode1(): LuigiNode {
        return {
            label: 'Global 1',
            entityType: 'global.topnav',
            link: '/global_1',
            // ... other luigi node properties
        };
    }

    private createGlobalNode2(): LuigiNode {
        return {
            label: 'Global 2',
            entityType: 'global.topnav',
            viewUrl: '/global_2',
            pathSegment: 'global_2',
            // ... other luigi node properties
        };
    }
}
```

Setting the options:

```ts
const portalOptions: PortalModuleOptions = {
    customGlobalNodesService: CustomGlobalNodesServiceImpl,
    // ... other portal module options
}
```

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Jest](https://jestjs.io/).
