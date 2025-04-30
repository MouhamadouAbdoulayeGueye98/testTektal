import {
  Component,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SearchEntry {
  label: string;
  lat: number;
  lon: number;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.css']
})
export class MapComponent implements AfterViewInit {
  steps: string[] = [];
  searchQuery = '';
  map: any;
  userPosition: any;
  destination: any = null;
  routingControl: any = null;
  routeSummary: { totalDistance: number; totalTime: number } | null = null;
  searchHistory: SearchEntry[] = [];
  destinationMarker: any = null;
  L: any;
  destinationIcon: any;
  instructionIndex: number = 0;
  routeCoordinates: any[] = [];
  watchId: number | null = null;


  // 🔊 Méthode pour parler
  speak(text: string) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    synth.speak(utterance);
  }

  async ngAfterViewInit(): Promise<void> {
    const leafletModule = await import('leaflet');
    this.L = leafletModule.default;
    const routing = await import('leaflet-routing-machine');

    const osm = this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    });
    const satellite = this.L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Tiles © Esri' }
    );

    this.map = this.L.map('map', {
      center: [48.8566, 2.3522],
      zoom: 13,
      layers: [osm]
    });
    const baseMaps = {
      'Carte standard': osm,
      'Satellite': satellite
    };
    this.L.control.layers(baseMaps).addTo(this.map);

    const userIcon = this.L.divIcon({
      className: 'custom-user-icon',
      html: `<svg width="32" height="32" fill="#1d4ed8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
      </svg>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    this.destinationIcon = this.L.divIcon({
      className: 'custom-destination-icon',
      html: `<svg width="32" height="32" fill="#dc2626" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.1 2 5 5.1 5 9c0 4.9 7 13 7 13s7-8.1 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z"/>
        </svg>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const origin = this.L.latLng(pos.coords.latitude, pos.coords.longitude);
        this.userPosition = origin;
        this.L.marker(origin, { icon: userIcon }).addTo(this.map);
        this.map.setView(origin, 14);
      });
    }

    this.map.on('click', (e: any) => {
      if (!this.userPosition) {
        alert('Position utilisateur non disponible');
        return;
      }
      this.destination = e.latlng;

      if (this.destinationMarker) {
        this.map.removeLayer(this.destinationMarker);
      }
      this.destinationMarker = this.L.marker(e.latlng, { icon: this.destinationIcon })
        .addTo(this.map)
        .bindPopup('Destination sélectionnée')
        .openPopup();

      const { lat, lng } = e.latlng;
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
        .then(res => res.json())
        .then(data => {
          const info = data.display_name || 'Destination sélectionnée';
          this.destinationMarker.setPopupContent(info).openPopup();
          this.speak(`Destination sélectionnée : ${info}`);
        })
        .catch(() => {
          this.destinationMarker.setPopupContent('Destination sélectionnée').openPopup();
          this.speak('Destination sélectionnée');
        });
    });

    const storedHistory = localStorage.getItem('searchHistory');
    if (storedHistory) {
      this.searchHistory = JSON.parse(storedHistory);
    }
  }

  searchLocation() {
    const query = this.searchQuery.trim();
    if (!query) return;

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json`;
    fetch(url)
      .then(res => res.json())
      .then((locations) => {
        if (locations.length === 0) {
          alert('Aucun résultat trouvé.');
          return;
        }
        const location = locations[0];
        this.destination = [parseFloat(location.lat), parseFloat(location.lon)];

        if (this.destinationMarker) {
          this.map.removeLayer(this.destinationMarker);
        }
        this.destinationMarker = this.L.marker(this.destination, { icon: this.destinationIcon })
          .addTo(this.map)
          .bindPopup('Destination sélectionnée')
          .openPopup();

        this.speak(`Destination sélectionnée : ${location.display_name}`);

        const entry: SearchEntry = {
          label: location.display_name,
          lat: parseFloat(location.lat),
          lon: parseFloat(location.lon)
        };
        this.searchHistory.unshift(entry);
        if (this.searchHistory.length > 10) {
          this.searchHistory.pop();
        }
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        this.map.setView(this.destination, 14);
        this.searchQuery = '';

      })
      .catch((err) => {
        console.error(err);
        alert('Erreur lors de la recherche.');
      });
  }

  traceItineraire() {
    if (!this.userPosition || !this.destination) {
      alert('Position ou destination manquante');
      return;
    }
  
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
      this.routingControl = null;
      this.steps = [];
      this.routeSummary = null;
    }
  
    this.routingControl = this.L.Routing.control({
      waypoints: [this.userPosition, this.destination],
      routeWhileDragging: false,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: '#1d4ed8', weight: 5 }],
        extendToWaypoints: true,
        missingRouteTolerance: 10
      },
      createMarker: (i: number, waypoint: any) => {
        return this.L.marker(waypoint.latLng, { draggable: false });
      }
    }).on('routesfound', (e: any) => {
      const route = e.routes[0];
      this.steps = route.instructions.map((i: any) => i.text);
      this.routeCoordinates = route.instructions.map((i: any) => i.latLng);
      this.instructionIndex = 0;
  
      const summary = route.summary;
      this.routeSummary = {
        totalDistance: summary.totalDistance,
        totalTime: summary.totalTime
      };
  
      // Suivi GPS en temps réel
      if (this.watchId) {
        navigator.geolocation.clearWatch(this.watchId);
      }
  
      this.watchId = navigator.geolocation.watchPosition((pos) => {
        const currentPos = this.L.latLng(pos.coords.latitude, pos.coords.longitude);
  
        if (this.instructionIndex < this.routeCoordinates.length) {
          const target = this.routeCoordinates[this.instructionIndex];
          const distance = currentPos.distanceTo(target);
  
          if (distance < 30) {
            this.speak(`Instruction ${this.instructionIndex + 1} : ${this.steps[this.instructionIndex]}`);
            this.instructionIndex++;
          }
  
          if (this.instructionIndex === this.routeCoordinates.length) {
            this.speak('Vous êtes arrivé à destination.');
            navigator.geolocation.clearWatch(this.watchId!);
            this.watchId = null;
          }
        }
      }, (err) => {
        console.error('Erreur GPS :', err);
      }, {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000
      });
    }).addTo(this.map);
  }
  

  clearItineraire() {
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
      this.routingControl = null;
    }
    if (this.destinationMarker) {
      this.map.removeLayer(this.destinationMarker);
      this.destinationMarker = null;
    }
    this.steps = [];
    this.routeSummary = null;
    this.destination = null;
  }

  recentrerSurUtilisateur() {
    if (!this.userPosition) {
      alert('Position utilisateur non disponible.');
      return;
    }
    this.map.flyTo(this.userPosition, 14, {
      animate: true,
      duration: 1.5
    });
  }

  chargerDepuisHistorique(entry: SearchEntry) {
    this.destination = [entry.lat, entry.lon];
    this.map.setView(this.destination, 14);

    if (this.destinationMarker) {
      this.map.removeLayer(this.destinationMarker);
    }
    this.destinationMarker = this.L.marker(this.destination, { icon: this.destinationIcon })
      .addTo(this.map)
      .bindPopup('Destination sélectionnée')
      .openPopup();

    this.speak(`Destination sélectionnée : ${entry.label}`);
  }
}
