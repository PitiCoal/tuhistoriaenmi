'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { LogIn, LogOut, Shield, ChevronDown, Bell, Sun, Moon, Type, Check, Menu, X, User } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/adminAuth';
import { useTheme } from '@/lib/ThemeContext';

const formacionDropdown = [
  { href: '/formacion', label: 'Formación' },
  { href: '/episodios', label: 'Podcast' },
  { href: '/oraciones-guiadas', label: 'Oraciones Guiadas' },
];

const comunidadDropdown = [
  { href: '/comunidad', label: 'Muro' },
  { href: '/recomendaciones', label: 'Recomendaciones' },
];

const fontSizes = [
  { value: 'sm' as const, label: 'A', subtitle: 'Pequeño' },
  { value: 'md' as const, label: 'A', subtitle: 'Mediano' },
  { value: 'lg' as const, label: 'A', subtitle: 'Grande' },
  { value: 'xl' as const, label: 'A', subtitle: 'Extra grande' },
  { value: 'xxl' as const, label: 'A', subtitle: 'Muy grande' },
];

export default function Header() {
  const { user, signIn, signOut } = useAuth();
  const { theme, fontSize, toggleTheme, setFontSize } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [episodesMenuOpen, setEpisodesMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const episodesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);

  const isAdmin = typeof user === 'object' && user && isAdminEmail(user.email);
  const fbUser = typeof user === 'object' && user ? user : null;

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const t = e.target as Element | null
      if (!t?.closest('[data-prefs-root]')) setShowPrefs(false)
      if (!t?.closest('[data-notif-root]')) setShowNotifPanel(false)
      if (!t?.closest('[data-mobile-menu]')) setMobileMenuOpen(false)
    }
    if (showPrefs || showNotifPanel || mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPrefs, showNotifPanel, mobileMenuOpen]);

  async function handleOpenNotifPanel() {
    setShowNotifPanel(!showNotifPanel);
    setShowPrefs(false);
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
    <header className="bg-card/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-200/70 pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-6xl mx-auto px-3 md:px-4 h-14 md:h-16 flex items-center justify-between relative">
        {/* Logo - compact on mobile */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 shrink-0" data-mobile-menu>
          <img src="/images/logo.png" alt="" className="h-8 w-8 md:h-10 md:w-10" />
          <span className="hidden md:block font-heading text-sm md:text-lg font-bold text-primary-dark truncate max-w-[130px] md:max-w-none">
            Tu Historia En Mí
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link href="/" className="flex items-center h-8 px-3 text-text-light hover:text-primary hover:bg-primary/5 rounded-lg transition-colors whitespace-nowrap">
            Inicio
          </Link>

          <Link href="/el-en-mi" className="flex items-center h-8 px-3 text-text-light hover:text-primary hover:bg-primary/5 rounded-lg transition-colors whitespace-nowrap">
            Él en mí
          </Link>

          {/* Comunidad Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => { if (menuTimer.current) clearTimeout(menuTimer.current); setMenuOpen(true); }}
            onMouseLeave={() => { menuTimer.current = setTimeout(() => setMenuOpen(false), 200); }}
          >
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1 h-8 px-3 text-text-light hover:text-primary hover:bg-primary/5 rounded-lg transition-colors whitespace-nowrap font-medium focus:outline-none"
            >
              Comunidad
              <ChevronDown size={14} className={`transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute top-full left-0 bg-card border border-gray-200/70 shadow-lg rounded-xl py-2 w-48 transition-all duration-200 z-[100]"
                onMouseEnter={() => { if (menuTimer.current) clearTimeout(menuTimer.current); setMenuOpen(true); }}
                onMouseLeave={() => { menuTimer.current = setTimeout(() => setMenuOpen(false), 200); }}
              >
                {comunidadDropdown.map(link => (
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

          {/* Formación Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => { if (episodesTimer.current) clearTimeout(episodesTimer.current); setEpisodesMenuOpen(true); }}
            onMouseLeave={() => { episodesTimer.current = setTimeout(() => setEpisodesMenuOpen(false), 200); }}
          >
            <button 
              onClick={() => setEpisodesMenuOpen(!episodesMenuOpen)}
              className="flex items-center gap-1 h-8 px-3 text-text-light hover:text-primary hover:bg-primary/5 rounded-lg transition-colors whitespace-nowrap font-medium focus:outline-none"
            >
              Formación
              <ChevronDown size={14} className={`transition-transform duration-200 ${episodesMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {episodesMenuOpen && (
              <div className="absolute top-full left-0 bg-card border border-gray-200/70 shadow-lg rounded-xl py-2 w-48 transition-all duration-200 z-[100]"
                onMouseEnter={() => { if (episodesTimer.current) clearTimeout(episodesTimer.current); setEpisodesMenuOpen(true); }}
                onMouseLeave={() => { episodesTimer.current = setTimeout(() => setEpisodesMenuOpen(false), 200); }}
              >
                {formacionDropdown.map(link => (
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

          <Link href="/donar" className="flex items-center h-8 px-3 text-text-light hover:text-primary hover:bg-primary/5 rounded-lg transition-colors whitespace-nowrap">
            Donar
          </Link>

          <div className="flex items-center gap-2 pl-4 border-l border-gray-200/70">
            {/* Preferencias: tema + fuente */}
            <div className="relative" data-prefs-root>
              <button 
                onClick={() => { setShowPrefs(!showPrefs); setShowNotifPanel(false); }} 
                className="p-1.5 text-text-light hover:text-primary transition-colors active:scale-90 focus:outline-none"
                title="Personalizar"
              >
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              </button>

              {showPrefs && (
                <div className="absolute right-0 mt-2 bg-card border border-gray-200/70 shadow-xl rounded-xl py-3 w-52 z-[130]">
                  <div className="px-3 pb-2 border-b border-gray-200/70">
                    <span className="font-semibold text-xs text-primary-dark">Personalizar</span>
                  </div>
                  {/* Theme toggle */}
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs text-text-light hover:text-primary hover:bg-primary/5 transition-colors"
                  >
                    {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                    {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                  </button>
                  {/* Font size */}
                  <div className="px-3 pt-2 pb-1 border-t border-gray-200/70 mt-1">
                    <span className="text-[10px] font-medium text-text-light/60 flex items-center gap-1 mb-2">
                      <Type size={10} /> Tamaño de letra
                    </span>
                    <div className="flex gap-1">
                      {fontSizes.map(fs => (
                        <button
                          key={fs.value}
                          onClick={() => setFontSize(fs.value)}
                          className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            fontSize === fs.value
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-text-light hover:bg-gray-200'
                          }`}
                          style={{ fontSize: fs.value === 'sm' ? '10px' : fs.value === 'md' ? '12px' : fs.value === 'lg' ? '14px' : fs.value === 'xl' ? '16px' : '20px' }}
                          title={fs.subtitle}
                        >
                          {fs.label}
                          {fontSize === fs.value && <Check size={10} className="ml-0.5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {fbUser ? (
              <>
                {/* Centro de Notificaciones */}
                <div className="relative" data-notif-root>
                  <button 
                    onClick={handleOpenNotifPanel} 
                    className="p-1.5 text-text-light hover:text-primary transition-colors relative active:scale-90 focus:outline-none"
                    title="Notificaciones"
                  >
                    <Bell size={16} className={unreadCount > 0 ? "text-primary animate-bounce" : ""} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-card" />
                    )}
                  </button>
                  
                  {showNotifPanel && (
                    <div className="absolute right-0 mt-2 bg-card border border-gray-200/70 shadow-xl rounded-xl py-2 w-72 max-h-80 overflow-y-auto z-[120]">
                      <div className="px-3 pb-2 border-b border-gray-200/70 flex items-center justify-between">
                        <span className="font-semibold text-xs text-primary-dark">Notificaciones</span>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-[10px] text-primary hover:underline font-medium">
                            Marcar leídas
                          </button>
                        )}
                      </div>
                      <div className="divide-y divide-gray-200/70">
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

                {/* User section - click name for profile */}
                <Link href="/perfil" className="flex items-center gap-2 px-2">
                  <User size={16} className="text-text-light" />
                  <span className="text-xs text-text-light truncate max-w-[100px] hover:text-primary transition-colors font-medium">
                    {fbUser.displayName || fbUser.email}
                  </span>
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary font-semibold hover:bg-primary/20 text-[11px] whitespace-nowrap">
                    <Shield size={13} /> Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <button onClick={() => signIn()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm active:scale-90"><LogIn size={14} /> Entrar</button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-1.5 text-text-light active:scale-90 focus:outline-none" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} data-mobile-menu>
          <div className="absolute top-0 right-0 bottom-0 w-full md:w-72 lg:w-80 bg-card border-l border-gray-200/70 dark:border-gray-700/70 shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 space-y-4">
              {/* Nav Links */}
              <nav className="space-y-2">
                <Link href="/" className="block px-3 py-2 text-text-light hover:text-primary hover:bg-primary/5 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  <span className="font-medium">Inicio</span>
                </Link>
                <Link href="/el-en-mi" className="block px-3 py-2 text-text-light hover:text-primary hover:bg-primary/5 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  <span className="font-medium">Él en mí</span>
                </Link>

                {/* Comunidad */}
                <div className="space-y-1">
                  <button 
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center justify-between w-full px-3 py-2 text-text-light hover:text-primary hover:bg-primary/5 rounded-lg transition-colors font-medium"
                  >
                    <span>Comunidad</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {menuOpen && (
                    <div className="pl-4 space-y-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg py-2">
                      {comunidadDropdown.map(link => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block px-4 py-2 text-xs text-text-light hover:text-primary hover:bg-primary/5 transition-colors font-medium"
                          onClick={() => { setMobileMenuOpen(false); setMenuOpen(false); }}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Formación */}
                <div className="space-y-1">
                  <button 
                    onClick={() => setEpisodesMenuOpen(!episodesMenuOpen)}
                    className="flex items-center justify-between w-full px-3 py-2 text-text-light hover:text-primary hover:bg-primary/5 rounded-lg transition-colors font-medium"
                  >
                    <span>Formación</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${episodesMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {episodesMenuOpen && (
                    <div className="pl-4 space-y-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg py-2">
                      {formacionDropdown.map(link => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block px-4 py-2 text-xs text-text-light hover:text-primary hover:bg-primary/5 transition-colors font-medium"
                          onClick={() => { setMobileMenuOpen(false); setEpisodesMenuOpen(false); }}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link href="/donar" className="block px-3 py-2 text-text-light hover:text-primary hover:bg-primary/5 rounded-lg transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Donar
                </Link>
              </nav>

              <div className="border-t border-gray-200/70 dark:border-gray-700/70 pt-4 space-y-3">
                {/* Preferences */}
                <div className="relative" data-prefs-root>
                  <button 
                    onClick={() => { setShowPrefs(!showPrefs); setShowNotifPanel(false); }} 
                    className="w-full flex items-center gap-3 px-3 py-2 text-text-light hover:text-primary hover:bg-primary/5 rounded-lg transition-colors font-medium"
                  >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
                  </button>
                  {showPrefs && (
                    <div className="mt-2 space-y-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      <div className="px-3 pt-2 pb-1">
                        <span className="text-[10px] font-medium text-text-light/60 flex items-center gap-1 mb-2">
                          <Type size={10} /> Tamaño de letra
                        </span>
                        <div className="flex gap-1">
                          {fontSizes.map(fs => (
                            <button key={fs.value} onClick={() => setFontSize(fs.value)}
                              className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                fontSize === fs.value ? 'bg-primary text-white' : 'bg-white dark:bg-gray-700 text-text-light hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                              style={{ fontSize: fs.value === 'sm' ? '10px' : fs.value === 'md' ? '12px' : fs.value === 'lg' ? '14px' : fs.value === 'xl' ? '16px' : '20px' }}
                              title={fs.subtitle}
                            >
                              {fs.label}{fontSize === fs.value && <Check size={10} className="ml-0.5" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {fbUser ? (
                  <>
                    {/* Notifications */}
                    <div className="relative" data-notif-root>
                      <button 
                        onClick={handleOpenNotifPanel} 
                        className="w-full flex items-center gap-3 px-3 py-2 text-text-light hover:text-primary hover:bg-primary/5 rounded-lg transition-colors font-medium relative"
                      >
                        <Bell size={20} className={unreadCount > 0 ? "text-primary animate-bounce" : ""} />
                        <span>Notificaciones</span>
                        {unreadCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </button>
                      {showNotifPanel && (
                        <div className="mt-2 bg-card border border-gray-200/70 dark:border-gray-700/70 shadow-xl rounded-xl py-2 max-h-80 overflow-y-auto">
                          <div className="px-3 pb-2 border-b border-gray-200/70 dark:border-gray-700/70 flex items-center justify-between">
                            <span className="font-semibold text-xs text-primary-dark">Notificaciones</span>
                            {unreadCount > 0 && (
                              <button onClick={handleMarkAllRead} className="text-[10px] text-primary hover:underline font-medium">
                                Marcar leídas
                              </button>
                            )}
                          </div>
                          <div className="divide-y divide-gray-200/70 dark:divide-gray-700/70">
                            {notifications.length === 0 ? (
                              <p className="text-[11px] text-text-light text-center py-4">No tienes notificaciones</p>
                            ) : (
                              notifications.map(n => (
                                <Link 
                                  key={n.id} 
                                  href={n.url || '#'} 
                                  onClick={() => { setShowNotifPanel(false); handleMarkRead(n.id); setMobileMenuOpen(false); }}
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

                    {/* User - click name goes to profile, logout in perfil page */}
                    <Link href="/perfil" className="flex items-center gap-3 px-3 py-2 text-text-light hover:text-primary hover:bg-primary/5 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      <User size={20} className="text-text-light" />
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium text-xs truncate">{fbUser.displayName || fbUser.email}</p>
                        <p className="text-[10px] text-text-light/60">Ver perfil</p>
                      </div>
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                        <Shield size={18} /> Panel Admin
                      </Link>
                    )}
                    <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors">
                      <LogOut size={18} /> Cerrar sesión
                    </button>
                  </>
                ) : (
                  <button onClick={() => { signIn(); setMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-sm active:scale-90">
                    <LogIn size={18} /> Entrar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}