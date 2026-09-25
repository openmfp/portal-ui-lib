# Web Component Customizations

This document describes the web components shipped by `@openmfp/portal-ui-lib` that a host portal can style and configure, and the environment configuration that drives them.

## The `no-vpn` Web Component

When a Luigi node declares `networkVisibility: 'internal'` and the user is not on the corporate network, the portal converts that node so it renders the `no-vpn` web component instead of the unreachable extension UI. The node also receives an informative `VPN` status badge when it does not already have one.

The component is registered as the Luigi web component `no-vpn` and is served from the portal web component bundle:

```
viewUrl: '/assets/openmfp-portal-ui-wc.js#no-vpn'
webcomponent: { selfRegistered: true, type: 'module' }
```

It renders a title, a description, and a Retry button. The Retry button reloads the portal page, which re-runs the network check and recomputes the navigation nodes.

The conversion applies to top-level global nodes, to children of non-entity nodes, and to children of entity nodes (including dynamically fetched ones). Compound children are not converted.

### Reachability check via `VPN_CHECK_URL`

The behavior is driven by the backend environment variable `VPN_CHECK_URL`, exposed to the client through `GET /rest/envconfig` as `vpnCheckUrl` (`portal-server-lib` maps `process.env.VPN_CHECK_URL` to this key, consistent with the other environment values).

- When `VPN_CHECK_URL` resolves to a reachable resource, `internal` nodes render normally.
- When it resolves to an unreachable resource, `internal` nodes are converted to the `no-vpn` page.
- When `VPN_CHECK_URL` is unset, the feature is off and `internal` nodes always render normally.

The check is a `HEAD` request in `no-cors` mode, so the configured URL only needs to be reachable, not CORS-enabled.

### Adding an illustration

The component ships without a bundled illustration. By default it shows the `disconnected` UI5 icon above the title, description, and Retry button. A host can replace the icon with its own illustration, served from the host's own domain, by setting these CSS custom properties. They supply the image for the responsive illustration sizes (scene → dialog → spot) as the available width shrinks:

```css
:root {
  --mfp-no-vpn-illustration-scene: url('/my-assets/no-network-scene.svg');
  --mfp-no-vpn-illustration-dialog: url('/my-assets/no-network-dialog.svg');
  --mfp-no-vpn-illustration-spot: url('/my-assets/no-network-spot.svg');
}
```

Set them on `:root` (or another ancestor of the Luigi web component container). Luigi registers the element under a generated `luigi-wc-*` tag name, so a selector on the Angular selector `wc-no-vpn` never matches. Custom properties inherit into the component's shadow DOM.

Supplying only `--mfp-no-vpn-illustration-scene` is enough for a single, non-responsive illustration; `dialog` and `spot` fall back to it. The illustration box sizes itself from the aspect ratio (4:3 for scene, 1:1 for dialog and spot), so no height needs to be set.

The images are loaded as CSS background images, so they cannot read the portal's theme variables. An SVG that colors itself with `var(--sapContent_Illustrative_ColorN)` must include a fallback value, for example `fill="var(--sapContent_Illustrative_Color20, #89d1ff)"`, or it renders blank.

### Styling

The component uses UI5 web components (`ui5-button`, `ui5-icon`) and SAP theme CSS variables, so it follows the portal theme and needs no additional stylesheet or font assets from the host.
