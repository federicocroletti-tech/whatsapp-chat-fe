import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  OperatorSession,
  ServiceRequest,
  ServiceRequestStatus,
} from '../../features/operator/models/service-request.model';

interface LoginResponse extends OperatorSession {}

@Injectable({ providedIn: 'root' })
export class OperatorApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl.replace(/\/$/, '')}/operator`;
  private readonly withCredentials = { withCredentials: true };

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      { username, password },
      this.withCredentials,
    );
  }

  session(): Observable<OperatorSession> {
    return this.http.get<OperatorSession>(`${this.apiUrl}/session`, this.withCredentials);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, this.withCredentials);
  }

  listRequests(status: ServiceRequestStatus | 'all'): Observable<{ requests: ServiceRequest[] }> {
    return this.http.get<{ requests: ServiceRequest[] }>(`${this.apiUrl}/requests`, {
      ...this.withCredentials,
      params: { status },
    });
  }

  updateStatus(
    id: string,
    status: ServiceRequestStatus,
  ): Observable<{ request: ServiceRequest }> {
    return this.http.patch<{ request: ServiceRequest }>(
      `${this.apiUrl}/requests/${encodeURIComponent(id)}/status`,
      { status },
      this.withCredentials,
    );
  }
}
