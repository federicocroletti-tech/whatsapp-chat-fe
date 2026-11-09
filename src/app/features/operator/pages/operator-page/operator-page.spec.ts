import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { OperatorPage } from './operator-page';

describe('OperatorPage', () => {
  let fixture: ComponentFixture<OperatorPage>;
  let http: HttpTestingController;
  let routeParams: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  beforeEach(async () => {
    routeParams = new BehaviorSubject(convertToParamMap({ tenantSlug: 'officina-a' }));
    await TestBed.configureTestingModule({
      imports: [OperatorPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: routeParams.asObservable(),
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OperatorPage);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the tenant privacy and branding before presenting the tenant-scoped login', () => {
    fixture.detectChanges();

    http.expectOne('https://whatsapp-bot-n6uq.onrender.com/public/tenants/officina-a').flush({
      displayName: 'Officina A',
      privacyUrl: 'https://officina.example/privacy',
      branding: { primaryColor: '#123456', accentColor: '#abcdef' },
    });
    http
      .expectOne('https://whatsapp-bot-n6uq.onrender.com/operator/officina-a/session')
      .flush({ error: 'Non autorizzato' }, { status: 401, statusText: 'Unauthorized' });

    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('header .eyebrow')?.textContent).toContain('Officina A');
    expect(element.querySelector('form a')?.getAttribute('href')).toBe(
      'https://officina.example/privacy',
    );
    expect(
      (element.querySelector('main') as HTMLElement).style.getPropertyValue('--tenant-primary'),
    ).toBe('#123456');
  });

  it('authenticates and loads requests only within the configured tenant route', () => {
    fixture.detectChanges();
    http.expectOne('https://whatsapp-bot-n6uq.onrender.com/public/tenants/officina-a').flush({
      displayName: 'Officina A',
      privacyUrl: 'https://officina.example/privacy',
      branding: {},
    });
    http
      .expectOne('https://whatsapp-bot-n6uq.onrender.com/operator/officina-a/session')
      .flush({ error: 'Non autorizzato' }, { status: 401, statusText: 'Unauthorized' });

    const component = fixture.componentInstance;
    component.username = 'operator';
    component.password = 'test-password';
    component.login();
    const login = http.expectOne(
      'https://whatsapp-bot-n6uq.onrender.com/operator/officina-a/login',
    );
    expect(login.request.body).toEqual({ username: 'operator', password: 'test-password' });
    login.flush({ username: 'operator', role: 'owner' });

    const requests = http.expectOne(
      (request) =>
        request.url === 'https://whatsapp-bot-n6uq.onrender.com/operator/officina-a/requests' &&
        request.params.get('status') === 'all',
    );
    requests.flush({ requests: [] });
    expect(component.authenticated()).toBe(true);
  });

  it('resets the inbox and reloads the tenant when the route slug changes', () => {
    fixture.detectChanges();
    http.expectOne('https://whatsapp-bot-n6uq.onrender.com/public/tenants/officina-a').flush({
      displayName: 'Officina A',
      privacyUrl: 'https://officina.example/privacy',
      branding: {},
    });
    http
      .expectOne('https://whatsapp-bot-n6uq.onrender.com/operator/officina-a/session')
      .flush({ error: 'Non autorizzato' }, { status: 401, statusText: 'Unauthorized' });

    routeParams.next(convertToParamMap({ tenantSlug: 'officina-b' }));
    http.expectOne('https://whatsapp-bot-n6uq.onrender.com/public/tenants/officina-b').flush({
      displayName: 'Officina B',
      privacyUrl: 'https://officina-b.example/privacy',
      branding: {},
    });
    http
      .expectOne('https://whatsapp-bot-n6uq.onrender.com/operator/officina-b/session')
      .flush({ error: 'Non autorizzato' }, { status: 401, statusText: 'Unauthorized' });

    fixture.detectChanges();
    expect(fixture.componentInstance.tenant()?.displayName).toBe('Officina B');
    expect(fixture.componentInstance.requests()).toEqual([]);
    expect(fixture.componentInstance.authenticated()).toBe(false);
  });
});
