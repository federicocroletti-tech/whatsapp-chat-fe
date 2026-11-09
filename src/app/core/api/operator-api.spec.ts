import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OperatorApi } from './operator-api';

describe('OperatorApi', () => {
  let api: OperatorApi;
  let http: HttpTestingController;
  const root = 'https://whatsapp-bot-n6uq.onrender.com';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(OperatorApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads public tenant branding without exposing provider credentials', () => {
    api.tenant('officina-a').subscribe();
    const request = http.expectOne(`${root}/public/tenants/officina-a`);
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(false);
    request.flush({
      displayName: 'Officina A',
      privacyUrl: 'https://officina.example/privacy',
      branding: { primaryColor: '#123456' },
    });
  });

  it('uses tenant-scoped credentialed sessions without storing passwords', () => {
    api.login('officina-a', 'operator', 'test-password').subscribe();
    const login = http.expectOne(`${root}/operator/officina-a/login`);
    expect(login.request.withCredentials).toBe(true);
    expect(login.request.body).toEqual({ username: 'operator', password: 'test-password' });
    login.flush({ username: 'operator', role: 'owner' });

    api.session('officina-a').subscribe();
    const session = http.expectOne(`${root}/operator/officina-a/session`);
    expect(session.request.withCredentials).toBe(true);
    session.flush({ username: 'operator', role: 'owner' });
  });

  it('filters tenant requests and updates their status using the operator API', () => {
    api.listRequests('officina-a', 'received').subscribe();
    const list = http.expectOne(
      (request) =>
        request.url === `${root}/operator/officina-a/requests` &&
        request.params.get('status') === 'received',
    );
    expect(list.request.withCredentials).toBe(true);
    list.flush({ requests: [] });

    api.updateStatus('officina-a', '42', 'in_review').subscribe();
    const update = http.expectOne(`${root}/operator/officina-a/requests/42/status`);
    expect(update.request.method).toBe('PATCH');
    expect(update.request.withCredentials).toBe(true);
    expect(update.request.body).toEqual({ status: 'in_review' });
    update.flush({ request: { id: '42', status: 'in_review' } });
  });

  it('sends logout without placing session credentials in request payloads', () => {
    api.logout('officina-a').subscribe();
    const logout = http.expectOne(`${root}/operator/officina-a/logout`);
    expect(logout.request.method).toBe('POST');
    expect(logout.request.withCredentials).toBe(true);
    expect(logout.request.body).toEqual({});
    logout.flush(null);
  });
});
