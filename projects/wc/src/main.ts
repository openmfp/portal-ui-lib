import '@angular/localize/init';
import { appConfig } from './app/app.config';
import { createApplication } from '@angular/platform-browser';

createApplication(appConfig).catch((err) => console.error(err));
