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

By putting the below snippet into `angular.json` assets section, the default library assets will be used.

```json
  {
    "glob": "**",
    "input": "node_modules/@openmfp/portal-ui-lib/src/assets/",
    "output": "/assets/"
  }
```

## Implement and set your custom services with portal options

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

Should contain an array of custom message listeners implementing the interface `CustomMessageListener` 

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


## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Jest](https://jestjs.io/).
