
import { useContext, useEffect, useMemo, useState } from "react";
import EventContext from "../../context/events/eventsContext";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";



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

const statusBadge = (status) => (status === "published" ? "badge-success" : status === "cancelled" ? "badge-error" : "badge-ghost");


function renderEventContent(arg) {
  
  return (
    <>
      <b>{arg.timeText}</b>&nbsp;<i>{arg.event.title}</i>
    </>
  );
}

export function EventsCalendarPage() {
  const { Event = [], getAllEvents } = useContext(EventContext);

  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [selectedDateISO, setSelectedDateISO] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => { getAllEvents(); }, [getAllEvents]);

  const isISO = (v) => DateTime.fromISO(String(v || ""), { setZone: true }).isValid;

  // (forzamos ISO para evitar sorpresas)
const calendarEvents = useMemo(() => {
  const mapped = (Event || [])
    .filter(ev => isISO(ev.startDateTime)) // exige start válido
    .map(ev => {
      const startISO = ev.startDateTime;
      const endISO = ev.endDateTime || null;
      return {
        id: ev._id,
        title: ev.title,
        start: startISO,
        end: endISO,
        
        extendedProps: { ev },
      };
    });
      const invalid = (Event || []).filter(ev => !isISO(ev.startDateTime));
  if (invalid.length) {
    console.warn("[EV] eventos con fecha inválida:", invalid.map(e => ({
      _id: e._id, title: e.title, startDateTime: e.startDateTime
    })));
  }
  console.log("[EV] calendarEvents ->", mapped); 
  return mapped;
}, [Event]);

  // Eventos del día seleccionado (para el panel)
  const dayEvents = useMemo(() => {
    if (!selectedDateISO) return [];
    const d = DateTime.fromISO(selectedDateISO, { zone: TZ });
    return (Event || [])
      .filter((ev) => DateTime.fromISO(ev.startDateTime, { zone: TZ }).hasSame(d, "day"))
      .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
  }, [Event, selectedDateISO]);

  // === Handlers estilo demo oficial ===
  const handleDateSelect = (selectInfo) => {
    setSelectedDateISO(selectInfo.startStr.slice(0, 10)); // YYYY-MM-DD
    setSelectedEvent(null);
  };

  const handleEventClick = (clickInfo) => {
    const full = clickInfo.event.extendedProps.ev;
    setSelectedDateISO(DateTime.fromISO(full.startDateTime).toISODate());
    setSelectedEvent(full);
  };

  const handleEventsSet = () => {
  };

  return (
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
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay"
              }}
              initialView="dayGridMonth"
              height="auto"
              dayMaxEvents={true}
              weekends={weekendsVisible}
              selectable={true}
              timeZone="America/Santiago"
              locale="es"
              selectMirror={true}
              events={calendarEvents}          //Datos de db
              select={handleDateSelect}        
              eventClick={handleEventClick}    
              eventsSet={handleEventsSet}      
              eventContent={renderEventContent}
              firstDay={1} // lunes
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
              {selectedDateISO
                ? <div className="badge badge-ghost">{DateTime.fromISO(selectedDateISO, { zone: TZ }).toFormat("dd LLL yyyy")}</div>
                : <div className="badge badge-ghost">Selecciona un día</div>}
            </div>

            {!selectedDateISO ? (
              <p className="text-base-content/70">Haz clic en una fecha para ver sus eventos.</p>
            ) : dayEvents.length === 0 ? (
              <div className="alert"><span>No hay eventos para este día.</span></div>
            ) : (
              <ul className="menu bg-base-100 rounded-box">
                {dayEvents.map((ev) => {
                  const active = selectedEvent?._id === ev._id;
                  return (
                    <li key={ev._id}>
                      <button className={active ? "active" : ""} onClick={() => setSelectedEvent(ev)} title={ev.title}>
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
                  <span className={`badge ${statusBadge(selectedEvent.status)}`}>{selectedEvent.status}</span>
                  {selectedEvent.isOnline ? <span className="badge badge-info">Online</span> : <span className="badge badge-ghost">Presencial</span>}
                  {selectedEvent.requiresRegistration && <span className="badge badge-warning">Inscripción</span>}
                </div>

                <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
                <p className="text-sm text-base-content/80 mt-1">{selectedEvent.description}</p>

                <div className="mt-3 space-y-1 text-sm">
                  <div><span className="font-semibold">Organiza:</span> {selectedEvent.organizer}</div>
                  <div><span className="font-semibold">Lugar:</span> {selectedEvent.isOnline ? "Online" : selectedEvent.location}</div>
                  <div><span className="font-semibold">Horario:</span> {formatRange(selectedEvent.startDateTime, selectedEvent.endDateTime)}</div>
                  <div><span className="font-semibold">Precio:</span> {selectedEvent.price ? CLP.format(selectedEvent.price) : "Gratuito"}</div>
                  {selectedEvent.capacity != null && <div><span className="font-semibold">Cupos:</span> {selectedEvent.capacity}</div>}
                  {!!selectedEvent.tags?.length && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedEvent.tags.map((t) => <span key={t} className="badge badge-ghost">{t}</span>)}
                    </div>
                  )}
                  {selectedEvent.isOnline && selectedEvent.url && (
                    <div className="pt-2">
                      <a href={selectedEvent.url} target="_blank" rel="noreferrer" className="link link-primary">Ir al enlace del evento</a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
