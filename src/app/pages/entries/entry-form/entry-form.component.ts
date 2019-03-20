import { EntryService } from './../shared/entry.service';
import { ActivatedRoute, Routes, Router } from '@angular/router';
import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { switchMap, first } from 'rxjs/operators';
import toastr from 'toastr';
import { Entry } from '../shared/entry.model';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.sass']
})
export class EntryFormComponent implements OnInit, AfterContentChecked {

  currentAction: string;
  entryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  // tslint:disable-next-line:no-inferrable-types
  submittingForm: boolean = false;
  entry: Entry = new Entry();

  imaskConfig = {
    mask: Number,
    scale: 2,
    thousandSeparator: '',
    padFractionalZeros: true,
    normaLizeZeros: true,
    radix: ','
  };

  ptBr = {
    firstDayOfWeek: 0,
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
    dayNamesMin: ['Do', 'Te', 'Qu', 'Qu', 'Se', 'Sa'],
    monthNames: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    today: 'Hoje',
    clear: 'Limpar'
}

  constructor(
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.setCurrentAction();
    this.buildEntryForm();
    this.loadentry();
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;
    if (this.currentAction == 'new') {
      this.createEntry();
    } else {
      this.updateEntry();
    }
  }

  // PRIVATE METHODS

  private createEntry(){
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);

    this.entryService.create(entry)
      .subscribe(
        response => this.actionsForSuccess(response),
        error => this.actionsForError(error)
      );
  }

  private updateEntry(): any {
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);
    this.entryService.update(entry)
    .subscribe(
      response => this.actionsForSuccess(response),
      error => this.actionsForError(error)
    );
  }

  private buildEntryForm() {
    this.entryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null],
      type: [null, [Validators.required]],
      amount: [null, [Validators.required]],
      date: [null, [Validators.required]],
      paid: [null, [Validators.required]],
      categoryId: [null, [Validators.required]]
    });
  }

  private setCurrentAction(): any {
    if (this.route.snapshot.url[0].path === 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  private loadentry() {
    if (this.currentAction == 'edit') {
      this.route.paramMap.pipe(
        switchMap(params => this.entryService.getById(+params.get('id')))
      )
      .subscribe(entry => {
        this.entry = entry;
        this.entryForm.patchValue(this.entry);
      },
      error => alert('Orreu um erro no servidor, tente mais tarde!'));
    }
  }

  private setPageTitle() {
    if (this.currentAction == 'new') {
      this.pageTitle = 'Cadastro de Novo Lançamento';
    } else {
      const entryName = this.entry.name || '';
      this.pageTitle = 'Editando Lançamento ' + entryName;
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


  private actionsForSuccess(entry: Entry): void {
    toastr.success("Solicitação processada com sucesso!");

    // redireciona para uma pagina e em seguida para outra
    this.router.navigateByUrl("entries",{ skipLocationChange: true }).then(
      () => this.router.navigate(["entries",entry.id,"edit"])
    );
  }
}
