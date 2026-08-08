export interface Game {
  id: string;
  name: string;
  genre: string;
  year: number;
}

export type ConsoleModel = 'Fat' | 'Slim' | 'Super Slim';
export type ConsoleStatus = 'desbloqueado' | 'bloqueado';

export interface OrderData {
  model: ConsoleModel | null;
  status: ConsoleStatus | null;
  selectedGames: Game[];
  name: string;
  phone: string;
  neighborhood: string;
}
