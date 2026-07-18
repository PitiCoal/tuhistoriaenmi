'use client';

import Link from 'next/link';
import { LogIn, LogOut, Shield, ChevronDown, Bell } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useState, useEffect } from 'react';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/supabase';

const episodesDropdown = [
  { href: '/episodios', label: 'Episodios (Podcast)' },
  { href: '/testimonios', label: 'Testimonios de Fe' },
];

const dropdownLinks = [
  { href: '/comunidad', label: 'Muro' },
  { href: '/tienda', label: 'Tienda Solidaria' },
];

const ADMIN_EMAIL = 'piti.coal@gmail.com';

export default function Header() {
  const { user, signIn, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [episodesMenuOpen, setEpisodesMenuOpen] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const isAdmin = typeof user === 'object' && user?.email === ADMIN_EMAIL;
  const fbUser = typeof user === 'object' && user;

  useEffect(() => {
    if (!fbUser || !fbUser.uid) return;
    
    getUserNotifications(fbUser.uid).then(list => {
      setNotifications(list);
      setUnreadCount(list.filter((n: any) => !n.is_read).length);
    }).catch(err => console.error('Error fetching notifications:', err));

    const interval = setInterval(() => {
      getUserNotifications(fbUser.uid).then(list => {
        setNotifications(list);
        setUnreadCount(list.filter((n: any) => !n.is_read).length);
      }).catch(err => console.error('Polling notifications error:', err));
    }, 30000);

    return () => clearInterval(interval);
  }, [fbUser]);

  async function handleOpenNotifPanel() {
    setShowNotifPanel(!showNotifPanel);
  }

  async function handleMarkRead(id: string) {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }

  async function handleMarkAllRead() {
    if (!fbUser || !fbUser.uid) return;
    await markAllNotificationsAsRead(fbUser.uid);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-200/70 pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-6xl mx-auto px-3 md:px-4 h-14 md:h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 md:gap-3 shrink-0">
          <img src="/images/logo.png" alt="" className="h-8 w-8 md:h-10 md:w-10" />
          <span className="font-heading text-sm md:text-lg font-bold text-primary-dark truncate max-w-[130px] md:max-w-none">
            Tu Historia En Mí
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
          <Link href="/" className="text-text-light hover:text-primary transition-colors whitespace-nowrap">
            Inicio
          </Link>

          {/* Menú Desplegable Episodios */}
          <div
            className="relative py-2"
            onMouseEnter={() => setEpisodesMenuOpen(true)}
            onMouseLeave={() => setEpisodesMenuOpen(false)}
          >
            <button 
              onClick={() => setEpisodesMenuOpen(!episodesMenuOpen)}
              className="flex items-center gap-1 text-text-light hover:text-primary transition-colors whitespace-nowrap font-medium focus:outline-none"
            >
              Episodios
              <ChevronDown size={14} className={`transition-transform duration-200 ${episodesMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {episodesMenuOpen && (
              <div className="absolute top-full left-0 mt-0 bg-white border border-gray-100 shadow-lg rounded-xl py-2 w-44 transition-all duration-200 z-[100]">
                {episodesDropdown.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-2 text-xs text-text-light hover:text-primary hover:bg-primary/5 transition-colors font-medium"
                    onClick={() => setEpisodesMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/nosotros" className="text-text-light hover:text-primary transition-colors whitespace-nowrap">
            Nosotros
          </Link>

          <Link href="/proyectos" className="text-text-light hover:text-primary transition-colors whitespace-nowrap">
            Proyectos
          </Link>

          {/* Menú Desplegable Comunidad */}
          <div
            className="relative py-2"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1 text-text-light hover:text-primary transition-colors whitespace-nowrap font-medium focus:outline-none"
            >
              Comunidad
              <ChevronDown size={14} className={`transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute top-full left-0 mt-0 bg-white border border-gray-100 shadow-lg rounded-xl py-2 w-48 transition-all duration-200 z-[100]">
                {dropdownLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-2 text-xs text-text-light hover:text-primary hover:bg-primary/5 transition-colors font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/donar" className="text-text-light hover:text-primary transition-colors whitespace-nowrap">
            Donar
          </Link>

          {fbUser && (
            <Link href="/perfil" className="text-text-light hover:text-primary transition-colors whitespace-nowrap">
              Mi Perfil
            </Link>
          )}

          {isAdmin && (
            <Link href="/admin/proyectos" className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary font-semibold hover:bg-primary/20 text-xs whitespace-nowrap">
              <Shield size={14} /> Admin
            </Link>
          )}
          <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
            {fbUser ? (
              <>
                {/* Centro de Notificaciones (Campanita) */}
                <div className="relative">
                  <button 
                    onClick={handleOpenNotifPanel} 
                    className="p-1.5 text-text-light hover:text-primary transition-colors relative active:scale-90 focus:outline-none"
                    title="Notificaciones"
                  >
                    <Bell size={16} className={unreadCount > 0 ? "text-primary animate-bounce" : ""} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
                    )}
                  </button>
                  
                  {showNotifPanel && (
                    <div className="absolute right-0 mt-2 bg-white border border-gray-200 shadow-xl rounded-xl py-2 w-72 max-h-80 overflow-y-auto z-[120]">
                      <div className="px-3 pb-2 border-b border-gray-100 flex items-center justify-between">
                        <span className="font-semibold text-xs text-primary-dark">Notificaciones</span>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-[10px] text-primary hover:underline font-medium">
                            Marcar leídas
                          </button>
                        )}
                      </div>
                      <div className="divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                          <p className="text-[11px] text-text-light text-center py-4">No tienes notificaciones</p>
                        ) : (
                          notifications.map(n => (
                            <Link 
                              key={n.id} 
                              href={n.url || '#'} 
                              onClick={() => { setShowNotifPanel(false); handleMarkRead(n.id); }}
                              className={`block px-3 py-2 text-left hover:bg-primary/5 transition-colors ${!n.is_read ? 'bg-primary/[0.02] font-medium' : ''}`}
                            >
                              <p className="text-xs text-primary-dark leading-tight">{n.title}</p>
                              <p className="text-[10px] text-text-light mt-0.5 line-clamp-2">{n.body}</p>
                              <span className="text-[9px] text-text-light/60 mt-1 block">
                                {new Date(n.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-xs text-text-light truncate max-w-[100px]">{fbUser.displayName || fbUser.email}</span>
                <button onClick={() => signOut()} className="p-1.5 text-text-light hover:text-primary active:scale-90" title="Cerrar sesión"><LogOut size={16} /></button>
              </>
            ) : (
              <button onClick={() => signIn()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm active:scale-90"><LogIn size={14} /> Entrar</button>
            )}
          </div>
        </nav>

        {fbUser ? (
          <div className="md:hidden flex items-center gap-2">
            {/* Centro de Notificaciones Móvil */}
            <div className="relative">
              <button 
                onClick={handleOpenNotifPanel} 
                className="p-1.5 text-text-light relative active:scale-90 focus:outline-none"
                title="Notificaciones"
              >
                <Bell size={16} className={unreadCount > 0 ? "text-primary animate-pulse" : ""} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </button>
              
              {showNotifPanel && (
                <div className="absolute right-[-40px] mt-2 bg-white border border-gray-200 shadow-xl rounded-xl py-2 w-64 max-h-80 overflow-y-auto z-[120]">
                  <div className="px-3 pb-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-xs text-primary-dark">Notificaciones</span>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-[10px] text-primary hover:underline font-medium">
                        Marcar leídas
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <p className="text-[11px] text-text-light text-center py-4">No tienes notificaciones</p>
                    ) : (
                      notifications.map(n => (
                        <Link 
                          key={n.id} 
                          href={n.url || '#'} 
                          onClick={() => { setShowNotifPanel(false); handleMarkRead(n.id); }}
                          className={`block px-3 py-2 text-left hover:bg-primary/5 transition-colors ${!n.is_read ? 'bg-primary/[0.02] font-medium' : ''}`}
                        >
                          <p className="text-xs text-primary-dark leading-tight">{n.title}</p>
                          <p className="text-[10px] text-text-light mt-0.5 line-clamp-2">{n.body}</p>
                          <span className="text-[9px] text-text-light/60 mt-1 block">
                            {new Date(n.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <span className="text-xs text-text-light truncate max-w-[80px]">{fbUser.displayName || fbUser.email}</span>
            <button onClick={() => signOut()} className="p-1.5 text-text-light active:scale-90" title="Cerrar sesión"><LogOut size={16} /></button>
          </div>
        ) : (
          <button onClick={() => signIn()} className="md:hidden flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg active:scale-90">
            <LogIn size={14} /> Entrar
          </button>
        )}
      </div>
    </header>
  );
}
