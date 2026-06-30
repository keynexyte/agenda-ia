'use client';

import { useState, useEffect } from 'react';
import { Bot, User, Clock, CheckCircle, ChevronRight, Calendar } from 'lucide-react';

const DEPARTMENTS = [
  'Gestión Humana',
  'Seguridad en el Trabajo',
  'Contabilidad',
  'Tesorería General',
  'Publicidad y Mercadeo',
  'Control Interno',
  'Planeación de la Demanda',
  'TICs',
  'Operaciones',
  'Gerencia',
  'Compras',
  'Ambiental',
  'CEDI',
  'Mantenimiento',
  'Gastronomía'
];

function getAvailableDates() {
  const dates = [];
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const currentDay = today.getDay(); 
  const daysToSunday = currentDay === 0 ? 0 : 7 - currentDay;
  const daysToNextFriday = daysToSunday + 5;
  
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + daysToNextFriday);
  maxDate.setHours(23, 59, 59, 999);
  
  const d = new Date(today);
  while (d <= maxDate) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) { // Lunes a Viernes
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${date}`);
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [department, setDepartment] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<{time: string, available: boolean}[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  
  const availableDates = getAvailableDates();

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/slots?date=${date}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (step === 4 && date) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, date]);

  const handleBook = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, department, date, time_slot: selectedSlot }),
      });
      if (res.ok) {
        setStep(5); // Success step
      } else {
        const err = await res.json();
        alert(`Fallo en la reserva: ${err.error}`);
        fetchSlots();
      }
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al reservar.');
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      setClickCount(0);
      const username = prompt('Ingrese usuario de administrador:');
      if (username) {
        const password = prompt('Ingrese contraseña:');
        if (password) {
          fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          }).then(res => {
            if (res.ok) {
              window.location.href = '/admin';
            } else {
              alert('Credenciales incorrectas');
            }
          });
        }
      }
    }
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }} className="animate-fade-in">
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '0' }}>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', margin: 0 }}>Capacitación IA</h1>
          <div 
            onClick={handleLogoClick}
            style={{ display: 'inline-flex', background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '50%', cursor: 'pointer' }}
            title="Área Administrativa"
          >
            <Bot size={32} color="var(--primary)" />
          </div>
        </div>

        <div style={{ marginBottom: '0' }}>
          <img 
            src="/logo.png" 
            alt="Mercaldas" 
            style={{ width: '280px', height: 'auto', margin: '-1.5rem auto -1rem auto', display: 'block' }}
          />
        </div>

        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Programe su sesión de inmersión en Inteligencia Artificial</p>
      </div>

      <div className="glass-panel animate-fade-in delay-1" style={{ padding: '2rem' }}>
        
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={24} color="var(--accent)"/> Seleccione su Dependencia
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              {DEPARTMENTS.map(dept => (
                <button
                  key={dept}
                  className={`glass-card ${department === dept ? 'selected' : ''}`}
                  style={{
                    padding: '16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--text-main)',
                    fontSize: '1.1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: department === dept ? '1px solid var(--primary)' : '1px solid var(--border)',
                    background: department === dept ? 'rgba(59, 130, 246, 0.1)' : ''
                  }}
                  onClick={() => { setDepartment(dept); setStep(2); }}
                >
                  {dept}
                  {department === dept && <ChevronRight size={20} color="var(--primary)" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
              ← Atrás
            </button>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={24} color="var(--accent)"/> Ingrese su Nombre
            </h2>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ej. Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ marginBottom: '1.5rem', fontSize: '1.2rem', padding: '16px' }}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && name && setStep(3)}
            />
            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={!name.trim()}
              onClick={() => setStep(3)}
            >
              Continuar <ChevronRight size={20} />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
             <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
              ← Atrás
            </button>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={24} color="var(--accent)"/> Seleccione la Fecha
            </h2>
            
            <div className="slot-grid" style={{ marginBottom: '2rem' }}>
              {availableDates.map(d => (
                <div 
                  key={d}
                  className={`slot-item available ${date === d ? 'selected' : ''}`}
                  onClick={() => { setDate(d); setStep(4); }}
                  style={{ textTransform: 'capitalize' }}
                >
                  {formatDate(d)}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in">
             <button onClick={() => setStep(3)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
              ← Atrás
            </button>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={24} color="var(--accent)"/> Elija la Hora</span>
              <span className="badge badge-primary"><Calendar size={12} style={{marginRight: '4px'}}/> {date}</span>
            </h2>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Cargando disponibilidad...</div>
            ) : (
              <div className="slot-grid" style={{ marginBottom: '2rem' }}>
                {slots.map(slot => (
                  <div 
                    key={slot.time}
                    className={`slot-item ${slot.available ? 'available' : 'booked'} ${selectedSlot === slot.time ? 'selected' : ''}`}
                    onClick={() => slot.available && setSelectedSlot(slot.time)}
                  >
                    {slot.time}
                    {!slot.available && <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>No disponible</div>}
                  </div>
                ))}
              </div>
            )}

            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={!selectedSlot || loading}
              onClick={handleBook}
            >
              Confirmar Reserva
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1rem', margin: '0 auto' }} />
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>¡Reserva Confirmada!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
              Usted está programado para Capacitación IA el <strong>{date}</strong> a las <strong>{selectedSlot}</strong>.
            </p>
            <div className="glass-card" style={{ padding: '16px', marginBottom: '2rem', textAlign: 'left', display: 'inline-block' }}>
              <p><strong>Nombre:</strong> {name}</p>
              <p><strong>Dependencia:</strong> {department}</p>
            </div>
            <br/>
            <button 
              className="btn btn-outline"
              onClick={() => {
                setStep(1);
                setDepartment('');
                setName('');
                setDate('');
                setSelectedSlot('');
              }}
            >
              Programar Otra Sesión
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
