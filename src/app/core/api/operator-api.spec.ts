import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OperatorApi } from './operator-api';

describe('OperatorApi', () => {
  let api: OperatorApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(OperatorApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses credentialed requests for login and session without storing the password', () => {
    api.login('operator', 'test-password').subscribe();
    const login = http.expectOne('https://whatsapp-bot-n6uq.onrender.com/operator/login');
    expect(login.request.withCredentials).toBe(true);
    expect(login.request.body).toEqual({ username: 'operator', password: 'test-password' });
    login.flush({ username: 'operator' });

    api.session().subscribe();
    const session = http.expectOne('https://whatsapp-bot-n6uq.onrender.com/operator/session');
    expect(session.request.withCredentials).toBe(true);
    session.flush({ username: 'operator' });
  });

  it('filters requests and updates their status using the operator API', () => {
    api.listRequests('received').subscribe();
    const list = http.expectOne(
      (request) =>
        request.url === 'https://whatsapp-bot-n6uq.onrender.com/operator/requests' &&
        request.params.get('status') === 'received',
    );
    expect(list.request.withCredentials).toBe(true);
    list.flush({ requests: [] });

    api.updateStatus('42', 'in_review').subscribe();
    const update = http.expectOne('https://whatsapp-bot-n6uq.onrender.com/operator/requests/42/status');
    expect(update.request.method).toBe('PATCH');
    expect(update.request.withCredentials).toBe(true);
    expect(update.request.body).toEqual({ status: 'in_review' });
    update.flush({ request: { id: '42', status: 'in_review' } });
  });

  it('sends logout without placing session credentials in request payloads', () => {
    api.logout().subscribe();
    const logout = http.expectOne('https://whatsapp-bot-n6uq.onrender.com/operator/logout');
    expect(logout.request.method).toBe('POST');
    expect(logout.request.withCredentials).toBe(true);
    expect(logout.request.body).toEqual({});
    logout.flush(null);
  });
});
