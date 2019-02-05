import { Category } from './pages/categories/shared/category.model';
import { InMemoryDbService } from 'angular-in-memory-web-api';

export class InMemoryDatabase implements InMemoryDbService {

  createDb() {
    const categories: Category[] = [
      { id: 1, name: 'Lazer', description: 'piscina, praia, cinema' },
      { id: 2, name: 'Eletrônicos', description: 'Computadores e mais' },
      { id: 1, name: 'Financeiro', description: 'Recebimento de Salários' },
      { id: 1, name: 'Freelance', description: 'Working by myself' }
    ];
    return { categories };
  }

}
