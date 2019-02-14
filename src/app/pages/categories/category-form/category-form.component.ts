import { CategoryService } from './../shared/category.service';
import { ActivatedRoute, Routes, Router } from '@angular/router';
import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import toastr from 'toastr';
import { Category } from '../shared/category.model';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.sass']
})
export class CategoryFormComponent implements OnInit, AfterContentChecked {

  currentAction: string;
  categoryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  // tslint:disable-next-line:no-inferrable-types
  submittingForm: boolean = false;
  category: Category = new Category();

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadcategory();
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;
    if (this.currentAction == 'new') {
      this.createCategory();
    } else {
      this.updateCategory();
    }
  }

  // PRIVATE METHODS

  private createCategory(){
    const category: Category = Object.assign(new Category(), this.categoryForm.value);

    this.categoryService.create(category)
      .subscribe(
        response => this.actionsForSuccess(response),
        error => this.actionsForError(error)
      );
  }

  private updateCategory(): any {
    const category: Category = Object.assign(new Category(), this.categoryForm.value);
    this.categoryService.update(category)
    .subscribe(
      response => this.actionsForSuccess(response),
      error => this.actionsForError(error)
    );
  }

  private buildCategoryForm() {
    this.categoryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null]
    });
  }

  private setCurrentAction(): any {
    if (this.route.snapshot.url[0].path === 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  private loadcategory() {
    if (this.currentAction == 'edit') {
      this.route.paramMap.pipe(
        switchMap(params => this.categoryService.getById(+params.get('id')))
      )
      .subscribe(category => {
        this.category = category;
        this.categoryForm.patchValue(this.category);
      },
      error => alert('Oorreu um erro no servidor, tente mais tarde!'));
    }
  }

  private setPageTitle() {
    if (this.currentAction == 'new') {
      this.pageTitle = 'Cadastro de Nova Categoria';
    } else {
      const categoryName = this.category.name || '';
      this.pageTitle = 'Editando Categoria ' + categoryName;
    }
  }


  private actionsForError(error: any): void {
    toastr.error("Ocorreu um erro ao preencher o formulário!");

    this.submittingForm = false;

    if (error.status === 422) {
      this.serverErrorMessages = JSON.parse(error._body).errors;
    } else {
      this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor tente mais tarde."];
    }
  }


  private actionsForSuccess(category: Category): void {
    toastr.success("Solicitação processada com sucesso!");

    // redireciona para uma pagina e em seguida para outra
    this.router.navigateByUrl("categories",{ skipLocationChange: true }).then(
      () => this.router.navigate(["categories",category.id,"edit"])
    );
  }
}
