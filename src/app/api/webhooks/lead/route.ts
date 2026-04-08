import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { LeadSource } from "@/types/lead";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verify secret
    if (body.secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Construct lead data
    const now = Date.now();
    const source = (body.source || "site") as LeadSource;
    
    const leadData = {
      name: body.name,
      phone: body.phone || null,
      car: body.car || null,
      source: source,
      status: "new",
      notes: body.notes || "Получено через Zapier",
      nextActionDate: null,
      nextActionTime: null,
      createdAt: now,
      updatedAt: now,
    };

    // Add to Firestore using Admin SDK
    const docRef = await adminDb!.collection("leads").add(leadData);

    // Add initial history record
    await adminDb!.collection(`leads/${docRef.id}/history`).add({
      status: "new",
      notes: "Лид создан через вебхук",
      changedAt: now,
    });

    return NextResponse.json({ success: true, id: docRef.id });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
