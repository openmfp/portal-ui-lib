# Dev Mode URL Per-Item Toggle — Design Spec

**Date:** 2026-08-12  
**Status:** Approved

## Problem

In development mode, users can add and remove URLs from the config list. To temporarily disable a URL they currently have to remove it and re-add it later. This is tedious and error-prone.

## Goal

Add a per-URL active/inactive toggle to the URL list so users can enable or disable individual URLs without removing them.

## Approach

Option A: add an optional `active?: boolean` field to the existing `Config` interface. `undefined` is treated as `true` (backward compatible with existing stored data).

---

## Design

### 1. Data Model

File: `projects/lib/src/lib/models/local-development-settings.ts`

Add `active?: boolean` to `Config`:

```ts
export interface Config {
  url?: string;
  data?: ContentConfiguration;
  active?: boolean; // undefined = active (backward compat)
}
```

No changes to `LocalDevelopmentSettings`. Existing localStorage entries without `active` continue to work as-is.

---

### 2. Component Logic

File: `projects/wc/src/app/components/development-settings/development-settings.component.ts`

- `defaultConfig` entries get `active: true`.
- `addUrl()` sets `active: true` on the new config object.
- New method `toggleUrl(index: number)` flips the `active` flag and persists:

```ts
toggleUrl(index: number) {
  this.configs.update((configs) =>
    configs.map((c, i) => i === index ? { ...c, active: c.active === false } : c)
  );
  this.saveDevelopmentSettings();
}
```
// `c.active === false` treats undefined as active: undefined→false, false→true

---

### 3. Template

File: `projects/wc/src/app/components/development-settings/development-settings.component.html`

Each URL list item row gets a `ui5-switch` placed before the URL text. The switch is checked when `active !== false`:

```html
<div class="list-item-row">
  <ui5-switch [checked]="item.active !== false" (change)="toggleUrl(ind)"></ui5-switch>
  <span class="list-item-text">{{ item.url }}</span>
  <ui5-button design="Transparent" icon="decline" (click)="removeUrl(ind)"></ui5-button>
</div>
```

---

### 4. Service Filter

File: `projects/lib/src/lib/services/luigi-nodes/local-configuration.service.ts`

In `getLocalConfigurations()`, extend both existing filters to also exclude inactive configs:

```ts
// url-based configs
.filter((config): config is { url: string } => !!config.url && config.active !== false)

// data-based configs
.filter((config): config is { data: ContentConfiguration } => !!config.data && config.active !== false)
```

---

## Backward Compatibility

- Existing stored configs without `active` field: treated as active (`undefined !== false` is `true`).
- No migration needed.
- No new localStorage keys.

## Out of Scope

- Toggle for `serviceProviderConfig` entries (not requested).
- Persisting toggle state separately from the config list.
