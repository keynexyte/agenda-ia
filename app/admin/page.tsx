'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Users, Server, Shield, Activity, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookings, setBookings] = useState<any[]>([]);
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      setBookings(data.bookings || []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Fetch local IP to generate QR Code
    fetch('/api/ip')
      .then(res => res.json())
      .then(data => {
        setIp(data.ip);
        const currentPort = window.location.port ? `:${window.location.port}` : '';
        setPort(currentPort);
        
        // If deployed on Vercel, use the Vercel URL for the QR code
        // Otherwise, use the local network IP so mobile devices can connect
        const isVercel = window.location.hostname.includes('vercel.app');
        const url = isVercel 
          ? window.location.origin 
          : `http://${data.ip}${currentPort}`;
          
        QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#0f172a', light: '#f8fafc' } })
          .then(url => setQrCodeUrl(url))
          .catch(err => console.error(err));
      });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookings();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchBookings, 10000);
    return () => clearInterval(interval);
  }, []);

  const markAsCompleted = async (id: number) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Terminada' })
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadPercentage = Math.min(Math.round((bookings.length / 5) * 100), 100);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield size={32} /> Panel de Administración
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Gestión de la Plataforma de Capacitación IA</p>
        </div>
        <button 
          onClick={fetchBookings} 
          className="btn btn-outline"
          style={{ padding: '8px 16px' }}
        >
          <RefreshCw size={16} /> Actualizar
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Network & QR Info */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={20} color="var(--primary)"/> Acceso a la Red
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
            Escanee para acceder a la plataforma de reservas en la red WiFi local.
          </p>
          
          {qrCodeUrl ? (
             <div style={{ background: 'white', padding: '16px', borderRadius: '16px', marginBottom: '1.5rem' }}>
               <img src={qrCodeUrl} alt="Código QR" style={{ width: '200px', height: '200px' }} />
             </div>
          ) : (
            <div style={{ width: '200px', height: '200px', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              Cargando QR...
            </div>
          )}

          <div className="badge badge-primary" style={{ fontSize: '1rem', padding: '8px 16px' }}>
            http://{ip}{port}
          </div>
        </div>

        {/* Overview & Load */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--accent)"/> Carga del Sistema
          </h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Total de Reservas Realizadas</span>
              <strong>{bookings.length}</strong>
            </div>
            <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${loadPercentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', transition: 'width 0.5s ease' }} />
            </div>
          </div>

          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--primary)"/> Reservas Recientes
          </h2>
          
          {loading ? (
            <p>Cargando...</p>
          ) : bookings.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Aún no hay reservas.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
              {bookings.map((b) => (
                <div key={b.id} className="glass-card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong>{b.name}</strong>
                    <span className="badge badge-success">{b.time_slot}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <span>{b.department}</span>
                    <span>{b.date}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', alignItems: 'center' }}>
                    <span className={`badge ${b.status === 'Terminada' ? 'badge-success' : 'badge-primary'}`}>
                      {b.status || 'Pendiente'}
                    </span>
                    {b.status !== 'Terminada' && (
                      <button 
                        onClick={() => markAsCompleted(b.id)}
                        className="btn btn-outline"
                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                      >
                        Marcar Terminada
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Última actualización: {lastRefreshed ? lastRefreshed.toLocaleTimeString() : 'Cargando...'}
          </p>
        </div>
      </div>
    </div>
  );
}
