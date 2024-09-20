# Local Extension development

## Overview
This document explains how to set up a local instance of your Extension.

## Procedure
A development instance of the portal provides the capability to serve local extensions/micro frontends.

The development instance of the portal will look for a `content-configuration.json` file on your localhost by default. 
See the [configuration](readme-nodes-configuration.md) document for more information on `content-configuration.json` files. 
If you want to use your local `content-configuration.json` file on other environments (like production), you have to add the `dev-mode-settings` 
local storage key like described underneath under "Customize the local extensions".

If the URL `http://localhost:4200/assets/content-configuration.json` returns a valid `content-configuration.json`, 
the nodes defined in the `content-configuration.json` will overwrite the central nodes.
Nodes will be overwritten when the `entityType` and the `pathSegment` match a centrally defined node.

To display your frontend in the OpenMFP Portal development landscape ensure that in your local `content-configuration.json` 
you have specified on the node `entityType`:

- `global` to be displayed in the global navigation
- `project` to be displayed in the left-side navigation inside a project

If you do not specify a `urlTemplateParams.url`, the Extension/micro frontend will be loaded from localhost.
Your Extension will retrieve a valid token, and you can test your integration with other Extensions hosted on the same portal.

With Angular, you need to:

1. Add a `content-configuration.json` file to your assets folder
2. Run the server
3. Test it in the portal

### Customize the local extensions

If you want to load the local `content-configuration.json` from a different URL or want to specify the `content-configuration.json` 
directly without serving it on `localhost` you can use the `dev-mode-settings` local storage option:

To use this feature, you need to set the local storage key `dev-mode-settings` on the portal domain, e.g. `https://portal.d1.openmfp.dxp.k8s.ondemand.com/`.
You can set these values easily from the console on the portal domain by running:

```js 
localStorage.setItem("dev-mode-settings", JSON.stringify({
    isActive: true,
    cdm: [
        {url:"http://localhost:4200/assets/content-configuration.json"},
        {data:{ /*... full content-configuration.json ...*/ }}
     ],
    serviceProviderConfig: {
       "key1": "value1",
       "key2": "value2"
    }
}));
```

By setting `isActive` to true, you also can use this feature on the INT and LIVE environments to test your extension locally.
You can provide as many `content-configuration.json` as you want, either as a URL or as an inline one.
The values in `serviceProviderConfig` field will be added to the Luigi context in the `serviceProviderConfig` field, 
just as the `extensionConfig` values in the ExtensionClass would.

After setting the local storage entry, you need to reload the page for your changes to take effect.

### Troubleshooting

- I added new navigation nodes to the local storage, but they are not shown
    - Did you refresh the page after changing the local storage?
    - Did you make sure that the entity in the navigation node is set correctly? 
