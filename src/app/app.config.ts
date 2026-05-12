import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loaderInterceptor } from './core/interceptors/loader.interceptor';
import { authExpiryInterceptor } from './core/interceptors/auth-expiry.interceptor';
import { networkErrorInterceptor } from './core/interceptors/network-error.interceptor';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { importProvidersFrom } from '@angular/core';
import { LucideAngularModule, ArrowLeftRight, Calendar, Calculator, History, ArrowRight, User, Mail, Lock, Database, Plus, TrendingUp, X } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      authInterceptor,
      loaderInterceptor,
      authExpiryInterceptor,
      networkErrorInterceptor
    ])),
    provideAnimations(),
    provideCharts(withDefaultRegisterables()),
    importProvidersFrom(LucideAngularModule.pick({ 
      ArrowLeftRight, Calendar, Calculator, History, ArrowRight, 
      User, Mail, Lock, Database, Plus, TrendingUp, X 
    }))
  ]
};




