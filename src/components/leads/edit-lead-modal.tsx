"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lead } from "@/types/lead";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { toast } from "sonner";

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

export function EditLeadModal({ isOpen, onClose, lead }: EditLeadModalProps) {
  const [name, setName] = useState(lead.name);
  const [phone, setPhone] = useState(lead.phone || "");
  const [car, setCar] = useState(lead.car || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Имя обязательно для заполнения");
      return;
    }

    setIsLoading(true);
    try {
      await updateDoc(doc(db!, "leads", lead.id), {
        name,
        phone,
        car,
        updatedAt: Date.now(),
      });
      toast.success("Данные успешно сохранены");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Ошибка при сохранении");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Редактировать лида">
      <form onSubmit={handleSubmit} className="space-y-20">
        <div className="space-y-8">
          <label className="text-caption-bold text-textPrimary block">Имя *</label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            disabled={isLoading}
          />
        </div>
        <div className="space-y-8">
          <label className="text-caption-bold text-textPrimary block">Телефон</label>
          <Input 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            disabled={isLoading}
          />
        </div>
        <div className="space-y-8">
          <label className="text-caption-bold text-textPrimary block">Автомобиль</label>
          <Input 
            value={car} 
            onChange={(e) => setCar(e.target.value)} 
            disabled={isLoading}
          />
        </div>
        <div className="flex gap-12 pt-8">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button type="submit" className="flex-1" isLoading={isLoading}>
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
}
