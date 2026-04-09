import { create } from 'zustand';
import { startOfDay } from 'date-fns';

interface DateStore {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export const useDateStore = create<DateStore>((set) => ({
  selectedDate: startOfDay(new Date()),
  setSelectedDate: (date: Date) => set({ selectedDate: startOfDay(date) }),
}));
