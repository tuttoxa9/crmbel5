export type LeadSource = "site" | "instagram" | "tiktok" | "call" | "walk-in";

export type LeadStatus = 
  | "new" 
  | "in-work" 
  | "visit" 
  | "signed" 
  | "bought" 
  | "no-answer" 
  | "decline" 
  | "bank-decline" 
  | "defect" 
  | "test" 
  | "thinking" 
  | "callback";

export interface LeadHistory {
  id: string;
  status: LeadStatus;
  notes?: string;
  changedAt: number; // Unix timestamp
}

export interface Lead {
  id: string;
  name: string;
  phone?: string;
  car?: string;
  source: LeadSource;
  status: LeadStatus;
  notes?: string;
  nextActionDate?: number | null; // Unix timestamp
  nextActionTime?: string | null; // "HH:mm"
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}

export const STATUS_NAMES: Record<LeadStatus, string> = {
  "new": "Новый",
  "in-work": "В работе",
  "visit": "Приезд",
  "signed": "Оформился",
  "bought": "Купил",
  "no-answer": "Не дозвон",
  "decline": "Отказ",
  "bank-decline": "Отказ банка",
  "defect": "Брак",
  "test": "Тест",
  "thinking": "Думает",
  "callback": "Перезвонить",
};

export const SOURCE_NAMES: Record<LeadSource, string> = {
  "site": "Сайт",
  "instagram": "Instagram",
  "tiktok": "TikTok",
  "call": "Звонок",
  "walk-in": "С улицы",
};
