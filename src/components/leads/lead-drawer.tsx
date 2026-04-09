"use client";

import { useEffect, useState } from "react";
import { doc, collection, query, orderBy, onSnapshot, updateDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Lead, LeadHistory as LeadHistoryType, SOURCE_NAMES } from "@/types/lead";
import { X, Edit2, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { StatusSelector } from "@/components/leads/status-selector";
import { EditLeadModal } from "@/components/leads/edit-lead-modal";
import { LeadHistory } from "@/components/leads/lead-history";

interface LeadDrawerProps {
  leadId: string | null;
  onClose: () => void;
}

export function LeadDrawer({ leadId, onClose }: LeadDrawerProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [history, setHistory] = useState<LeadHistoryType[]>([]);
  const [loading, setLoading] = useState(true);

  const [notes, setNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const [nextDate, setNextDate] = useState("");
  const [nextTime, setNextTime] = useState("");
  const [isSavingAction, setIsSavingAction] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!leadId) {
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

        if (data.nextActionDate) {
          setNextDate(format(data.nextActionDate, "yyyy-MM-dd"));
        } else {
          setNextDate("");
        }
        setNextTime(data.nextActionTime || "");

        setLoading(false);
      } else {
        onClose();
      }
    });

    const historyQ = query(collection(db!, `leads/${leadId}/history`), orderBy("changedAt", "desc"));
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
    if (!lead || notes === lead.notes || !leadId) return;
    setIsSavingNotes(true);
    try {
      const now = Date.now();
      await updateDoc(doc(db!, "leads", leadId), { notes, updatedAt: now });
      await addDoc(collection(db!, `leads/${leadId}/history`), {
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
    if (!lead || !leadId) return;
    setIsSavingAction(true);
    try {
      const now = Date.now();
      const dateObj = nextDate ? new Date(nextDate) : null;
      const timestamp = dateObj ? dateObj.getTime() : null;

      await updateDoc(doc(db!, "leads", leadId), {
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
    if (!lead || !leadId) return;
    setIsSavingAction(true);
    try {
      await updateDoc(doc(db!, "leads", leadId), {
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

  return (
    <AnimatePresence>
      {leadId && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[100vw] sm:w-[500px] lg:w-[600px] bg-background border-l border-border z-50 flex flex-col shadow-2xl"
          >
            {loading || !lead ? (
              <div className="flex-1 flex items-center justify-center">
                <span className="w-32 h-32 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-16 md:p-24 border-b border-border shrink-0 bg-surface">
                  <h2 className="text-[20px] font-bold text-textPrimary truncate">{lead.name}</h2>
                  <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                    <X className="w-20 h-20" />
                  </Button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-16 md:p-24 space-y-24 custom-scrollbar bg-background">

                  {/* Info Section */}
                  <div className="bg-surface p-20 rounded-[12px] border border-border relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-16 right-16 text-textMuted hover:text-accent"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit2 strokeWidth={1.5} className="w-18 h-18" />
            </Button>

            <h3 className="text-caption-bold text-textMuted uppercase tracking-wider mb-16">
              Информация о клиенте
            </h3>

            <div className="space-y-12">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-8 border-b border-border">
                <span className="text-textMuted">Телефон</span>
                {lead.phone ? (
                  <div className="flex items-center gap-12 mt-4 sm:mt-0">
                    <span className="text-textPrimary font-medium">{lead.phone}</span>
                    <div className="flex items-center gap-4">
                      <a href={`tel:${lead.phone}`} className="p-6 bg-surfaceSecondary rounded-md hover:bg-hover hover:text-accent transition-colors">
                        <Phone className="w-16 h-16" strokeWidth={1.5} />
                      </a>
                      {/* WhatsApp / Telegram links could be here */}
                    </div>
                  </div>
                ) : (
                  <span className="text-textMuted mt-4 sm:mt-0">-</span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-8 border-b border-border">
                <span className="text-textMuted">Автомобиль</span>
                <span className="text-textPrimary font-medium mt-4 sm:mt-0">{lead.car || "-"}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-8 border-b border-border">
                <span className="text-textMuted">Источник</span>
                <span className="text-textPrimary font-medium mt-4 sm:mt-0">{SOURCE_NAMES[lead.source]}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-8">
                <span className="text-textMuted">Создан</span>
                <span className="text-textPrimary mt-4 sm:mt-0">
                  {format(lead.createdAt, "d MMM yyyy, HH:mm", { locale: ru })}
                </span>
              </div>
            </div>
          </div>

                  <StatusSelector leadId={leadId} currentStatus={lead.status} />

                  {/* Notes Card */}
                  <div className="card-base p-20 rounded-[12px]">
                    <h3 className="text-caption-bold text-textMuted uppercase tracking-wider mb-16">
                      Заметка
                    </h3>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mb-12 min-h-[120px]"
                    />
                    <Button
                      onClick={saveNotes}
                      isLoading={isSavingNotes}
                      disabled={notes === (lead.notes || "")}
                    >
                      Сохранить заметку
                    </Button>
                  </div>

          {/* Next Action Card */}
          <div className="card-base p-20 rounded-[12px]">
            <h3 className="text-caption-bold text-textMuted uppercase tracking-wider mb-16">
              Следующее действие
            </h3>
            <div className="flex flex-col sm:flex-row gap-16 items-start sm:items-center">
              <div className="flex-1 w-full relative">
                <Calendar className="absolute left-12 top-1/2 -translate-y-1/2 w-16 h-16 text-textMuted" strokeWidth={1.5} />
                <Input
                  type="date"
                  className="pl-40"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-[120px]">
                <Input
                  type="time"
                  value={nextTime}
                  onChange={(e) => setNextTime(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-12 mt-16">
              <Button onClick={saveNextAction} isLoading={isSavingAction}>
                Сохранить
              </Button>
              {(lead.nextActionDate || lead.nextActionTime) && (
                <Button variant="secondary" onClick={clearNextAction} disabled={isSavingAction}>
                  Очистить
                </Button>
              )}
            </div>
          </div>

                  <div className="h-[400px]">
                    <LeadHistory history={history} />
                  </div>

                </div>

                <EditLeadModal
                  isOpen={isEditModalOpen}
                  onClose={() => setIsEditModalOpen(false)}
                  lead={lead}
                />
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
