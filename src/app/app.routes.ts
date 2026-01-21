import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'productos',
    pathMatch: 'full'
  },
  {
    path: 'productos',
    loadComponent: () => 
      import('@features/products/pages/product-list/product-list.component')
        .then(m => m.ProductListComponent)
  },
  {
    path: 'productos/nuevo',
    loadComponent: () => 
      import('@features/products/pages/product-form/product-form.component')
        .then(m => m.ProductFormComponent)
  },
  {
    path: 'productos/editar/:id',
    loadComponent: () => 
      import('@features/products/pages/product-form/product-form.component')
        .then(m => m.ProductFormComponent)
  },
  {
    path: '**',
    redirectTo: 'productos'
  }
];
