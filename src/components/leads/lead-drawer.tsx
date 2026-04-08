"use client";

import { useEffect, useState } from "react";
import { doc, collection, query, onSnapshot, updateDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Lead, LeadHistory as LeadHistoryType, LeadStatus, STATUS_NAMES, SOURCE_NAMES } from "@/types/lead";
import { X, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { LeadHistory } from "@/components/leads/lead-history";

interface LeadDrawerProps {
  leadId: string | null;
  onClose: () => void;
}

const ALL_STATUSES: LeadStatus[] = [
  "new", "in-work", "visit", "thinking", "callback",
  "success", "no-answer", "decline", "bank-decline", "defect"
];

export function LeadDrawer({ leadId, onClose }: LeadDrawerProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [history, setHistory] = useState<LeadHistoryType[]>([]);
  const [loading, setLoading] = useState(true);

  const [notes, setNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const [nextDate, setNextDate] = useState("");
  const [nextTime, setNextTime] = useState("");
  const [isSavingAction, setIsSavingAction] = useState(false);
  const [isStatusChanging, setIsStatusChanging] = useState(false);

  // For Edit Inline
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCar, setEditCar] = useState("");

  useEffect(() => {
    if (!leadId || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      setLead(null);
      return;
    }

    setLoading(true);

    const leadUnsub = onSnapshot(doc(db!, "leads", leadId), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as Lead;
        data.id = doc.id;
        setLead(data);
        setNotes(data.notes || "");
        setEditName(data.name);
        setEditPhone(data.phone || "");
        setEditCar(data.car || "");

        if (data.nextActionDate) {
          setNextDate(format(data.nextActionDate, "yyyy-MM-dd"));
        } else {
          setNextDate("");
        }
        setNextTime(data.nextActionTime || "");

        setLoading(false);
      } else {
        onClose(); // lead deleted or not found
      }
    });

    const historyQ = query(collection(db!, `leads/${leadId}/history`));
    const historyUnsub = onSnapshot(historyQ, (snapshot) => {
      const h: LeadHistoryType[] = [];
      snapshot.forEach((doc) => {
        h.push({ id: doc.id, ...doc.data() } as LeadHistoryType);
      });
      setHistory(h);
    });

    return () => {
      leadUnsub();
      historyUnsub();
    };
  }, [leadId, onClose]);

  const saveNotes = async () => {
    if (!lead || notes === lead.notes) return;
    setIsSavingNotes(true);
    try {
      const now = Date.now();
      await updateDoc(doc(db!, "leads", lead.id), { notes, updatedAt: now });
      await addDoc(collection(db!, `leads/${lead.id}/history`), {
        status: lead.status,
        notes: "Заметка обновлена: " + notes,
        changedAt: now,
      });
      toast.success("Заметка сохранена");
    } catch {
      toast.error("Ошибка при сохранении заметки");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const saveNextAction = async () => {
    if (!lead) return;
    setIsSavingAction(true);
    try {
      const now = Date.now();
      const dateObj = nextDate ? new Date(nextDate) : null;
      const timestamp = dateObj ? dateObj.getTime() : null;

      await updateDoc(doc(db!, "leads", lead.id), {
        nextActionDate: timestamp,
        nextActionTime: nextTime || null,
        updatedAt: now,
      });
      toast.success("Следующее действие сохранено");
    } catch {
      toast.error("Ошибка при сохранении действия");
    } finally {
      setIsSavingAction(false);
    }
  };

  const clearNextAction = async () => {
    if (!lead) return;
    setIsSavingAction(true);
    try {
      await updateDoc(doc(db!, "leads", lead.id), {
        nextActionDate: null,
        nextActionTime: null,
        updatedAt: Date.now(),
      });
      setNextDate("");
      setNextTime("");
      toast.success("Следующее действие очищено");
    } catch {
      toast.error("Ошибка при очистке");
    } finally {
      setIsSavingAction(false);
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead || newStatus === lead.status) return;
    setIsStatusChanging(true);
    try {
      const now = Date.now();
      await updateDoc(doc(db!, "leads", lead.id), {
        status: newStatus,
        updatedAt: now,
      });
      await addDoc(collection(db!, `leads/${lead.id}/history`), {
        status: newStatus,
        notes: "Статус изменен",
        changedAt: now,
      });
      toast.success("Статус обновлен");
    } catch (error) {
      console.error(error);
      toast.error("Ошибка при обновлении статуса");
    } finally {
      setIsStatusChanging(false);
    }
  };

  const saveEdit = async () => {
    if (!lead) return;
    if (!editName.trim()) {
      toast.error("Имя обязательно");
      return;
    }
    try {
      await updateDoc(doc(db!, "leads", lead.id), {
        name: editName,
        phone: editPhone,
        car: editCar,
        updatedAt: Date.now(),
      });
      toast.success("Данные сохранены");
      setIsEditing(false);
    } catch {
      toast.error("Ошибка сохранения");
    }
  };

  return (
    <AnimatePresence>
      {leadId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[480px] lg:w-[800px] bg-background border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {loading || !lead ? (
              <div className="flex-1 flex items-center justify-center">
                <span className="w-24 h-24 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-20 py-16 border-b border-border bg-surface shrink-0">
                  <div className="flex items-center gap-12">
                    <button onClick={onClose} className="p-6 text-textMuted hover:bg-hover rounded-full transition-colors">
                      <X className="w-18 h-18" />
                    </button>
                    {isEditing ? (
                      <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-[32px] text-[16px] font-bold" />
                    ) : (
                      <h2 className="text-[18px] font-bold text-textPrimary leading-none">{lead.name}</h2>
                    )}
                  </div>

                  <div className="flex items-center gap-8">
                    {isEditing ? (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>Отмена</Button>
                        <Button size="sm" onClick={saveEdit}>Сохранить</Button>
                      </>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>Редактировать</Button>
                    )}
                  </div>
                </div>

                {/* Content - Two Column Layout on Desktop */}
                <div className="flex-1 overflow-y-auto bg-background p-20 lg:p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] lg:h-full">

                    {/* Left Column - Main Info */}
                    <div className="space-y-16 lg:p-20 lg:border-r border-border lg:overflow-y-auto">

                      {/* Status Dropdown */}
                      <div className="card-base p-12 rounded-[10px]">
                        <label className="text-[11px] font-bold text-textMuted uppercase tracking-wider block mb-8">Статус</label>
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                          disabled={isStatusChanging}
                          className="w-full h-[36px] bg-surfaceSecondary border border-border rounded-md px-12 text-[13px] text-textPrimary focus:outline-none focus:border-accent"
                        >
                          {ALL_STATUSES.map(status => (
                            <option key={status} value={status}>{STATUS_NAMES[status]}</option>
                          ))}
                        </select>
                      </div>

                      {/* Info Compact */}
                      <div className="card-base p-16 rounded-[10px] space-y-12">
                        <div className="grid grid-cols-2 gap-12">
                          <div>
                            <label className="text-[11px] font-bold text-textMuted uppercase tracking-wider block mb-4">Телефон</label>
                            {isEditing ? (
                              <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} className="h-[32px]" />
                            ) : lead.phone ? (
                              <div className="flex items-center gap-8">
                                <span className="text-[14px] text-textPrimary font-medium">{lead.phone}</span>
                                <a href={`tel:${lead.phone}`} className="p-4 bg-accent/10 text-accent rounded-md hover:bg-accent/20 transition-colors">
                                  <Phone className="w-12 h-12" strokeWidth={2} />
                                </a>
                              </div>
                            ) : (
                              <span className="text-[14px] text-textMuted">-</span>
                            )}
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-textMuted uppercase tracking-wider block mb-4">Автомобиль</label>
                            {isEditing ? (
                              <Input value={editCar} onChange={e => setEditCar(e.target.value)} className="h-[32px]" />
                            ) : (
                              <span className="text-[14px] text-textPrimary">{lead.car || "-"}</span>
                            )}
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-textMuted uppercase tracking-wider block mb-4">Источник</label>
                            <span className="text-[14px] text-textPrimary">{SOURCE_NAMES[lead.source]}</span>
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-textMuted uppercase tracking-wider block mb-4">Создан</label>
                            <span className="text-[14px] text-textMuted">{format(lead.createdAt, "d MMM yyyy", { locale: ru })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Next Action */}
                      <div className="card-base p-16 rounded-[10px]">
                        <label className="text-[11px] font-bold text-textMuted uppercase tracking-wider block mb-8">Следующее действие</label>
                        <div className="flex items-center gap-8">
                          <div className="flex-1 relative">
                            <Calendar className="absolute left-10 top-1/2 -translate-y-1/2 w-14 h-14 text-textMuted" strokeWidth={1.5} />
                            <input
                              type="date"
                              className="w-full h-[36px] bg-surfaceSecondary border border-border rounded-md pl-32 pr-12 text-[13px] text-textPrimary focus:outline-none focus:border-accent"
                              value={nextDate}
                              onChange={(e) => setNextDate(e.target.value)}
                            />
                          </div>
                          <div className="w-[100px]">
                            <input
                              type="time"
                              className="w-full h-[36px] bg-surfaceSecondary border border-border rounded-md px-12 text-[13px] text-textPrimary focus:outline-none focus:border-accent"
                              value={nextTime}
                              onChange={(e) => setNextTime(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex gap-8 mt-12">
                          <Button size="sm" onClick={saveNextAction} isLoading={isSavingAction} className="h-[32px] text-[12px]">
                            Установить
                          </Button>
                          {(lead.nextActionDate || lead.nextActionTime) && (
                            <Button size="sm" variant="secondary" onClick={clearNextAction} disabled={isSavingAction} className="h-[32px] text-[12px]">
                              Сброс
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="card-base p-16 rounded-[10px]">
                        <label className="text-[11px] font-bold text-textMuted uppercase tracking-wider block mb-8">Заметка</label>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="min-h-[100px] text-[13px] mb-8"
                        />
                        <Button
                          size="sm"
                          onClick={saveNotes}
                          isLoading={isSavingNotes}
                          disabled={notes === (lead.notes || "")}
                          className="h-[32px] text-[12px]"
                        >
                          Сохранить
                        </Button>
                      </div>

                    </div>

                    {/* Right Column - History (Desktop Only, or below on Mobile) */}
                    <div className="mt-16 lg:mt-0 lg:h-full lg:overflow-y-auto lg:bg-surfaceSecondary p-16 rounded-[10px] lg:rounded-none">
                       <LeadHistory history={history} />
                    </div>

                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
