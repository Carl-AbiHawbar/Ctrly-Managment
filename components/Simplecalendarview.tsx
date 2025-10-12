"use client";

import { useEffect, useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CalendarEvent } from "@/types/calendar";
import { useToast } from "@/components/ui/use-toast";

// Firebase
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  Timestamp,
} from "firebase/firestore";

/**
 * Props unchanged: the parent can set view + optional filters
 */
interface SimpleCalendarViewProps {
  view: "month" | "week" | "day";
  filterProject: string | null;
  filterAssignee: string | null;
}

type Me = { uid: string; role: "owner" | string; orgId: string | null };

export default function SimpleCalendarView({
  view,
  filterProject,
  filterAssignee,
}: SimpleCalendarViewProps) {
  const { toast } = useToast();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [me, setMe] = useState<Me | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // new/edit form modal state (native, simple)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formEditingId, setFormEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CalendarEvent & { dateOnly?: boolean }>>({
    title: "",
    description: "",
    location: "",
    project: "",
    projectName: "",
    assignees: [],
    color: "#4f46e5",
    allDay: false,
    start: new Date(),
    end: new Date(),
    dateOnly: false,
  });

  // ───────────────────────────────────────────
  // Auth -> user doc -> stream events
  // ───────────────────────────────────────────
  useEffect(() => {
    let unsubAuth: (() => void) | undefined;
    let unsubMe: (() => void) | undefined;
    let unsubEvents: (() => void) | undefined;

    unsubAuth = onAuthStateChanged(auth, async (u) => {
      setMe(null);
      setEvents([]);
      unsubMe?.();
      unsubEvents?.();

      if (!u) {
        toast({
          title: "Not signed in",
          description: "Please sign in to view the calendar.",
          variant: "destructive",
        });
        return;
      }

      // stream my user doc
      const meRef = doc(db, "users", u.uid);
      unsubMe = onSnapshot(
        meRef,
        (snap) => {
          const d = snap.data() as any;
          const role = (d?.role as string) || "client";
          const orgId = (d?.orgId as string) || null;
          const meVal: Me = { uid: u.uid, role: role as any, orgId };
          setMe(meVal);

          unsubEvents?.();
          setEvents([]);

          if (!orgId) return;

          // (A) try: orgId + start (month window) + orderBy(start desc)
          const monthStart = startOfMonth(currentDate);
          const nextMonthStart = addMonths(monthStart, 1);

          let qy = query(
            collection(db, "events"),
            where("orgId", "==", orgId),
            where("start", ">=", Timestamp.fromDate(monthStart)),
            where("start", "<", Timestamp.fromDate(nextMonthStart)),
            orderBy("start", "desc")
          );

          const startStream = (fallback = false) => {
            if (fallback) {
              // (B) fallback: orgId only (no orderBy / date range)
              qy = query(collection(db, "events"), where("orgId", "==", orgId));
            }

            unsubEvents = onSnapshot(
              qy,
              (snap) => {
                const rows = snap.docs.map((d) => {
                  const x = d.data() as any;
                  const ev: CalendarEvent = {
                    id: d.id,
                    title: x.title || "Untitled",
                    description: x.description || "",
                    location: x.location || "",
                    project: x.project || "",
                    projectName: x.projectName || "",
                    assignees: Array.isArray(x.assignees) ? x.assignees : [],
                    color: x.color || "#4f46e5",
                    allDay: !!x.allDay,
                    start: (x.start?.toDate?.() as Date) || new Date(),
                    end: (x.end?.toDate?.() as Date) || new Date(),
                  };
                  return ev;
                });

                // If we fell back to "no range", still show only month in the grid.
                if (fallback) {
                  const ms = startOfMonth(currentDate).getTime();
                  const me = endOfMonth(currentDate).getTime();
                  setEvents(
                    rows.filter((ev) => {
                      const t = new Date(ev.start).getTime();
                      return t >= ms && t <= me;
                    })
                  );
                } else {
                  setEvents(rows);
                }
              },
              (err: any) => {
                // Missing index? fallback without orderBy/date range.
                if (err?.code === "failed-precondition" && String(err.message || "").includes("create it here")) {
                  console.warn("Missing index for events(orgId + start). Retrying without orderBy/range.");
                  startStream(true);
                  return;
                }
                console.error(err);
                toast({ title: "Failed to load events", description: err?.message || "Unknown error", variant: "destructive" });
              }
            );
          };

          startStream(false);
        },
        (err) => {
          console.error(err);
          toast({ title: "Failed to load your profile", description: err?.message || "Unknown error", variant: "destructive" });
        }
      );
    });

    return () => {
      unsubEvents?.();
      unsubMe?.();
      unsubAuth?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const isOwner = me?.role === "owner";

  // ───────────────────────────────────────────
  // Filters (client side)
  // ───────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    let filtered = [...events];
    if (filterProject) filtered = filtered.filter((e) => (e.project || "") === filterProject);
    if (filterAssignee) filtered = filtered.filter((e) => e.assignees?.some((a) => a.id === filterAssignee));
    return filtered;
  }, [events, filterProject, filterAssignee]);

  // ───────────────────────────────────────────
  // Calendar basics
  // ───────────────────────────────────────────
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (
        (isSameDay(day, eventStart) || day > eventStart) &&
        (isSameDay(day, eventEnd) || day < eventEnd)
      );
    });
  };

  // ───────────────────────────────────────────
  // CRUD helpers (owner only for write)
  // ───────────────────────────────────────────
  function openNewEvent(date: Date) {
    if (!isOwner) {
      toast({ title: "Only the owner can add events", variant: "destructive" });
      return;
    }
    setFormEditingId(null);
    setFormData({
      title: "",
      description: "",
      location: "",
      project: "",
      projectName: "",
      assignees: [],
      color: "#4f46e5",
      allDay: true,
      start: date,
      end: date,
      dateOnly: true,
    });
    setIsFormOpen(true);
  }

  function openEditEvent(ev: CalendarEvent) {
    if (!isOwner) {
      // Owner-only for editing
      setSelectedEvent(ev); // show details, but no edit
      return;
    }
    setFormEditingId(ev.id);
    setFormData({
      ...ev,
      dateOnly: isSameDay(new Date(ev.start), new Date(ev.end)) && ev.allDay,
    });
    setIsFormOpen(true);
  }

  async function saveForm() {
    if (!me?.orgId) return;
    try {
      const payload = {
        orgId: me.orgId,
        title: (formData.title || "").trim() || "Untitled",
        description: (formData.description || "").trim(),
        location: (formData.location || "").trim(),
        project: (formData.project || "").trim(),
        projectName: (formData.projectName || "").trim(),
        assignees: Array.isArray(formData.assignees) ? formData.assignees : [],
        color: formData.color || "#4f46e5",
        allDay: !!formData.dateOnly || !!formData.allDay,
        start: Timestamp.fromDate(new Date(formData.start || new Date())),
        end: Timestamp.fromDate(
          new Date(
            formData.dateOnly
              ? formData.start || new Date()
              : formData.end || formData.start || new Date()
          )
        ),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (formEditingId) {
        await updateDoc(doc(db, "events", formEditingId), payload);
        toast({ title: "Event updated" });
      } else {
        await addDoc(collection(db, "events"), payload);
        toast({ title: "Event created" });
      }

      setIsFormOpen(false);
      setFormEditingId(null);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Failed to save event", description: e?.message || "Unknown error", variant: "destructive" });
    }
  }

  async function deleteEvent(ev: CalendarEvent) {
    if (!isOwner) return;
    try {
      await deleteDoc(doc(db, "events", ev.id));
      toast({ title: "Event deleted" });
      setSelectedEvent(null);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Failed to delete event", description: e?.message || "Unknown error", variant: "destructive" });
    }
  }

  // ───────────────────────────────────────────
  // Renders
  // ───────────────────────────────────────────
  const renderMonthView = () => {
    const days = getDaysInMonth();
    const firstDayOfMonth = startOfMonth(currentDate).getDay();

    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-medium text-gray-500 text-sm py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="sm:h-16 lg:h-24 p-1 border border-gray-100 rounded-md bg-gray-50" />
          ))}

          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const inMonth = isSameMonth(day, currentDate);
            return (
              <div
                key={day.toISOString()}
                className={`sm:h-16 lg:h-24 p-1 border rounded-md overflow-hidden ${
                  inMonth ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50"
                }`}
                onClick={() => openNewEvent(day)}
              >
                <div className="text-right mb-1">
                  <span className={`text-sm font-medium ${inMonth ? "text-gray-900" : "text-gray-400"}`}>
                    {format(day, "d")}
                  </span>
                </div>
                <div className="space-y-1 overflow-y-auto max-h-16">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      className="text-xs px-1 py-0.5 rounded truncate cursor-pointer"
                      style={{ backgroundColor: `${ev.color}20`, color: ev.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // owners go straight to edit; others see details
                        isOwner ? openEditEvent(ev) : setSelectedEvent(ev);
                      }}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 px-1">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <div className="text-center py-8">
        <p className="text-gray-500">Week view is coming soon.</p>
        <p className="text-gray-500 text-sm mt-2">Please use the month view for now.</p>
      </div>
    </div>
  );

  const renderDayView = () => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <div className="text-center py-8">
        <p className="text-gray-500">Day view is coming soon.</p>
        <p className="text-gray-500 text-sm mt-2">Please use the month view for now.</p>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-lg font-medium">{format(currentDate, "MMMM yyyy")}</h2>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            {filteredEvents.length} events
          </Badge>
          {isOwner && (
            <Button variant="outline" onClick={() => openNewEvent(new Date())}>
              New event
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {view === "month" && renderMonthView()}
      {view === "week" && renderWeekView()}
      {view === "day" && renderDayView()}

      {/* Event detail (read-only for non-owners) */}
      {selectedEvent && !isOwner && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-md max-w-md w-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
              <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: selectedEvent.color }} />
            </div>
            {selectedEvent.description ? <p className="text-sm text-muted-foreground mt-2">{selectedEvent.description}</p> : null}
            <div className="text-sm mt-3">
              <div>
                <span className="text-muted-foreground">When:</span>{" "}
                {selectedEvent.allDay
                  ? format(selectedEvent.start, "PP")
                  : `${format(selectedEvent.start, "PPp")} → ${format(selectedEvent.end, "PPp")}`}
              </div>
              {selectedEvent.location ? (
                <div>
                  <span className="text-muted-foreground">Where:</span> {selectedEvent.location}
                </div>
              ) : null}
              {selectedEvent.projectName ? (
                <div>
                  <span className="text-muted-foreground">Project:</span> {selectedEvent.projectName}
                </div>
              ) : null}
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setSelectedEvent(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Owner form modal (create + edit) */}
      {isOwner && isFormOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setIsFormOpen(false)}>
          <div className="bg-white rounded-md max-w-md w-full p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">{formEditingId ? "Edit event" : "New event"}</h3>

            <div className="mt-3 space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Title</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={formData.title || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Event title"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  rows={3}
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={formData.description || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Optional"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Start</label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={toLocalInputValue(formData.start || new Date())}
                    onChange={(e) => setFormData((f) => ({ ...f, start: new Date(e.target.value) }))}
                    disabled={!!formData.dateOnly}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">End</label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={toLocalInputValue(formData.end || new Date())}
                    onChange={(e) => setFormData((f) => ({ ...f, end: new Date(e.target.value) }))}
                    disabled={!!formData.dateOnly}
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!formData.dateOnly}
                  onChange={(e) => setFormData((f) => ({ ...f, dateOnly: e.target.checked }))}
                />
                All day (use start date only)
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Project (id/slug)</label>
                  <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={formData.project || ""}
                    onChange={(e) => setFormData((f) => ({ ...f, project: e.target.value }))}
                    placeholder="e.g., figma"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Project name</label>
                  <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={formData.projectName || ""}
                    onChange={(e) => setFormData((f) => ({ ...f, projectName: e.target.value }))}
                    placeholder="e.g., Figma Design System"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Location</label>
                  <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={formData.location || ""}
                    onChange={(e) => setFormData((f) => ({ ...f, location: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Color</label>
                  <input
                    type="color"
                    className="w-full border rounded px-3 py-2 h-10"
                    value={formData.color || "#4f46e5"}
                    onChange={(e) => setFormData((f) => ({ ...f, color: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              {formEditingId && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (!selectedEvent || selectedEvent.id !== formEditingId) {
                      // create a lightweight object to pass into delete
                      deleteEvent({
                        id: formEditingId,
                        title: formData.title || "Untitled",
                        start: formData.start || new Date(),
                        end: formData.end || formData.start || new Date(),
                        allDay: !!formData.dateOnly,
                        project: formData.project || "",
                        projectName: formData.projectName || "",
                        location: formData.location || "",
                        description: formData.description || "",
                        assignees: formData.assignees as any,
                        color: formData.color || "#4f46e5",
                      } as CalendarEvent);
                    } else {
                      deleteEvent(selectedEvent);
                    }
                    setIsFormOpen(false);
                    setFormEditingId(null);
                  }}
                >
                  Delete
                </Button>
              )}
              <Button variant="secondary" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveForm}>{formEditingId ? "Save" : "Create"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// helpers
function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
