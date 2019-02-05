import { InMemoryDbService } from 'angular-in-memory-web-api';

export class InMemoryDatabase implements InMemoryDbService {

  createDb() {
    const categories = [
      {id: 1, nome: 'Lazer', description: 'piscina, praia, cinema'},
      {id: 2, nome: 'Eletrônicos', description: 'Computadores e mais'},
      {id: 1, nome: 'Financeiro', description: 'Recebimento de Salários'},
      {id: 1, nome: 'Freelance', description: 'Working by myself'}
    ];
    return categories;
  }

}
