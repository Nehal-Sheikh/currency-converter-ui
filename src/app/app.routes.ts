import { Routes } from '@angular/router';
import { ConverterComponent } from './features/converter/converter.component';
import { HistoryComponent } from './features/history/history.component';
import { AuthComponent } from './features/auth/auth.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: ConverterComponent, data: { animation: 'converter' } },
  { path: 'history', component: HistoryComponent, canActivate: [authGuard], data: { animation: 'history' } },
  { path: 'login', component: AuthComponent, data: { animation: 'auth' } },
  { path: '**', redirectTo: '' }
];


