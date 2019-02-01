import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CategoryFormComponent } from './category-form/category-form.component';
import { CategoryListComponent } from './category-list/category-list.component';

/**
 * site.com/categories => list (master)
 * site.com/categories/id => form (detail)
 * site.com/categories/id/edit => form (detail)
*/
const routes: Routes = [

  { path: '' , component: CategoryListComponent },
  { path: 'new' , component: CategoryFormComponent },
  { path: ':id/edit' , component: CategoryFormComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoriesRoutingModule { }
