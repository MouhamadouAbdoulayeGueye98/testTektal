import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profil-utilisateur/profil-utilisateur.component';
import { MapComponent } from './pages/google-map/google-map.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'profil-utilisateur', component: ProfileComponent },
  { path: 'google-map', component: MapComponent },
  { path: '**', redirectTo: '' }
];
