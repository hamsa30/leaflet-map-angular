import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GeocodingService } from '../services/geocoding.service';
import { MatSnackBar, MatSnackBarVerticalPosition, MatSnackBarHorizontalPosition } from '@angular/material/snack-bar';  

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  map!: L.Map;
  latitude!: number;
  longitude!: number;
  marker!: L.Marker;
  customIcon!: L.Icon;
  locationForm!: FormGroup;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder, // FormBuilder injection
    private geocodingService: GeocodingService, // GeocodingService injection
    private snackBar: MatSnackBar // MatSnackBar injection
  ) {}

  ngOnInit(): void {
    this.initializeForm(); // Initialize form
    this.initializeMap(); // Initialize map
  }

  initializeForm() {
    this.locationForm = this.fb.group({
      landmarkName: [''],
      latitude: [''],
      longitude: ['']
    });
  }

  initializeMap() {
    this.customIcon = L.icon({
      iconUrl: '../assets/images/map-marker.png',
      iconSize: [40, 53.333],
      iconAnchor: [20, 20]
    });

    this.map = L.map('map', { doubleClickZoom: false, zoom: 18 }).locate({ setView: true, maxZoom: 18 });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('locationfound', (e: L.LocationEvent) => {
      this.updateLocation(e.latlng.lat, e.latlng.lng); // Update location on location found
    });

    this.map.on('locationerror', (e: L.ErrorEvent) => {
      alert(e.message); // Alert on location error
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.marker) {
        this.map.removeLayer(this.marker); // Remove existing marker
      }
      this.updateLocation(e.latlng.lat, e.latlng.lng); // Update location on map click
    });

    setTimeout(() => {
      this.map.invalidateSize(); // Invalidate map size to ensure proper rendering
    }, 0);
  }

  updateLocation(lat: number, lng: number) {
    this.latitude = lat;
    this.longitude = lng;
    this.marker = L.marker([this.latitude, this.longitude], { icon: this.customIcon }).addTo(this.map); // Add marker to map
    this.geocodeLocation(this.latitude, this.longitude); // Geocode the updated location
  }

  geocodeLocation(lat: number, lng: number) {
    this.loading = true; // Set loading to true
    this.geocodingService.reverseGeocode(lat, lng).subscribe((data: { display_name: string; }) => {
      this.loading = false; // Set loading to false
      const displayName = data?.display_name || 'Unknown Location'; // Get display name from geocode data
      this.locationForm.patchValue({
        landmarkName: displayName,
        latitude: this.latitude,
        longitude: this.longitude
      });
    }, (error: any) => {
      this.loading = false; // Set loading to false
      this.locationForm.patchValue({
        landmarkName: 'Error fetching location',
        latitude: this.latitude,
        longitude: this.longitude
      });
    });
  }

  save() {
    this.snackBar.open('Location saved with name: ' + this.locationForm.get('landmarkName')?.value, 'Close', {
      duration: 3000,
      verticalPosition: 'top', // Set snackbar vertical position to top
    });
  }

  cancel() {
    this.snackBar.open('Action canceled!', 'Close', {
      duration: 3000,
      verticalPosition: 'top' // Set snackbar vertical position to top
    });
  }
}
