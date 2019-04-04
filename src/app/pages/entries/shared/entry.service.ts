import { flatMap} from 'rxjs/operators';
import { Injector, Injectable } from '@angular/core';
import { BaseResourceService } from 'src/app/shared/services/base-resource.service';
import { CategoryService } from './../../categories/shared/category.service';
import { Entry } from './entry.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EntryService extends BaseResourceService<Entry> {

  constructor(protected injector: Injector, private categoriService: CategoryService) {
    super('api/entries', injector);
  }

  create(entry: Entry): Observable<Entry> {
    return this.categoriService.getById(entry.categoryId).pipe(
      flatMap( category => { // flatMap tem acesso ao objeto do observable
        entry.category = category;
          return super.create(entry);
      })
    );
  }

  update(entry: Entry): Observable<Entry> {
    return this.categoriService.getById(entry.categoryId).pipe(
      flatMap(category => {
        entry.category = category;
          return super.update(entry);
      })
    );
  }

  // PROTECTED METHODS
  protected jsonDataToResources(jsonData: any): Entry[] {
    const entries: Entry[] = [];
    jsonData.forEach(element => entries.push(Object.assign(new Entry(), element)));
    return entries;
  }

  protected jsonDataToResource(jsonData: any): Entry {
    return Object.assign(new Entry(), jsonData);
  }

}
