import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '../../services';
import { CallbackComponent } from './callback.component';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-test-root-component',
  standalone: true,
  imports: [RouterModule],
  template: '<router-outlet></router-outlet>',
})
class TestRootComponent {
  @ViewChild(RouterOutlet)
  routerOutlet!: RouterOutlet;
}

@Component({
  selector: '',
  template: '',
  standalone: true,
})
class LogoutComponent {}

describe('CallbackComponent', () => {
  let router: Router;
  let location: Location;
  let rootFixture: ComponentFixture<TestRootComponent>;
  let rootComponent: TestRootComponent;
  let authService: AuthService;

  beforeEach(() => {
    authService = { auth: jest.fn() } as any as AuthService;
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot(
          [
            { path: '', component: TestRootComponent },
            { path: 'logout', component: LogoutComponent },
            { path: 'callback', component: CallbackComponent },
          ],
          {}
        ),
      ],
    })
      .overrideProvider(AuthService, { useValue: authService })
      .compileComponents();

    rootFixture = TestBed.createComponent(TestRootComponent);
    rootComponent = rootFixture.componentInstance;

    rootFixture.detectChanges();
    router = TestBed.inject(Router);
    router.initialNavigation();
    location = TestBed.inject(Location);
  });

  it('throws error and redirect to the logout with login error if there is no code', async () => {
    await router.navigate(['/callback']);

    const component = rootComponent.routerOutlet.component;

    expect(component).toBeTruthy();
    expect(location.path()).toBe('/logout?error=loginError');
  });

  it('redirect to the logout with login error if there is no code', async () => {
    const state = btoa(encodeURI('http://localhost'));
    await router.navigate(['/callback'], {
      queryParams: {
        state,
      },
    });

    const component = rootComponent.routerOutlet.component;

    expect(component).toBeTruthy();
    expect(location.path()).toBe('/logout?error=loginError');
  });

  it('redirect to the logout with login error if the state does not match', async () => {
    await router.navigate(['/callback'], {
      queryParams: {
        code: 'foo',
      },
    });

    expect(location.path()).toBe('/logout?error=loginError');
  });

  it('redirect to home if everything went well', async () => {
    const state = btoa(encodeURI('http://localhost?p1=v1#hash'));
    await router.navigate(['/callback'], {
      queryParams: {
        code: 'foo',
        state,
      },
    });

    const component = rootComponent.routerOutlet.component;

    expect(router.getCurrentNavigation()).toBe(null);
    expect(component).toBeTruthy();
    expect(location.path()).toBe('?p1=v1');
  });
});
