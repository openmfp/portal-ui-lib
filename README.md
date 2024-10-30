# Portal UI Library

This library helps you to set up your angular project consuming [Luigi](https://luigi-project.io/) configuration.

Main features of this library are:

* Enable dynamic Luigi configuration consumption in a microfrontend.
* Provide authentication capabilities with Auth Server
* Dynamic development capabilities by embedding your locally running microfrontend into a Luigi frame.

## Table of Contents
- [Getting started](#Getting-started)
  - [Configure the project](#Configure-the-project)
  - [Import the Portal providers and Bootstrap the app with PortalComponent](#Import-the-Portal-providers-and-Bootstrap-the-app-with-PortalComponent)
  - [Update index.html file](#Update-index-html-file-of-the-project)
  - [Implement the Custom Service](#Implement-the-Custom-Service)
    - [Configuration services](#Configuration-services)
    - [Functional services](#Functional-services)
  - [Listen and react to Authentication Events](#Listen-and-react-to-Authentication-Events)
  - [Start your project](#Start-your-project)
- [Local Application Development](#Local-Application-Development)
- [Library development](#Library-development)


# Getting started

## Configure the project

### Dependencies

Besides putting the `@openmfp/portal-ui-lib` dependency into the `package.json` be sure as well to include the `@luigi-project/core`
and `@luigi-project/plugin-auth-oauth2` in proper versions (along with any other dependency required).

### Angular configuration

Configure the angular build process (in the `angular.json` file) to include the content of the Luigi core project
into the project assets, as shown below:

```
{
  // ... the rest of the angular.json configuration
  
  "assets": [
    {
      "glob": "**",
      "input": "node_modules/@luigi-project/core",
      "output": "/luigi-core"
    }
    // ... other configured assets
  ]
  
}
```


## Import the Portal providers and Bootstrap the app with PortalComponent

First you have to import the `providePortal` and bootstrap the `PortalComponent` in your `main.ts` file.
To do this call `providePortal(portalOptions)` method, which takes the `PortalOptions` object as an argument,
inside the providers section of the application configuration.
It is important to note that the `providePortal(portalOptions)` should be imported after any app specific
routing providers (e.g. `provideRouter(appRoutes)`).

The result may look like this:

```ts
import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {
  providePortal,
  PortalComponent,
  PortalOptions,
} from '@openmfp/portal-ui-lib';
import { appRoutes } from './app/app-routes';

const portalOptions: PortalOptions = {
    // ... portal options
}

bootstrapApplication(PortalComponent, {
  providers: [
      provideRouter(appRoutes), 
      importProvidersFrom(AnyRequiredModule),
      providePortal(portalOptions),
       
      // ... any ohter providers imports
    ]
  }
);
```

## Update index html file of the project

The next step in order to have the portal working is to update the `index.html` file with the inclusion of:
- the `/luigi-core/luigi.js` script,
- the `/luigi-core/luigi_horizon.css` styles,
- and placing the  `<app-portal></app-portal>` html tag inside the html body.

Below is an example:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>App</title>
        <base href="/">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="/luigi-core/luigi_horizon.css" />
    </head>
    <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <script src="/luigi-core/luigi.js"></script>
        <app-portal></app-portal>
    </body>
</html>
```



## Implement the Custom Service


There are two types of services that are considered: Services that provide Luigi configuration (aka. Configuration Services) and services that provide or extend functionality (aka. Functional Services).
For each service there is a corresponding interface that you have to implement.
Afterward you provide your specific implementation in the `providePortal(portalOptions)` by placing it in the `portalOptions` object and thus make it available to the `Portal`.

### Configuration services

#### The staticSettingsConfigService option

With this you can customize [Luigis general settings](https://docs.luigi-project.io/docs/general-settings) and override any defaults.
Make sure to return a valid Luigi configuration object.

```ts
import { StaticSettingsConfigService } from '@openmfp/portal-ui-lib';

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

The `getInitialStaticSettingsConfig()` method is called while constructing the Luigi initial config object.
The `getStaticSettingsConfig()` is called while [Luigi lifecycle hook luigiAfterInit](https://docs.luigi-project.io/docs/lifecycle-hooks?section=luigiafterinit).
The latter adds additional setup to the root of the Luigi configuration object.

In your `main.ts` you can provide your custom implementation like so:

```ts
const portalOptions: PortalOptions = {
  staticSettingsConfigService: StaticSettingsConfigServiceImpl,
  // ... other portal options
}
```

#### The userSettingsConfigService option

With this you can define the [Luigi user settings and a corresponding userSettingGroups configuration](https://docs.luigi-project.io/docs/user-settings?section=user-settings)
Make sure to return a valid Luigi configuration object.

```ts
import { UserSettingsConfigService, LuigiNode } from '@openmfp/portal-ui-lib';

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

In your `main.ts` you can provide your custom implementation like so:

```ts
const portalOptions: PortalOptions = {
  userSettingsConfigService: UserSettingsConfigServiceImpl,
  // ... other portal options
}
```

#### The globalSearchConfigService option

With this you have the possibility configure [Luigis global search element](https://docs.luigi-project.io/docs/global-search) with provided configuration and events handlers.
Make sure to return a valid Luigi configuration object.

```ts
import { GlobalSearchConfigService} from '@openmfp/portal-ui-lib';

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

In your `main.ts` you can provide your custom implementation like so:

```ts
const portalOptions: PortalOptions = {
  globalSearchConfigService: GlobalSearchConfigServiceImpl,
  // ... other portal options
}
```

#### The luigiBreadcrumbConfigService option

This enables you to define [Luigi breadcrumbs for your application](https://docs.luigi-project.io/docs/navigation-advanced?section=breadcrumbs)
Make sure to return a valid Luigi configuration object.


```ts
import {
  LuigiBreadcrumbConfigService,
  LuigiBreadcrumb,
  NodeItem,
  LuigiNode,
  BreadcrumbBadge,
} from '@openmfp/portal-ui-lib';


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

In your `main.ts` you can provide your custom implementation like so:

```ts
const portalOptions: PortalOptions = {
  luigiBreadcrumbConfigService: LuigiBreadcrumbConfigServiceImpl,
  // ... other portal options
}
```

#### The userProfileConfigService option

This option allows you to define the [Luigi user profile](https://docs.luigi-project.io/docs/navigation-advanced?section=profile).
Make sure to return a valid Luigi configuration object.

```ts
import { UserProfileConfigService, UserProfile } from '@openmfp/portal-ui-lib';


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

In your `main.ts` you can provide your custom implementation like so:

```ts
const portalOptions: PortalOptions = {
  userProfileConfigService: UserProfileConfigServiceImpl,
  // ... other portal options
}
```

### Functional services

#### The luigiAuthEventsCallbacksService option

This option allows you to provide a service that listens to [Luigi authorization events](https://docs.luigi-project.io/docs/authorization-events)
Make sure to return a valid Luigi configuration object.

```ts
import { LuigiAuthEventsCallbacksService } from '@openmfp/portal-ui-lib';

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

In your `main.ts` you can provide your custom implementation like so:

```ts

const portalOptions: PortalOptions = {
  luigiAuthEventsCallbacksService: LuigiAuthEventsCallbacksServiceImpl,
  // ... other portal options
}
```

#### The customMessageListeners option

With this option it is possible to define listeners for [Luigi custom messages](https://docs.luigi-project.io/docs/communication?section=custom-messages).

Custom messages are sent from any part of your application to Luigi and then routed to any other micro frontend application in the same application.
A custom message is sent by using Luigis `sendCustomMessage({ id: 'unique.message.id'});` method (see also the following example).

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

In order to react on such a message in your micro frontend, you have to provide a custom message listener.
You have to specify the corresponding message id you want to listen to.
If there is a match, the callback function `onCustomMessageReceived()` will be called.
Make sure to return a valid Luigi configuration object.

```ts
import { CustomMessageListener } from '@openmfp/portal-ui-lib';

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

In your `main.ts` you can provide your custom implementation like so:

```ts
const portalOptions: PortalOptions = {
  customMessageListeners: [CustomMessageListenerImpl, CustomMessageListenerImpl2, ...],
  // ... other portal options
}
```

#### The customGlobalNodesService option

This option adds the possibility to define and add the global level Luigi nodes to your application.

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

In your `main.ts` you can provide your custom implementation like so:

```ts
const portalOptions: PortalOptions = {
  customGlobalNodesService: CustomGlobalNodesServiceImpl,
  // ... other portal options
}
```

## Listen and react to Authentication Events

There are following Authentication Events, to which the library consuming application can subscribe and react upon, in case required.

```ts
export enum AuthEvent {
  AUTH_SUCCESSFUL = 'AuthSuccessful',
  AUTH_ERROR = 'AuthError',
  AUTH_EXPIRED = 'AuthExpired',
  AUTH_REFRESHED = 'AuthRefreshed',
  AUTH_EXPIRE_SOON = 'AuthExpireSoon',
  AUTH_CONFIG_ERROR = 'AuthConfigError',
  LOGOUT = 'Logout',
}
```
Below is an example of reacting to `AuthEvent.AUTH_SUCCESSFUL` 

```ts
import { AuthEvent, AuthService } from '@openmfp/portal-ui-lib';
import { filter } from 'rxjs';
import { MyService } from '../services';

export function actWhenUserAuthSuccedsful(
    myService: MyService,
    authService: AuthService,
): () => void {
  return () => {
    authService.authEvents
      .pipe(
        filter((event: AuthEvent) => event === AuthEvent.AUTH_SUCCESSFUL),
      )
      .subscribe({
        next: (event: AuthEvent) => {
          myService.act();
        },
      });
  };
}
```


## Start your project

After finishing all the required steps you might want to check your integration with the library and run your local application.
In order to do that, firstly you need to run the local server part of the portal,
please follow the instruction provided [here](https://github.com/openmfp/portal-server-lib?tab=readme-ov-file#portal-server-library)
Once the server is running execute your ui starting script (e.g. `ng serve --port 4300` ) remembering that the default localhost port
should be `4300` otherwise you need to set the environment variable to expected `FRONTEND_PORT=ZZZZ` and restart the server.

# Local Application Development

You can set up a local instance of your application.
This allows you to thoroughly test your application before you release it to production.
Please follow our [local setup guide](./readme-local-setup.md) for this task

# Library development

## Build

Run `ng build` to build the project.
The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Jest](https://jestjs.io/).
