export default function PlatformShowcase() {
  return (
    <div className="bg-card rounded-2xl p-6 border border-gray-200/70 shadow-md space-y-4">
      <p className="text-center text-sm font-medium text-text-light">
        Esc&uacute;chanos en tu plataforma favorita
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <a href="https://youtube.com/@tuHistoria-EnMi" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-yt text-white text-sm font-semibold hover:bg-yt/90 transition-colors shadow-sm">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg> YouTube
        </a>
        <a href="https://open.spotify.com/show/5BVlJIWDq8hEBvluzLs5DO" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-spotify text-white text-sm font-semibold hover:bg-spotify/90 transition-colors shadow-sm">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg> Spotify
        </a>
        <a href="https://podcasts.apple.com/cl/podcast/tu-historia-en-mi/id6785640275" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-apple text-white text-sm font-semibold hover:bg-apple/90 transition-colors shadow-sm">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
            <path d="M17.593 3.322c-2.529 3.13-2.922 7.103-1.21 10.555.593 1.195.551 1.305.725.608.312-1.257.468-4.483-.418-6.375-.714-1.531-1.893-2.775-2.942-3.763.792 1.165 1.32 2.33 1.485 3.466.503 3.484-.968 6.126-1.063 7.904-.17 3.16 1.287 5.895 1.983 6.637.528.562.446.484.281-.157-.28-1.088-1.029-4.077-.263-6.526.593-1.896 2.134-3.392 2.782-5.787.35-1.258.264-2.503-.28-3.562z"/>
          </svg> Apple Podcasts
        </a>
        <a href="https://music.amazon.com/podcasts/cb65284d-587e-40dc-800f-736c4a89adc0/tu-historia-en-mi" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amazon text-white text-sm font-semibold hover:bg-amazon/90 transition-colors shadow-sm">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
            <path d="M13.996 7.407c-1.626.822-3.355 1.319-4.574 1.319-.786 0-1.42-.182-1.42-.885 0-.594.568-1.045 1.544-1.045.703 0 1.544.238 2.56.714.988.468 1.89.703 1.89-.165 0-1.034-3.528-1.845-6.34-1.845-3.199 0-5.283 1.566-5.283 3.94 0 2.183 1.566 3.08 4.065 3.08 2.149 0 4.02-.686 6.212-1.85l.001.003c.113 1.238.445 1.8 1.508 2.345l.496.252s.187-1.095.023-2.462c-.166-1.367-.338-2.383-.248-3.157.09-.774.518-1.134 0-1.134-.293 0-.905.386-1.434.665z"/>
          </svg> Amazon Music
        </a>
      </div>
    </div>
  );
}
