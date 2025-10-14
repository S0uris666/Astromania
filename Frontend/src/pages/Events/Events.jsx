// src/pages/EventsCalendarPage.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import EventContext from "../../context/events/eventsContext";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import esLocale from "@fullcalendar/core/locales/es";

import { DateTime } from "luxon";

const TZ = "America/Santiago";
const CLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

const formatRange = (startISO, endISO) => {
  const s = DateTime.fromISO(startISO, { zone: TZ });
  const e = DateTime.fromISO(endISO, { zone: TZ });
  return s.hasSame(e, "day")
    ? `${s.toFormat("dd LLL yyyy, HH:mm")} – ${e.toFormat("HH:mm")} (${s.offsetNameShort})`
    : `${s.toFormat("dd LLL yyyy, HH:mm")} → ${e.toFormat("dd LLL yyyy, HH:mm")} (${s.offsetNameShort})`;
};

const statusBadge = (status) =>
  status === "published"
    ? "badge-success"
    : status === "cancelled"
    ? "badge-error"
    : "badge-ghost";

// ====== Estilo visual de los eventos en el calendario ======
function renderEventContent(arg) {
  const timeOnly = arg.timeText.split(" - ")[0] || arg.timeText;
  const event = arg.event.extendedProps.ev;

  let colorClasses = "";
  if (event?.isOnline) {
    colorClasses = "bg-gradient-to-r from-cyan-500 to-cyan-600";
  } else if (event?.requiresRegistration) {
    colorClasses = "bg-gradient-to-r from-amber-500 to-amber-600";
  } else {
    colorClasses = "bg-gradient-to-r from-purple-500 to-purple-600";
  }

  return (
    <div
      className={`
        ${colorClasses}
        text-white px-2.5 py-1 rounded-xl text-xs font-semibold text-center
        shadow-md min-w-[45px] max-w-[70px] overflow-hidden whitespace-nowrap
        transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg
      `}
      title={arg.event.title}
    >
      <span className="block leading-tight tracking-wide">{timeOnly}</span>
    </div>
  );
}

