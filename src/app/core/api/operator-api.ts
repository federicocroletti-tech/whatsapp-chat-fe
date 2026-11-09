import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  OperatorSession,
  ServiceRequest,
  ServiceRequestStatus,
  TenantProfile,
} from '../../features/operator/models/service-request.model';

@Injectable({ providedIn: 'root' })
export class OperatorApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl.replace(/\/$/, '');
  private readonly withCredentials = { withCredentials: true };

  tenant(tenantSlug: string): Observable<TenantProfile> {
    return this.http.get<TenantProfile>(
      `${this.baseUrl}/public/tenants/${encodeURIComponent(tenantSlug)}`,
    );
  }

  login(tenantSlug: string, username: string, password: string): Observable<OperatorSession> {
    return this.http.post<OperatorSession>(
      `${this.operatorUrl(tenantSlug)}/login`,
      { username, password },
      this.withCredentials,
    );
  }

  session(tenantSlug: string): Observable<OperatorSession> {
    return this.http.get<OperatorSession>(
      `${this.operatorUrl(tenantSlug)}/session`,
      this.withCredentials,
    );
  }

  logout(tenantSlug: string): Observable<void> {
    return this.http.post<void>(`${this.operatorUrl(tenantSlug)}/logout`, {}, this.withCredentials);
  }

  listRequests(
    tenantSlug: string,
    status: ServiceRequestStatus | 'all',
  ): Observable<{ requests: ServiceRequest[] }> {
    return this.http.get<{ requests: ServiceRequest[] }>(
      `${this.operatorUrl(tenantSlug)}/requests`,
      {
        ...this.withCredentials,
        params: { status },
      },
    );
  }

  updateStatus(
    tenantSlug: string,
    id: string,
    status: ServiceRequestStatus,
  ): Observable<{ request: ServiceRequest }> {
    return this.http.patch<{ request: ServiceRequest }>(
      `${this.operatorUrl(tenantSlug)}/requests/${encodeURIComponent(id)}/status`,
      { status },
      this.withCredentials,
    );
  }

  private operatorUrl(tenantSlug: string): string {
    return `${this.baseUrl}/operator/${encodeURIComponent(tenantSlug)}`;
  }
}
