import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full">
        <div class="flex items-center space-x-6">
          <img
            [src]="user.avatar || defaultAvatar"
            alt="Avatar"
            class="w-24 h-24 rounded-full border-2 border-gray-300 object-cover"
          />
          <div>
            <h2 class="text-2xl font-bold text-gray-800">{{ user.name }}</h2>
            <p class="text-gray-600">{{ user.email }}</p>

            <label class="mt-4 inline-block">
              <input type="file" (change)="onFileSelected($event)" class="hidden" />
              <span class="cursor-pointer px-4 py-2 mt-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Importer une image
              </span>
            </label>
          </div>
        </div>

        <div class="mt-8 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <span class="text-gray-500">Carte à insérer ici (Leaflet / Mapbox)</span>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  user = {
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    avatar: ''
  };

  defaultAvatar = 'https://www.gravatar.com/avatar?d=mp&s=200';

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.user.avatar = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
