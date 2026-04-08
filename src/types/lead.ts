export type LeadSource = "site" | "instagram" | "tiktok" | "call" | "walk-in";

export type LeadStatus = 
  | "new" 
  | "in-work" 
  | "visit" 
  | "bought" 
  | "no-answer" 
  | "defect" 
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

export const STATUS_NAMES: Record<string, string> = {
  "new": "Новый",
  "in-work": "В работе",
  "visit": "Приезд",
  "bought": "Оформился/Купил",
  "no-answer": "Не дозвон",
  "defect": "Брак/Тест/Отказ",
  "thinking": "Думает",
  "callback": "Перезвонить",
  // Fallbacks for old statuses
  "signed": "Оформился/Купил",
  "decline": "Брак/Тест/Отказ",
  "bank-decline": "Брак/Тест/Отказ",
  "test": "Брак/Тест/Отказ",
};

export const SOURCE_NAMES: Record<LeadSource, string> = {
  "site": "Сайт",
  "instagram": "Instagram",
  "tiktok": "TikTok",
  "call": "Звонок",
  "walk-in": "С улицы",
};
