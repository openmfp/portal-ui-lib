import { appConfig } from './app/app.config';
import '@angular/localize/init';
import { createApplication } from '@angular/platform-browser';
import { setCapturedSrc } from './app/utils/wc';

// Capture document.currentScript.src SYNCHRONOUSLY before any async code.
// By the time APP_INITIALIZER runs (async), document.currentScript is already null.
setCapturedSrc(document.currentScript?.getAttribute('src'));

createApplication(appConfig).catch((err) => {
  console.error(err);
});
