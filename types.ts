export interface CoffeeBean {
  id: string;
  name: string;
  origin: string;
  process: string;
  roastLevel: '浅烘焙' | '中浅烘焙' | '中度烘焙' | '中深烘焙' | '深度烘焙';
  altitude: string;
  flavorNotes: string; // Comma separated or short phrases
  description: string;
  backgroundImageUrl?: string; // Optional custom background
}

export const INITIAL_BEAN: CoffeeBean = {
  id: 'new',
  name: '',
  origin: '',
  process: '',
  roastLevel: '中度烘焙',
  altitude: '',
  flavorNotes: '',
  description: '',
  backgroundImageUrl: ''
};

export interface PrintJobItem {
  id: string;
  bean: CoffeeBean;
  quantity: number;
}