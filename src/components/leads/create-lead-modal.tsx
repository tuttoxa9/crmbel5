"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LeadSource } from "@/types/lead";
import { Globe, Camera, Music2, Phone, MapPin } from "lucide-react";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { toast } from "sonner";

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOURCES: { id: LeadSource; name: string; icon: React.ElementType }[] = [
  { id: "site", name: "Сайт", icon: Globe },
  { id: "instagram", name: "Instagram", icon: Camera },
  { id: "tiktok", name: "TikTok", icon: Music2 },
  { id: "call", name: "Звонок", icon: Phone },
  { id: "walk-in", name: "С улицы", icon: MapPin },
];

export function CreateLeadModal({ isOpen, onClose }: CreateLeadModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [car, setCar] = useState("");
  const [source, setSource] = useState<LeadSource>("site");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Имя обязательно для заполнения");
      return;
    }

    setIsLoading(true);
    try {
      const now = Date.now();
      const leadData = {
        name,
        phone,
        car,
        source,
        status: "new",
        notes,
        nextActionDate: null,
        nextActionTime: null,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db!, "leads"), leadData);
      
      // Create first history entry
      await setDoc(doc(collection(db!, `leads/${docRef.id}/history`)), {
        status: "new",
        notes: "Лид создан",
        changedAt: now,
      });

      toast.success("Лид успешно создан");
      
      // Reset form
      setName("");
      setPhone("");
      setCar("");
      setSource("site");
      setNotes("");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Ошибка при создании лида");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Новый лид">
      <form onSubmit={handleSubmit} className="space-y-20">
        <div className="space-y-8">
          <label className="text-caption-bold text-textPrimary block">Имя *</label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Иван Иванов" 
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-16">
          <div className="space-y-8">
            <label className="text-caption-bold text-textPrimary block">Телефон</label>
            <Input 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="+375 (29) 123-45-67" 
              disabled={isLoading}
            />
          </div>
          <div className="space-y-8">
            <label className="text-caption-bold text-textPrimary block">Автомобиль</label>
            <Input 
              value={car} 
              onChange={(e) => setCar(e.target.value)} 
              placeholder="Geely Monjaro" 
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-8">
          <label className="text-caption-bold text-textPrimary block">Источник</label>
          <div className="grid grid-cols-2 gap-8">
            {SOURCES.map((s) => {
              const Icon = s.icon;
              const isActive = source === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSource(s.id)}
                  disabled={isLoading}
                  className={`flex items-center space-x-8 p-12 rounded-md border transition-all ${
                    isActive 
                      ? "border-accent bg-accent/5 text-accent" 
                      : "border-border bg-surface hover:bg-hover text-textPrimary"
                  }`}
                >
                  <Icon className="w-16 h-16" strokeWidth={1.5} />
                  <span className="text-caption-bold">{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-8">
          <label className="text-caption-bold text-textPrimary block">Заметка</label>
          <Textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="Дополнительная информация..." 
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-12 pt-8">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button type="submit" className="flex-1" isLoading={isLoading}>
            Создать
          </Button>
        </div>
      </form>
    </Modal>
  );
}
