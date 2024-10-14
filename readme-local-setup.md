# Local application development

A development instance of the portal provides the capability to serve local frontend applications.


## Consuming Local Content Configuration

By default the development instance of the portal will look for a `content-configuration.json` file on your localhost (more precisely the URL `http://localhost:4200/assets/content-configuration.json` is requested).
The contents of this file are described in great detail at [nodes configuration and content-configuration](readme-nodes-configuration.md) document.
 
In order to use your local `content-configuration.json` file on other environments (like production), you have to add the `dev-mode-settings` 
local storage key like described underneath under "Customize the local extensions".

If the URL `http://localhost:4200/assets/content-configuration.json` returns a valid `content-configuration.json`, the nodes defined in the `content-configuration.json` will overwrite any already existing nodes.
Nodes will be overwritten when the `entityType` and the `pathSegment` match a already present node.

### Defining and Providing your Content Configuration

To display your frontend in the OpenMFP Portal development landscape make that in your local `content-configuration.json` you have specified on the node `entityType`:

- `global` to be displayed in the global navigation
- `project` to be displayed in the left-side navigation inside a project

If you do not specify a `urlTemplateParams.url`, the frontend will be loaded from localhost.
Your application will retrieve a valid token, and you can test your integration with other frontends hosted on the same portal.

With Angular, you need to:

1. Add a `content-configuration.json` file to your `assets` folder
2. Run the server locally and make it serve on the `localhost:4200` port
3. Go to the portal development instance
4. Visit the sites where you frontend is usually shown (now the local running variant is shown)

## Use dev-mode-settings for Customization

If you want to load the local `content-configuration.json` from a different URL or want to specify the `content-configuration.json` directly without serving it on `localhost` you can use the `dev-mode-settings` local storage option:

To use this feature, you need to set the local storage key `dev-mode-settings` on the portal domain.
You can set these values easily from the console on the portal domain by opening your web console (press F12) and find the `Console` tab.
Then you can place your settings via this JavaScript snipped:

```ts
localStorage.setItem("dev-mode-settings", JSON.stringify({
    isActive: true,
    cdm: [
        {url:"http://localhost:4200/assets/content-configuration.json"},
        {url:"http://localhost:4500/assets/content-configuration.json"},
        {data:{ /*... full content-configuration.json ...*/ }}
     ],
    serviceProviderConfig: {
       "key1": "value1",
       "key2": "value2"
    }
}));
```

Note that by setting `isActive` to true, you also can use this feature on any deployment environment within your organization.

You can provide as many `content-configuration.json` in two ways:
* Provide it via the `url` field. The URL must be accessible from the portal domain and it must serve a valid content configuration
* Provide it via the `data` field. Here you place your content configuration content inline.


The values in `serviceProviderConfig` field will be added to every Luigi node's context in the `serviceProviderConfig` field, 
below the example ot the outcome of setting this field on a Luigi node:

```
{
    "label": "Overview",
    "entityType": "global.topnav",
    "viewUrl": "/overview",
    "pathSegment": "overview",
    "context": {
      "serviceProviderConfig": {
        "key1": "value1",
        "key2": "value2"
      }
      // ... other luigi node context properties
    } 
    // ... other luigi node properties
}

```


After setting the local storage entry, you need to reload (press F5) the page for your changes to take effect.

## Troubleshooting

### My node is not shown

* Did you refresh the page after changing the local storage?
* Did you make sure that the entity in the navigation node is set correctly? 
