# Web Component Customizations

This document describes the web components shipped by `@openmfp/portal-ui-lib` that a host portal can style and configure, and the environment configuration that drives them.

## The `no-vpn` Web Component

When a Luigi node declares `networkVisibility: 'internal'` and the user is not on the corporate network, the portal converts that node so it renders the `no-vpn` web component instead of the unreachable extension UI.

The converted node:

- renders the `no-vpn` web component from the portal web component bundle:

  ```
  viewUrl: '/assets/openmfp-portal-ui-wc.js#no-vpn'
  webcomponent: { selfRegistered: true, type: 'module' }
  ```

- has no children, so none of the extension's sub-pages are reachable;
- receives an informative `VPN` status badge when it does not already have one.

The conversion applies to top-level global nodes, to children of non-entity nodes, and to children of entity nodes, including dynamically fetched ones. Compound children are not converted.

The page shows a title, a description, and a Retry button. Retry reloads the portal page, which runs the network check again and rebuilds the navigation nodes, so a user who has connected to the corporate network in the meantime sees the extension UI.

### Network check via `VPN_CHECK_URL`

The behavior is driven by the backend environment variable `VPN_CHECK_URL`. `portal-server-lib` exposes it to the client through `GET /rest/envconfig` as `vpnCheckUrl`.

The portal runs the check once, when it loads, before it builds the navigation nodes. It sends a `HEAD` request in `no-cors` mode to the configured URL:

- When the request gets any HTTP response, including an error status such as `404` or `500`, the user counts as on the corporate network and `internal` nodes render normally.
- When the request fails at the network level (for example the host name does not resolve or the connection is refused), `internal` nodes are converted to the `no-vpn` page.
- When `VPN_CHECK_URL` is unset, or the environment configuration cannot be loaded, the feature is off and `internal` nodes always render normally.

Because the request uses `no-cors`, the URL does not need to send CORS headers. Choose a URL that resolves only inside the corporate network.

### Texts

The texts come from the portal translations:

| Key | English default |
| --- | --- |
| `VPN_NEEDED_PAGE_TITLE` | VPN Needed |
| `VPN_NEEDED_PAGE_DESCRIPTION` | Connect to the corporate network to view this extension UI directly in the Portal. |
| `VPN_NEEDED_PAGE_RETRY_BUTTON` | Retry |

### Appearance

The component uses UI5 web components (`ui5-button`, `ui5-icon`) and SAP theme CSS variables, so it follows the portal theme and needs no stylesheet or font assets from the host. The page takes only the height of its content, so it does not add a scrollbar to the content area.

By default the page shows the `disconnected` UI5 icon above the texts.

### Adding an illustration

A host can replace the icon with its own illustration, served from the host's own domain, by setting these CSS custom properties:

```css
:root {
  --mfp-no-vpn-illustration-scene: url('/my-assets/no-network-scene.svg');
  --mfp-no-vpn-illustration-dialog: url('/my-assets/no-network-dialog.svg');
  --mfp-no-vpn-illustration-spot: url('/my-assets/no-network-spot.svg');
}
```

- `scene` is the default illustration. Setting it is what switches the page from the icon to the illustration.
- `dialog` and `spot` are optional smaller variants used as the available width shrinks. When they are not set, the page uses `scene` at those sizes.
- The illustration sizes itself from its aspect ratio: 4:3 for `scene`, 1:1 for `dialog` and `spot`. No height needs to be set.

Set the properties on `:root` or on another ancestor of the Luigi content area. They are inherited into the component's shadow DOM. Do not target the component by the tag name `wc-no-vpn`: Luigi registers the element under a generated `luigi-wc-*` tag name, so such a selector never matches.

The illustrations are loaded as CSS background images, which cannot read the portal's theme variables. An SVG that colors itself with `var(--sapContent_Illustrative_ColorN)` renders blank unless each variable has a fallback color, for example:

```xml
<rect fill="var(--sapContent_Illustrative_Color20, #89d1ff)" />
```

The fallback colors are fixed, so the illustration does not follow a theme switch such as dark mode.
