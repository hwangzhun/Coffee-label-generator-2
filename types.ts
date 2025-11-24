export type LabelSize = '105x74' | '60x85';
export type BeanCategory = 'filter' | 'espresso';

export interface CoffeeBean {
  id: string;
  
  // Naming
  nameLight: string; // e.g. 天堂庄园 (Light font)
  nameBold: string;  // e.g. 瑰夏 (Bold font)
  
  country: string; // For flag lookup
  origin: string;
  process: string;
  roastLevel: '浅烘焙' | '中浅烘焙' | '中度烘焙' | '中深烘焙' | '深度烘焙';
  altitude: string;
  
  // Flavors (No AI, Dual Language)
  flavorCN: string;
  flavorEN: string;
  
  // 105x74 Specifics
  category: BeanCategory;
  tasteBalance: number; // -4 (更酸) -> 4 (更苦)

  // Visuals
  labelSize: LabelSize;
  showDivider: boolean; // Replaces backgroundTheme
}

export const INITIAL_BEAN: CoffeeBean = {
  id: 'new',
  nameLight: '',
  nameBold: '',
  country: '',
  origin: '',
  process: '',
  roastLevel: '中度烘焙',
  altitude: '',
  flavorCN: '',
  flavorEN: '',
  category: 'filter',
  tasteBalance: 0,
  labelSize: '105x74',
  showDivider: true
};

export interface PrintJobItem {
  id: string;
  bean: CoffeeBean;
  quantity: number;
  weight: number;
  productionDate: string;
}
