import { appConfig } from './app/app.config';
import '@angular/localize/init';
import { createApplication } from '@angular/platform-browser';

createApplication(appConfig).catch((err) => {
  console.error(err);
});
