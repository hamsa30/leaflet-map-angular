import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  // Define the API URL for reverse geocoding
  private apiUrl = 'https://geocode.maps.co/reverse?api_key=65e9386e592cd861516935dkwd2f0cd';

  constructor(private http: HttpClient) {}

  // Method for reverse geocoding with latitude and longitude parameters
  reverseGeocode(lat: number, lng: number): Observable<any> {
    // Construct the complete URL with latitude and longitude parameters
    const url = `${this.apiUrl}&lat=${lat}&lon=${lng}`;

    return this.http.get<any>(url);
  }
}
