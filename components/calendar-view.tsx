"use client";

import { useEffect, useState } from "react";
import type { CalendarEvent } from "@/types/calendar";
import CalendarEventDetail from "./calendar-event-detail";
import CalendarEventForm from "./calendar-event-form";
import { db, auth } from "@/firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, orderBy, getDocs } from "firebase/firestore";

let FullCalendarComponent: any = null;
let dayGridPlugin: any = null;
let timeGridPlugin: any = null;
let interactionPlugin: any = null;

interface CalendarViewProps { view: "month" | "week" | "day" }

export default function CalendarView({ view }: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentView, setCurrentView] = useState(view);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (typeof window !== "undefined" && !FullCalendarComponent) {
        const FullCalendar = (await import("@fullcalendar/react")).default;
        FullCalendarComponent = FullCalendar;
        dayGridPlugin = (await import("@fullcalendar/daygrid")).default;
        timeGridPlugin = (await import("@fullcalendar/timegrid")).default;
        interactionPlugin = (await import("@fullcalendar/interaction")).default;
      }
    })();
  }, []);

  // get orgId via profiles
  useEffect(() => {
    (async () => {
      const u = auth.currentUser;
      if (!u) return;
      const profs = await getDocs(query(collection(db, "profiles")));
      const mine = profs.docs.find(d => d.id === u.uid)?.data() as any;
      setOrgId(mine?.orgId || null);
    })();
  }, []);

  // Load events from Firestore (org-scoped)
  useEffect(() => {
    if (!orgId) return;
    const qEvents = query(collection(db, "events"), where("orgId", "==", orgId), orderBy("start", "asc"));
    const unsub = onSnapshot(qEvents, (snap) => {
      const rows: any[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setEvents(rows);
    });
    return () => unsub();
  }, [orgId]);

  const handleEventClick = (info: any) => {
    const event = events.find(e => e.id === info.event.id);
    if (event) setSelectedEvent(event);
  };

  const handleDateClick = (info: any) => {
    setSelectedEvent(null);
    setIsFormOpen(true);
  };

  const handleEventDrop = async (info: any) => {
    const eventId = info.event.id;
    const updated = { start: info.event.start, end: info.event.end || null };
    await updateDoc(doc(db, "events", eventId), updated as any);
  };

  const handleEventCreated = async (e: CalendarEvent) => {
    const u = auth.currentUser;
    if (!u || !orgId) return;
    await addDoc(collection(db, "events"), {
      ...e,
      orgId,
      createdBy: u.uid,
      createdAt: serverTimestamp(),
    } as any);
    setIsFormOpen(false);
  };

  if (!FullCalendarComponent) return <div className="p-4 text-sm text-muted-foreground">Loading calendar…</div>;

  return (
    <div className="flex h-full">
      <div className="flex-1 p-2">
        <FullCalendarComponent
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={currentView === "week" ? "timeGridWeek" : currentView === "day" ? "timeGridDay" : "dayGridMonth"}
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          editable
          eventDrop={handleEventDrop}
          height="auto"
        />
      </div>
      <div className="w-80 border-l bg-white p-3">
        {selectedEvent ? (
          <CalendarEventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        ) : (
          <CalendarEventForm onEventCreated={handleEventCreated} />
        )}
      </div>
    </div>
  );
}
