export interface Atividade {
  ID: number;
  Titulo: string;
  Descricao: string;
  Status: 'todo' | 'doing' | 'done';
  DataLimite?: string;
}