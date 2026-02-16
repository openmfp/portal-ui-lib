# Portal UI Library

<!-- CI trigger -->

![Build Status](https://github.com/openmfp/portal-ui-lib/actions/workflows/pipeline.yaml/badge.svg)
[![REUSE status](
https://api.reuse.software/badge/github.com/openmfp/portal-ui-lib)](https://api.reuse.software/info/github.com/openmfp/portal-ui-lib)

This library helps you to set up your angular project consuming [Luigi](https://luigi-project.io/) configuration.

The main features of this library are:

* Enable dynamic Luigi configuration consumption in a microfrontend.
* Provide authentication capabilities with Auth Server
* Dynamic development capabilities by embedding your locally running microfrontend into a Luigi frame.

## Table of Contents
- [Portal UI Library](#portal-ui-library)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [Dependencies](#dependencies)
    - [Angular Configuration](#angular-configuration)
  - [Import the Portal providers and Bootstrap the app with PortalComponent](#import-the-portal-providers-and-bootstrap-the-app-with-portalcomponent)
  - [Update index html file of the project](#update-index-html-file-of-the-project)
  - [Implement the Custom Service](#implement-the-custom-service)
  - [Configure Proxy for Backend REST Calls](#configure-proxy-for-backend-rest-calls)
  - [Start your Project](#start-your-project)
  - [Local Extension Development](#local-extension-development)
  - [Requirements](#requirements)
  - [Contributing](#contributing)
  - [Code of Conduct](#code-of-conduct)
  - [Licensing](#licensing)


## Getting Started

### Dependencies

Besides putting the `@openmfp/portal-ui-lib` dependency into the `package.json` be sure as well to include the `@luigi-project/core`
and `@luigi-project/plugin-auth-oauth2` in proper versions (along with any other dependency required).

### Angular Configuration

Configure the angular build process (in the `angular.json` file) to include the content of the Luigi core project and assets 
from `@openmfp/portal-ui-lib` library into the project assets, as shown below:

```
{
  // ... the rest of the angular.json configuration
  
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
    },
  ]
    // ... other configured assets
  ]
  
}
```

## Import the Portal providers and Bootstrap the app with PortalComponent

First you have to import the `providePortal` and bootstrap the `PortalComponent` in your `main.ts` file.
To do this call `providePortal(portalOptions)` method, which takes the `PortalOptions` object as an argument,
inside the providers section of the application configuration. It is important to note that the `providePortal(portalOptions)` should be imported after any app specific
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
       
      // ... any other providers imports
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


### Implement the Custom Services

The library comes with a set of services that can be used to customize the portal behavior.
Please visit the [Frontend configuration - Extended Guide](https://openmfp.org/documentation/extended-guide/frontend-configuration/)
to get familiar with the configuration options and how to use them.


### Configure Proxy for Backend REST Calls

The library executes rest calls `"/rest/**"` against backend running with the library [portal-server-lib](https://github.com/openmfp/portal-server-lib?tab=readme-ov-file#portal-server-library).
In order for the calls to reach your backend the `proxy.config.json` needs to be provided, 
with the target reaching the place where and on what port the backend is running `"target": "http://localhost:3000"`.

```json
{
  "/rest/**": {
    "target": "http://localhost:3000",
    "secure": false,
    "logLevel": "debug",
    "changeOrigin": true
  }
}
```

The proxy file needs to be indicated in the file `angular.json` section `serve`:

```json
 {       
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "options": {
            "proxyConfig": "proxy.config.json"
          },
          "configurations": {
            "production": {
              "browserTarget": "build:production"
            },
            "development": {
              "browserTarget": "build:development"
            }
          },
          "defaultConfiguration": "development"
        }

}
```


### Start your Project

After finishing all the required steps you might want to check your integration with the library and run your local application.
In order to do that, firstly you need to run the local server part of the portal,
please follow the instruction provided [here](https://github.com/openmfp/portal-server-lib?tab=readme-ov-file#portal-server-library)
Once the server is running execute your ui starting script (e.g. `ng serve --port 4300` ) remembering that the default localhost port
should be `4300` otherwise you need to set the environment variable to expected `FRONTEND_PORT=ZZZZ` and restart the server.

## Local Extension Development

You can set up a local instance of your application.
This allows you to thoroughly test your application before you release it to production.
Please follow our [local setup guide](./docs/readme-local-setup.md) for this task.

## Requirements

The portal requires a installation of node.js and npm. 
Checkout the [package.json](package.json) for the required node version and dependencies.

## Contributing

Please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file in this repository for instructions on how to contribute to openMFP.

## Code of Conduct

Please refer to the [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) file in this repository for information on the expected Code of Conduct for contributing to openMFP.

## Licensing

Copyright 2025 SAP SE or an SAP affiliate company and openMFP contributors. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/openmfp/portal-ui-lib).
