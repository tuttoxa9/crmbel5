import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Lead } from "@/types/lead";

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If Firebase is not configured (e.g., during build or missing envs), skip
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db!, "leads"), orderBy("createdAt", "desc"));
      
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const leadsData: Lead[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as DocumentData;
            leadsData.push({
              id: doc.id,
              name: data.name,
              phone: data.phone,
              car: data.car,
              source: data.source,
              status: data.status,
              notes: data.notes,
              nextActionDate: data.nextActionDate,
              nextActionTime: data.nextActionTime,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            });
          });
          setLeads(leadsData);
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching leads:", err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, []);

  return { leads, loading, error };
}
