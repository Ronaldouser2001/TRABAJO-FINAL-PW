import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ResourceResponse {
  id: number;
  title: string;
  description: string;
  university: string;
  category: string;
  file_url?: string;
  created_at: string;
}

export interface ResourceCreate {
  title: string;
  description: string;
  university: string;
  category: string;
  file_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/resources';

  getResources(university?: string): Observable<ResourceResponse[]> {
    const url = university ? `${this.apiUrl}/?university=${university}` : `${this.apiUrl}/`;
    return this.http.get<ResourceResponse[]>(url);
  }

  createResource(resource: ResourceCreate): Observable<ResourceResponse> {
    return this.http.post<ResourceResponse>(`${this.apiUrl}/`, resource);
  }

  getResourceById(id: number): Observable<ResourceResponse> {
    return this.http.get<ResourceResponse>(`${this.apiUrl}/${id}`);
  }

  deleteResource(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}