import { Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    title: '4 Fotos 1 Palabra',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