// ====== Hook simple para detectar vista móvil ======
const useIsMobile = (query = "(max-width: 640px)") => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );
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

  // ====== Datos de prueba (comentar si la API ya responde) ======
  const testEvents = [
    {
      _id: "test1",
      title: "Eclipse Solar de Prueba",
      description: "Evento de prueba para verificar horarios",
      organizer: "Astromanía",
      location: "Santiago",
      startDateTime: "2025-01-15T14:30:00-03:00",
      endDateTime: "2025-01-15T16:30:00-03:00",
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

  // ====== Mapeo a eventos de FullCalendar ======
  const calendarEvents = useMemo(() => {
    const mapped = (eventsToUse || [])
      .filter((ev) => isISO(ev.startDateTime))
      .map((ev) => {
        const startDT = DateTime.fromISO(ev.startDateTime, { zone: TZ });
        const endDT = ev.endDateTime
          ? DateTime.fromISO(ev.endDateTime, { zone: TZ })
          : null;
        return {
          id: ev._id,
          title: ev.title,
          start: startDT.toISO(),
          end: endDT ? endDT.toISO() : null,
          extendedProps: { ev },
        };
      });
    return mapped;
  }, [eventsToUse]);

  // ====== Eventos del día seleccionado (panel lateral) ======
  const dayEvents = useMemo(() => {
    if (!selectedDateISO) return [];
    const d = DateTime.fromISO(selectedDateISO, { zone: TZ });
    return (eventsToUse || [])
      .filter((ev) => DateTime.fromISO(ev.startDateTime, { zone: TZ }).hasSame(d, "day"))
      .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
  }, [eventsToUse, selectedDateISO]);

  // ====== Handlers ======
  const handleDateSelect = (selectInfo) => {
    setSelectedDateISO(selectInfo.startStr.slice(0, 10)); // YYYY-MM-DD
    setSelectedEvent(null);
  };

  const handleEventClick = (clickInfo) => {
    const full = clickInfo.event.extendedProps.ev;
    setSelectedDateISO(DateTime.fromISO(full.startDateTime).toISODate());
    setSelectedEvent(full);
  };

  const handleEventsSet = () => {};

  // ====== Toolbar e InitialView responsivos ======
  const headerToolbar = useMemo(
    () =>
      isMobile
        ? { left: "prev,next", center: "title", right: "today" }
        : {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          },
    [isMobile]
  );

  const initialView = isMobile ? "listWeek" : "dayGridMonth";

  return (
    <>
      <style>{`
        /* Limpia estilos del evento para usar el render custom */
        .fc-event { border: none !important; background: none !important; padding: 2px !important; }
        .fc-daygrid-event { margin: 1px 0 !important; }
        .fc-event-title { display: none !important; }

        /* Ajustes responsivos en la toolbar */
        .fc .fc-toolbar-title { font-size: ${isMobile ? "1rem" : "1.25rem"}; }
        .fc .fc-button { padding: ${isMobile ? "0.25rem 0.5rem" : "0.5rem 0.75rem"}; }
        .fc .fc-button { text-transform: none; } /* Evita MAYÚSCULAS forzadas */
        .fc .fc-daygrid-day-number { font-size: 0.9rem; }
        .fc .fc-timegrid-slot-label { font-size: 0.8rem; }
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

              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                // Localización en español
                locales={[esLocale]}
                locale="es"
                buttonText={{ today: "Hoy", month: "Mes", week: "Semana", day: "Día", list: "Lista" }}
                // Toolbar / vista inicial responsivas
                headerToolbar={headerToolbar}
                initialView={initialView}
                // Ajustes de tamaño
                height="auto"
                contentHeight="auto"
                expandRows={true}
                handleWindowResize={true}
                // Comportamiento
                dayMaxEvents={true}
                weekends={weekendsVisible}
                selectable={true}
                selectMirror={true}
                firstDay={1} // lunes
                // Zona horaria
                timeZone={TZ}
                eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
                displayEventTime={true}
                forceEventDuration={true}
                eventDisplay="block"
                // Datos
                events={calendarEvents}
                select={handleDateSelect}
                eventClick={handleEventClick}
                eventsSet={handleEventsSet}
                eventContent={renderEventContent}
              />
            </div>
          </div>
        </section>

        {/* Panel derecho */}
        <aside className="lg:col-span-1">
          <div className="card bg-base-200 shadow-xl sticky top-4">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h2 className="card-title">Detalle del día</h2>
                {selectedDateISO ? (
                  <div className="badge badge-ghost">
                    {DateTime.fromISO(selectedDateISO, { zone: TZ }).toFormat("dd LLL yyyy")}
                  </div>
                ) : (
                  <div className="badge badge-ghost">Selecciona un día</div>
                )}
              </div>

              {!selectedDateISO ? (
                <p className="text-base-content/70">Haz clic en una fecha para ver sus eventos.</p>
              ) : dayEvents.length === 0 ? (
                <div className="alert">
                  <span>No hay eventos para este día.</span>
                </div>
              ) : (
                <ul className="menu bg-base-100 rounded-box">
                  {dayEvents.map((ev) => {
                    const active = selectedEvent?._id === ev._id;
                    return (
                      <li key={ev._id}>
                        <button
                          className={active ? "active" : ""}
                          onClick={() => setSelectedEvent(ev)}
                          title={ev.title}
                        >
                          <span className="font-medium">{ev.title}</span>
                          <span className="ml-auto text-xs opacity-70">
                            {DateTime.fromISO(ev.startDateTime, { zone: TZ }).toFormat("HH:mm")}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {selectedEvent && (
                <div className="mt-4 p-4 rounded-xl bg-base-100 border border-base-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${statusBadge(selectedEvent.status)}`}>
                      {selectedEvent.status}
                    </span>
                    {selectedEvent.isOnline ? (
                      <span className="badge badge-info">Online</span>
                    ) : (
                      <span className="badge badge-ghost">Presencial</span>
                    )}
                    {selectedEvent.requiresRegistration && (
                      <span className="badge badge-warning">Inscripción</span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
                  <p className="text-sm text-base-content/80 mt-1">{selectedEvent.description}</p>

                  <div className="mt-3 space-y-1 text-sm">
                    <div>
                      <span className="font-semibold">Organiza:</span> {selectedEvent.organizer}
                    </div>
                    <div>
                      <span className="font-semibold">Lugar:</span>{" "}
                      {selectedEvent.isOnline ? "Online" : selectedEvent.location}
                    </div>
                    <div>
                      <span className="font-semibold">Horario:</span>{" "}
                      {formatRange(selectedEvent.startDateTime, selectedEvent.endDateTime)}
                    </div>
                    <div>
                      <span className="font-semibold">Precio:</span>{" "}
                      {selectedEvent.price ? CLP.format(selectedEvent.price) : "Gratuito"}
                    </div>
                    <div>
                      <span className="font-semibold">URL:</span>{" "}
                      {selectedEvent?.url ? (
                        <a
                          href={selectedEvent.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-primary break-all"
                          title={selectedEvent.url}
                        >
                          Más información
                        </a>
                      ) : (
                        "No disponible"
                      )}
                    </div>
                    {selectedEvent.capacity != null && (
                      <div>
                        <span className="font-semibold">Cupos:</span> {selectedEvent.capacity}
                      </div>
                    )}
                    {!!selectedEvent.tags?.length && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {selectedEvent.tags.map((t) => (
                          <span key={t} className="badge badge-ghost">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {selectedEvent.isOnline && selectedEvent.url && (
                      <div className="pt-2">
                        <a
                          href={selectedEvent.url}
                          target="_blank"
                          rel="noreferrer"
                          className="link link-primary"
                        >
                          Ir al enlace del evento
                        </a>
                      </div>
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
