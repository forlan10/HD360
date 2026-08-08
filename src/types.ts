export interface Game {
  id: string;
  name: string;
  genre: string;
  year: number | null;
  created_at?: string;
}

export interface Accessory {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  created_at?: string;
}

export type ConsoleModel = 'Fat' | 'Slim' | 'Super Slim' | 'Nao sei';
export type ConsoleStatus = 'desbloqueado' | 'bloqueado' | 'Nao sei';

export type OrderStatus = 'novo' | 'em_andamento' | 'concluido' | 'cancelado';

export interface SelectedGame {
  id: string;
  name: string;
  genre: string;
}

export interface SelectedAccessory {
  id: string;
  name: string;
  price: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  neighborhood: string;
  console_model: string;
  console_status: string;
  selected_games: SelectedGame[];
  selected_accessories: SelectedAccessory[];
  status: OrderStatus;
  created_at: string;
}

export interface NewOrder {
  customer_name: string;
  customer_phone: string;
  neighborhood: string;
  console_model: string;
  console_status: string;
  selected_games: SelectedGame[];
  selected_accessories: SelectedAccessory[];
}

export interface StoreSettings {
  id: number;
  upsell_enabled: boolean;
  hero_title: string;
  hero_subtitle: string;
  badge_text: string;
  background_image_url: string | null;
  updated_at?: string;
}
