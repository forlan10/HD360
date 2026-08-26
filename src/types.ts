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

export type GameProductionStatus = 'pendente' | 'baixado' | 'convertido' | 'no_hd';

export const GAME_STATUS_ORDER: GameProductionStatus[] = ['pendente', 'baixado', 'convertido', 'no_hd'];

export const GAME_STATUS_LABELS: Record<GameProductionStatus, string> = {
  pendente: 'Falta baixar',
  baixado: 'Baixado, falta converter',
  convertido: 'Formato GOD',
  no_hd: 'Transferido para o HD',
};

export const GAME_STATUS_SHORT: Record<GameProductionStatus, string> = {
  pendente: 'Pendente',
  baixado: 'Baixado',
  convertido: 'Convertido',
  no_hd: 'No HD',
};

export const GAME_STATUS_COLORS: Record<GameProductionStatus, string> = {
  pendente: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  baixado: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  convertido: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  no_hd: 'bg-xbox-500/15 text-xbox-400 border-xbox-500/30',
};

export interface SelectedGame {
  id: string;
  name: string;
  genre: string;
  status?: GameProductionStatus;
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
  total_price: number | null;
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
  price_package_1: number;
  price_package_2: number;
  price_package_3: number;
  price_unlock_rgh: number;
  whatsapp_button_enabled: boolean;
  whatsapp_number: string;
  invoice_screen_enabled: boolean;
  post_purchase_order: 'upsell_first' | 'invoice_first';
  tier_1_max: number;
  tier_2_max: number;
  tier_3_max: number;
  updated_at?: string;
}

export type SuggestionStatus = 'pendente' | 'adicionado' | 'descartado';

export interface GameSuggestion {
  id: string;
  game_name: string;
  game_name_normalized: string;
  suggested_by: string | null;
  order_id: string | null;
  status: SuggestionStatus;
  created_at: string;
}

export type LeadStatus = 'comprou' | 'problema_entrega' | 'nao_pediu' | 'nao_respondeu';

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  comprou: 'Comprou',
  problema_entrega: 'Deu problema na entrega',
  nao_pediu: 'Não pediu',
  nao_respondeu: 'Não respondeu',
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  comprou: 'bg-xbox-500/15 text-xbox-400 border-xbox-500/30',
  problema_entrega: 'bg-red-500/15 text-red-400 border-red-500/30',
  nao_pediu: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  nao_respondeu: 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30',
};

export interface Lead {
  id: string;
  name: string;
  phone: string | null;
  neighborhood: string | null;
  interests: string | null;
  status: LeadStatus;
  contact_date: string;
  order_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MasterLibraryEntry {
  id: string;
  game_name: string;
  game_name_normalized: string;
  game_id: string | null;
  is_working: boolean;
  not_working_reason: string | null;
  dubbed_pt: boolean;
  subtitles_pt: boolean;
  special_install: string | null;
  created_at?: string;
}
