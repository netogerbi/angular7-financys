import { ActivatedRoute, Router } from '@angular/router';
import { OnInit, AfterContentChecked, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';

import { BaseResourceService } from 'src/app/shared/services/base-resource.service';
import { BaseResourceModel } from 'src/app/shared/models/base-resource.model';

import toastr from 'toastr';

export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {

  currentAction: string;
  resourceForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  // tslint:disable-next-line:no-inferrable-types
  submittingForm: boolean = false;

  protected route: ActivatedRoute;
  protected router: Router;
  protected formBuilder: FormBuilder;

  constructor(
    protected injector: Injector,
    public resource: T,
    protected resourceService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData) => T
  ) {
    this.route = this.injector.get(ActivatedRoute);
    this.router = this.injector.get(Router);
    this.formBuilder = this.injector.get(FormBuilder);

   }

  ngOnInit() {
    this.setCurrentAction();
    this.buildResourceForm();
    this.loadResource();
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;
    if (this.currentAction == 'new') {
      this.createResource();
    } else {
      this.updateResource();
    }
  }

  // PRIVATE METHODS

  private setCurrentAction(): any {
    if (this.route.snapshot.url[0].path === 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  protected loadResource() {
    if (this.currentAction == 'edit') {
      this.route.paramMap.pipe(
        switchMap(params => this.resourceService.getById(+ params.get('id')))
      )
      .subscribe(resource => {
        this.resource = resource;
        this.resourceForm.patchValue(this.resource);
      },
      error => alert('Orreu um erro no servidor, tente mais tarde!'));
    }
  }


  protected setPageTitle() {
    if (this.currentAction == 'new') {
      this.pageTitle = this.creationPageTitle();
    } else {
      this.pageTitle = this.editionPageTitle();
    }
  }

  protected creationPageTitle(): string {
    return "Novo";
  }

  protected editionPageTitle(): string {
    return "Edição";
  }

  protected createResource() {
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
    this.resourceService.create(resource)
      .subscribe(
        response => this.actionsForSuccess(response),
        error => this.actionsForError(error)
      );
  }

  protected updateResource(): any {
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
    this.resourceService.update(resource)
    .subscribe(
      response => this.actionsForSuccess(response),
      error => this.actionsForError(error)
    );
  }

  protected actionsForSuccess(resource: T): void {
    toastr.success("Solicitação processada com sucesso!");

    const baseComponentPath = this.route.snapshot.parent.url[0].path;

    // redireciona para uma pagina e em seguida para outra
    this.router.navigateByUrl(baseComponentPath, { skipLocationChange: true }).then(
      () => this.router.navigate([baseComponentPath, resource.id, 'edit'])
    );
  }


  protected actionsForError(error: any): void {
    toastr.error("Ocorreu um erro ao preencher o formulário!");

    this.submittingForm = false;

    if (error.status === 422) {
      this.serverErrorMessages = JSON.parse(error._body).errors;
    } else {
      this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor tente mais tarde."];
    }
  }

  protected abstract buildResourceForm(): void;

}



