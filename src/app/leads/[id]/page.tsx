"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, collection, query, onSnapshot, updateDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Lead, LeadHistory as LeadHistoryType, SOURCE_NAMES } from "@/types/lead";
import { ArrowLeft, Edit2,  Phone, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { StatusSelector } from "@/components/leads/status-selector";
import { LeadHistory } from "@/components/leads/lead-history";
import { EditLeadModal } from "@/components/leads/edit-lead-modal";

export default function LeadPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

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
    if (!id || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) return;

    const leadUnsub = onSnapshot(doc(db!, "leads", id), (doc) => {
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
        router.push("/leads");
      }
    });

    const historyQ = query(collection(db!, `leads/${id}/history`));
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
  }, [id, router]);

  const saveNotes = async () => {
    if (!lead || notes === lead.notes) return;
    setIsSavingNotes(true);
    try {
      const now = Date.now();
      await updateDoc(doc(db!, "leads", id), { notes, updatedAt: now });
      await addDoc(collection(db!, `leads/${id}/history`), {
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

      await updateDoc(doc(db!, "leads", id), {
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
      await updateDoc(doc(db!, "leads", id), {
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

  if (loading || !lead) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="w-32 h-32 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-24">
      {/* Header */}
      <div className="flex items-center gap-16 shrink-0">
        <button 
          onClick={() => router.push("/leads")}
          className="p-8 -ml-8 text-textMuted hover:text-textPrimary hover:bg-hover rounded-md transition-colors"
        >
          <ArrowLeft strokeWidth={1.5} className="w-24 h-24" />
        </button>
        <h1 className="text-page-title text-textPrimary">{lead.name}</h1>
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-24 min-h-0">
        {/* Left Column */}
        <div className="space-y-16 overflow-y-auto pr-8 pb-32">
          
          {/* Info Card */}
          <div className="card-base p-16 rounded-[10px] relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-12 right-12 text-textMuted hover:text-accent h-[32px] w-[32px]"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit2 strokeWidth={1.5} className="w-14 h-14" />
            </Button>
            
            <h3 className="text-[11px] font-bold text-textMuted uppercase tracking-wider mb-12">
              Информация о клиенте
            </h3>
            
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-border">
                <span className="text-[13px] text-textMuted">Телефон</span>
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
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-border">
                <span className="text-[13px] text-textMuted">Автомобиль</span>
                <span className="text-[13px] text-textPrimary font-medium mt-4 sm:mt-0">{lead.car || "-"}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-border">
                <span className="text-[13px] text-textMuted">Источник</span>
                <span className="text-[13px] text-textPrimary font-medium mt-4 sm:mt-0">{SOURCE_NAMES[lead.source]}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6">
                <span className="text-[13px] text-textMuted">Создан</span>
                <span className="text-[13px] text-textPrimary mt-4 sm:mt-0">
                  {format(lead.createdAt, "d MMM yyyy, HH:mm", { locale: ru })}
                </span>
              </div>
            </div>
          </div>

          <StatusSelector leadId={id} currentStatus={lead.status} />

          {/* Notes Card */}
          <div className="card-base p-16 rounded-[10px]">
            <h3 className="text-[11px] font-bold text-textMuted uppercase tracking-wider mb-12">
              Заметка
            </h3>
            <Textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mb-12 min-h-[80px]"
            />
            <Button 
              size="sm"
              onClick={saveNotes} 
              isLoading={isSavingNotes}
              disabled={notes === (lead.notes || "")}
            >
              Сохранить
            </Button>
          </div>

          {/* Next Action Card */}
          <div className="card-base p-16 rounded-[10px]">
            <h3 className="text-[11px] font-bold text-textMuted uppercase tracking-wider mb-12">
              Следующее действие
            </h3>
            <div className="flex flex-col sm:flex-row gap-12 items-start sm:items-center">
              <div className="flex-1 w-full relative">
                <Calendar className="absolute left-10 top-1/2 -translate-y-1/2 w-14 h-14 text-textMuted" strokeWidth={1.5} />
                <Input 
                  type="date" 
                  className="pl-32 h-[36px]"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-[120px]">
                <Input 
                  type="time" 
                  className="h-[36px]"
                  value={nextTime}
                  onChange={(e) => setNextTime(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-12 mt-12">
              <Button size="sm" onClick={saveNextAction} isLoading={isSavingAction}>
                Установить
              </Button>
              {(lead.nextActionDate || lead.nextActionTime) && (
                <Button size="sm" variant="secondary" onClick={clearNextAction} disabled={isSavingAction}>
                  Сброс
                </Button>
              )}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="hidden lg:block h-full min-h-0">
          <LeadHistory history={history} />
        </div>
        
        <div className="lg:hidden h-[400px]">
          <LeadHistory history={history} />
        </div>

      </div>

      <EditLeadModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        lead={lead} 
      />
    </div>
  );
}
