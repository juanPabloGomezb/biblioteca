import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore, enableIndexedDbPersistence } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { environment } from './environments/environment.prod';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => {
      const firestore = getFirestore();
      // Enable offline persistence - but with error handling
      enableIndexedDbPersistence(firestore)
        .catch((err) => {
          console.error('Firestore persistence error:', err.code);
          if (err.code === 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
          } else if (err.code === 'unimplemented') {
            console.warn('The current browser does not support all of the features required to enable persistence');
          }
        });
      return firestore;
    }),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
    provideDatabase(() => getDatabase()),
  ],
}).then(() => {
  // Register PWA elements after initialization
  defineCustomElements(window);
});