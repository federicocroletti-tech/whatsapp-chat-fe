import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OperatorApi } from '../../../../core/api/operator-api';
import {
  ServiceRequest,
  ServiceRequestStatus,
} from '../../models/service-request.model';

type RequestFilter = ServiceRequestStatus | 'all';

const FILTERS: readonly RequestFilter[] = ['all', 'received', 'in_review', 'closed'];

@Component({
  selector: 'app-operator-page',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './operator-page.html',
  styleUrl: './operator-page.scss',
})
export class OperatorPage implements OnInit {
  readonly authenticated = signal(false);
  readonly initializing = signal(true);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly requests = signal<readonly ServiceRequest[]>([]);
  readonly selectedId = signal<string | null>(null);
  readonly selectedRequest = computed(
    () => this.requests().find((request) => request.id === this.selectedId()) ?? null,
  );
  readonly statusFilters = FILTERS;
  readonly statusOptions: readonly ServiceRequestStatus[] = ['received', 'in_review', 'closed'];

  username = '';
  password = '';
  filter: RequestFilter = 'all';

  constructor(private readonly api: OperatorApi) {}

  ngOnInit(): void {
    this.api.session().subscribe({
      next: () => {
        this.authenticated.set(true);
        this.initializing.set(false);
        this.loadRequests();
      },
      error: (error: unknown) => {
        this.initializing.set(false);
        if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
          this.error.set(this.errorMessage(error));
        }
      },
    });
  }

  login(): void {
    const username = this.username.trim();
    if (!username || !this.password || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);
    this.api.login(username, this.password).subscribe({
      next: () => {
        this.password = '';
        this.authenticated.set(true);
        this.loading.set(false);
        this.loadRequests();
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(this.errorMessage(error));
      },
    });
  }

  logout(): void {
    this.loading.set(true);
    this.api.logout().subscribe({
      next: () => this.finishLogout(),
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(this.errorMessage(error));
      },
    });
  }

  loadRequests(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.listRequests(this.filter).subscribe({
      next: ({ requests }) => {
        this.requests.set(requests);
        if (!requests.some((request) => request.id === this.selectedId())) {
          this.selectedId.set(requests[0]?.id ?? null);
        }
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.finishLogout();
          return;
        }
        this.error.set(this.errorMessage(error));
      },
    });
  }

  selectFilter(value: string): void {
    if (!FILTERS.includes(value as RequestFilter)) return;
    this.filter = value as RequestFilter;
    this.selectedId.set(null);
    if (this.authenticated()) this.loadRequests();
  }

  updateStatus(request: ServiceRequest, value: string): void {
    if (!this.statusOptions.includes(value as ServiceRequestStatus) || this.loading()) return;
    const status = value as ServiceRequestStatus;
    this.loading.set(true);
    this.error.set(null);
    this.api.updateStatus(request.id, status).subscribe({
      next: ({ request: updated }) => {
        this.requests.update((requests) =>
          requests.map((current) => (current.id === updated.id ? updated : current)),
        );
        this.loading.set(false);
        if (this.filter !== 'all' && this.filter !== status) this.loadRequests();
      },
      error: (error: unknown) => {
        this.loading.set(false);
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.finishLogout();
          return;
        }
        this.error.set(this.errorMessage(error));
      },
    });
  }

  statusLabel(status: ServiceRequestStatus): string {
    switch (status) {
      case 'received':
        return 'Nuova';
      case 'in_review':
        return 'In lavorazione';
      case 'closed':
        return 'Chiusa';
    }
  }

  private finishLogout(): void {
    this.authenticated.set(false);
    this.requests.set([]);
    this.selectedId.set(null);
    this.password = '';
    this.loading.set(false);
  }

  private errorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Errore imprevisto. Riprova.';
    }
    if (error.status === 401) return 'Credenziali non valide o sessione scaduta.';
    if (error.status === 429) return 'Troppi tentativi di accesso. Riprova più tardi.';
    if (error.status === 0) return 'Backend non raggiungibile. Verifica la connessione.';
    return 'Operazione non riuscita. Riprova.';
  }
}
