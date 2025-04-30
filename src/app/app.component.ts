import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // ✅ importer RouterOutlet

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // ✅ ici
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {}
