import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./microblogs/admin/admin.page').then((m) => m.AdminPage),
  },
  {
    path: 'trip/:country',
    loadComponent: () =>
      import('./microblogs/country-blog-list/country-blog-list.page').then(
        (m) => m.CountryBlogListPage
      ),
  },
];
