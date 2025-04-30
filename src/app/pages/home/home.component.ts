import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 class="text-3xl font-bold mb-6 text-gray-800">Bienvenue sur le site de cartographie</h1>
      <a
        routerLink="/profil-utilisateur"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Accéder au profil utilisateur
      </a>
    </div>
  `
})
export class HomeComponent {}
