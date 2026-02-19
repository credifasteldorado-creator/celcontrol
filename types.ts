
export enum EquipmentStatus {
  DISPONIBLE = 'disponible',
  VENDIDO = 'vendido'
}

export interface Equipment {
  id: string;
  modelo: string;
  imei: string;
  estado: EquipmentStatus;
  created_at?: string;
}

export interface Sale {
  id: string;
  equipo_id: string;
  cliente: string;
  telefono: string;
  canal: string;
  enganche: number;
  created_at?: string;
  // Join fields
  modelo?: string;
  imei?: string;
}

export type ActiveTab = 'inventory' | 'sales' | 'logs';
