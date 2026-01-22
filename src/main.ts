import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { PerformanceService } from './app/core/services/performance.service';

bootstrapApplication(AppComponent, appConfig)
  .then((appRef) => {
    // Inicializar Web Vitals después del bootstrap
    const performanceService = appRef.injector.get(PerformanceService);
    performanceService.initWebVitals();
  })
  .catch((err) => console.error(err));
