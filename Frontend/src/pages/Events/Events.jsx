import { useContext, useEffect, useMemo, useState } from "react";
import EventContext from "../../context/events/eventsContext";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import esLocale from "@fullcalendar/core/locales/es";
import { ExternalLink, CalendarDays, Clock, MapPin, UserRound, Ticket, Link as LinkIcon, Tag } from "lucide-react";
import { DateTime } from "luxon";

const TZ = "America/Santiago";
const CLP = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });

const formatRange = (startISO, endISO) => {
  const s = DateTime.fromISO(startISO, { zone: TZ });
  const e = DateTime.fromISO(endISO, { zone: TZ });
  return s.hasSame(e, "day")
    ? `${s.toFormat("dd LLL yyyy, HH:mm")} – ${e.toFormat("HH:mm")} (${s.offsetNameShort})`
    : `${s.toFormat("dd LLL yyyy, HH:mm")} → ${e.toFormat("dd LLL yyyy, HH:mm")} (${s.offsetNameShort})`;
};

const statusBadge = (status) => {
  if (status === "published") return { className: "badge badge-success", label: "Publicado" };
  if (status === "cancelled") return { className: "badge badge-error gap-2", label: "Cancelado" };
  return { className: "badge badge-ghost", label: "Borrador" };
};

/** ===== Render de eventos (chip vs barra multidía) ===== */
function renderEventContent(arg) {
  const ev = arg.event.extendedProps.ev;
  const isMultiDay = arg.event.extendedProps?._multiDay || arg.event.allDay;

  // Colores por tipo
  let colorClasses = "";
  if (ev?.isOnline) colorClasses = "bg-gradient-to-r from-cyan-500 to-cyan-600";
  else if (ev?.requiresRegistration) colorClasses = "bg-gradient-to-r from-amber-500 to-amber-600";
  else colorClasses = "bg-gradient-to-r from-purple-500 to-purple-600";

  if (isMultiDay) {
    return (
      <div
        className={`${colorClasses} w-full text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
        title={arg.event.title}
      >
        <div className="truncate">{arg.event.title}</div>
      </div>
    );
  }

  const timeOnly = arg.timeText.split(" - ")[0] || arg.timeText;
  return (
    <div
      className={`${colorClasses} text-white px-2.5 py-1 rounded-xl text-xs font-semibold text-center shadow-md min-w-[45px] overflow-hidden whitespace-nowrap transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg`}
      title={arg.event.title}
    >
      <span className="block leading-tight tracking-wide">{timeOnly}</span>
    </div>
  );
}

/** ===== Hook simple para detectar vista móvil ===== */
const useIsMobile = (query = "(max-width: 640px)") => {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.matchMedia(query).matches : false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setIsMobile(e.matches);
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, [query]);
  return isMobile;
};

export function EventsCalendarPage() {
  const { Event = [], getAllEvents } = useContext(EventContext);

  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [selectedDateISO, setSelectedDateISO] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const isMobile = useIsMobile();

  useEffect(() => {
    getAllEvents();
  }, [getAllEvents]);

  // ===== Datos de prueba (comentar si la API ya responde) =====
  const testEvents = [
    {
      _id: "test1",
      title: "Eclipse Solar de Prueba",
      description: "Evento de prueba para verificar horarios",
      organizer: "Astromanía",
      location: "Santiago",
      startDateTime: "2025-01-15T14:30:00-03:00",
      endDateTime: "2025-01-16T16:30:00-03:00", // <- 2 días
      status: "published",
      isOnline: false,
      requiresRegistration: true,
      price: 5000,
      capacity: 50,
      tags: ["eclipse", "sol"],
    },
    {
      _id: "test2",
      title: "Observación Lunar",
      description: "Observación de la luna llena",
      organizer: "Astromanía",
      location: "Online",
      startDateTime: "2025-01-20T20:00:00-03:00",
      endDateTime: "2025-01-20T22:00:00-03:00",
      status: "published",
      isOnline: true,
      requiresRegistration: false,
      price: 0,
      url: "https://example.com/luna",
      tags: ["luna", "observación"],
    },
  ];

  const eventsToUse = Event && Event.length > 0 ? Event : testEvents;

  const isISO = (v) => {
    if (!v) return false;
    const dt = DateTime.fromISO(String(v), { zone: TZ });
    return dt.isValid;
  };

  /** ===== Mapeo a eventos de FullCalendar (multi-día -> allDay con fin exclusivo) ===== */
  const calendarEvents = useMemo(() => {
    return (eventsToUse || [])
      .filter((ev) => isISO(ev.startDateTime))
      .map((ev) => {
        const s = DateTime.fromISO(ev.startDateTime, { zone: TZ });
        const e = ev.endDateTime ? DateTime.fromISO(ev.endDateTime, { zone: TZ }) : null;
        const isMultiDay = !!(e && !s.hasSame(e, "day"));

        if (isMultiDay) {
          const startAllDay = s.startOf("day").toISODate();
          const endAllDay = e.plus({ days: 1 }).startOf("day").toISODate(); // exclusivo
          return {
            id: ev._id,
            title: ev.title,
            start: startAllDay,
            end: endAllDay,
            allDay: true,
            extendedProps: { ev, _multiDay: true },
          };
        }

        return {
          id: ev._id,
          title: ev.title,
          start: s.toISO(),
          end: e ? e.toISO() : null,
          allDay: false,
          extendedProps: { ev, _multiDay: false },
        };
      });
  }, [eventsToUse]);

  /** ===== Eventos del día seleccionado (panel lateral) ===== */
  const dayEvents = useMemo(() => {
    if (!selectedDateISO) return [];
    const d = DateTime.fromISO(selectedDateISO, { zone: TZ });
    return (eventsToUse || [])
      .filter((ev) => DateTime.fromISO(ev.startDateTime, { zone: TZ }).hasSame(d, "day"))
      .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
  }, [eventsToUse, selectedDateISO]);

  /** ===== Handlers ===== */
  const handleDateSelect = (selectInfo) => {
    setSelectedDateISO(selectInfo.startStr.slice(0, 10)); // YYYY-MM-DD
    setSelectedEvent(null);
  };
  const handleEventClick = (clickInfo) => {
    const full = clickInfo.event.extendedProps.ev;
    setSelectedDateISO(DateTime.fromISO(full.startDateTime).toISODate());
    setSelectedEvent(full);
  };

  /** ===== Toolbar e InitialView responsivos ===== */
  const headerToolbar = useMemo(
    () =>
      isMobile
        ? { left: "prev,next", center: "title", right: "today" }
        : { left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek" },
    [isMobile]
  );
  const initialView = isMobile ? "listWeek" : "dayGridMonth";

  return (
    <>
      <style>{`
        .fc-event { border: none !important; background: none !important; padding: 2px !important; }
        .fc-daygrid-event { margin: 1px 0 !important; }
        .fc-event-title { display: none !important; }

        .fc .fc-toolbar-title { font-size: ${isMobile ? "1rem" : "1.25rem"}; }
        .fc .fc-button { padding: ${isMobile ? "0.25rem 0.5rem" : "0.5rem 0.75rem"}; }
        .fc .fc-button { text-transform: none; }
        .fc .fc-daygrid-day-number { font-size: 0.9rem; }
        .fc .fc-timegrid-slot-label { font-size: 0.8rem; }

        .fc-daygrid-block-event .fc-event-main { width: 100%; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-20">
        {/* Calendario */}
        <section className="lg:col-span-2">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <h1 className="card-title text-2xl">Calendario de eventos Astronómicos</h1>
                <label className="label cursor-pointer gap-2">
                  <span className="label-text">Mostrar fin de semana</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={weekendsVisible}
                    onChange={() => setWeekendsVisible((v) => !v)}
                  />
                </label>
              </div>

              <div
                className="
                  [&_.fc-theme-standard]:[--fc-page-bg-color:transparent]
                  [&_.fc-theme-standard]:[--fc-list-bg-color:transparent]
                  [&_.fc-theme-standard]:[--fc-today-bg-color:rgba(187,0,255,0.39)]
                  [&_.fc-theme-standard]:[--fc-now-indicator-color:rgba(187,0,255,0.39)]
                "
              >
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                  locales={[esLocale]}
                  locale="es"
                  buttonText={{ today: "Hoy", month: "Mes", week: "Semana", day: "Día", list: "Lista" }}
                  headerToolbar={headerToolbar}
                  initialView={initialView}
                  height="auto"
                  contentHeight="auto"
                  expandRows
                  handleWindowResize
                  dayMaxEvents
                  weekends={weekendsVisible}
                  selectable
                  selectMirror
                  firstDay={1}
                  timeZone={TZ}
                  eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
                  displayEventTime
                  forceEventDuration
                  eventDisplay="block"
                  events={calendarEvents}
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  eventContent={renderEventContent}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Panel derecho */}
        <aside className="lg:col-span-1">
          <div className="card bg-base-200/70 shadow-xl sticky top-4 backdrop-blur supports-[backdrop-filter]:bg-base-200/60">
            <div className="card-body p-4 sm:p-5">
              {/* Header */}
              <div className="flex items-center justify-between gap-3">
                <h2 className="card-title text-base sm:text-lg">Detalle del día</h2>
                {selectedDateISO ? (
                  <div className="badge badge-outline gap-1">
                    <CalendarDays className="size-3" />
                    {DateTime.fromISO(selectedDateISO, { zone: TZ }).toFormat("dd LLL yyyy")}
                  </div>
                ) : (
                  <div className="badge badge-ghost">Selecciona un día</div>
                )}
              </div>

              {/* Empty states */}
              {!selectedDateISO ? (
                <p className="text-base-content/70 mt-3">Haz clic en una fecha para ver sus eventos.</p>
              ) : dayEvents.length === 0 ? (
                <div className="alert alert-info mt-3">
                  <span>No hay eventos para este día.</span>
                </div>
              ) : (
                <>
                  <div className="mt-3 flex items-center justify-between text-xs opacity-70">
                    <span>
                      {dayEvents.length} evento{dayEvents.length !== 1 ? "s" : ""}
                    </span>
                    <span>Selecciona para ver detalles</span>
                  </div>
                  <ul className="menu menu-sm bg-base-100 rounded-box mt-2 border border-base-300">
                    {dayEvents.map((ev) => {
                      const active = selectedEvent?._id === ev._id;
                      return (
                        <li key={ev._id}>
                          <button
                            className={`justify-between ${active ? "active font-semibold" : ""}`}
                            onClick={() => setSelectedEvent(ev)}
                            title={ev.title}
                          >
                            <span className="truncate">{ev.title}</span>
                            <span className="badge badge-ghost whitespace-nowrap">
                              {DateTime.fromISO(ev.startDateTime, { zone: TZ }).toFormat("HH:mm")}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

              {/* Detalle del evento seleccionado */}
              {selectedEvent && (
                <div className="mt-4 p-4 rounded-xl bg-base-100 border border-base-300">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {(() => {
                      const { className, label } = statusBadge(selectedEvent.status);
                      return <span className={className}>{label}</span>;
                    })()}
                    {selectedEvent.isOnline ? (
                      <span className="badge badge-info">Online</span>
                    ) : (
                      <span className="badge badge-ghost">Presencial</span>
                    )}
                    {selectedEvent.requiresRegistration && (
                      <span className="badge badge-warning">Inscripción</span>
                    )}
                    {selectedEvent.status === "cancelled" && (
                      <span className="text-xs font-semibold text-error">Este evento ha sido cancelado</span>
                    )}
                  </div>

                  {/* Título y descripción */}
                  <h3 className="text-base sm:text-lg font-bold leading-snug">{selectedEvent.title}</h3>
                  {selectedEvent.description && (
                    <p className="text-sm text-base-content/80 mt-1 line-clamp-4">{selectedEvent.description}</p>
                  )}

                  {/* Datos con iconos */}
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <UserRound className="size-4 mt-0.5 opacity-70" />
                      <div>
                        <span className="font-semibold">Organiza:</span> {selectedEvent.organizer}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="size-4 mt-0.5 opacity-70" />
                      <div>
                        <span className="font-semibold">Lugar:</span>{" "}
                        {selectedEvent.isOnline ? "Online" : selectedEvent.location}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="size-4 mt-0.5 opacity-70" />
                      <div>
                        <span className="font-semibold">Horario:</span>{" "}
                        {formatRange(selectedEvent.startDateTime, selectedEvent.endDateTime)}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Ticket className="size-4 mt-0.5 opacity-70" />
                      <div>
                        <span className="font-semibold">Precio:</span>{" "}
                        {selectedEvent.price ? CLP.format(selectedEvent.price) : "Gratuito"}
                      </div>
                    </div>

                    {selectedEvent.capacity != null && (
                      <div className="flex items-start gap-2">
                        <Tag className="size-4 mt-0.5 opacity-70 rotate-90" />
                        <div>
                          <span className="font-semibold">Cupos:</span> {selectedEvent.capacity}
                        </div>
                      </div>
                    )}

                    {!!selectedEvent.tags?.length && (
                      <div className="pt-1 flex flex-wrap gap-2">
                        {selectedEvent.tags.map((t) => (
                          <span key={t} className="badge badge-ghost">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedEvent.isOnline && selectedEvent.urlOnline && (
                      <a
                        href={selectedEvent.urlOnline}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-xs sm:btn-sm w-full gap-2"
                        title={selectedEvent.urlOnline}
                        aria-label="Abrir enlace del evento online en una nueva pestaña"
                      >
                        Entrar al evento
                        <ExternalLink className="size-4" aria-hidden="true" />
                      </a>
                    )}

                    {selectedEvent.url ? (
                      <a
                        href={selectedEvent.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn ${
                          selectedEvent.isOnline && selectedEvent.urlOnline ? "btn-ghost" : "btn-secondary"
                        } btn-xs sm:btn-sm w-full gap-2`}
                        title={selectedEvent.url}
                        aria-label="Abrir más información en una nueva pestaña"
                      >
                        Más información
                        <LinkIcon className="size-4" aria-hidden="true" />
                      </a>
                    ) : (
                      !selectedEvent.urlOnline && (
                        <span className="text-xs sm:text-sm text-base-content/70">
                          No hay enlaces disponibles para este evento.
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

export default EventsCalendarPage;
