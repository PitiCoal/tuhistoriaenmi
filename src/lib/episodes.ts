export type Episode = {
  id: string;
  season: number;
  episode: number;
  title: string;
  guest: string;
  description: string;
  image: string;
  links: {
    youtube?: string;
    spotify?: string;
    apple?: string;
    amazon?: string;
  };
  tags: string[];
};

export const episodes: Episode[] = [
  {
    id: "t1e1",
    season: 1,
    episode: 1,
    title: "No Comprendo",
    guest: "Flo Ramírez",
    description: "Flo nos comparte su historia de fe y preguntas sin respuesta. Un testimonio honesto sobre aprender a confiar cuando no entendemos.",
    image: "/images/episodios/t1e1.png",
    links: {
      youtube: "https://youtube.com/@tuHistoria-EnMi",
      spotify: "https://open.spotify.com/show/5BVlJIWDq8hEBvluzLs5DO",
      apple: "https://podcasts.apple.com/cl/podcast/tu-historia-en-mi/id6785640275",
      amazon: "https://music.amazon.com/podcasts/cb65284d-587e-40dc-800f-736c4a89adc0/tu-historia-en-mi",
    },
    tags: ["fe", "preguntas", "confianza"],
  },
  {
    id: "t1e2",
    season: 1,
    episode: 2,
    title: "Cuando aceptar no es resignación ni rendirse",
    guest: "Piedad Alcalde",
    description: "Piedad nos habla sobre la diferencia entre aceptar lo que viene y rendirse ante las dificultades. Una reflexión profunda sobre la fortaleza interior.",
    image: "/images/episodios/t1e2.jpg",
    links: {
      youtube: "https://youtube.com/@tuHistoria-EnMi",
      spotify: "https://open.spotify.com/show/5BVlJIWDq8hEBvluzLs5DO",
      apple: "https://podcasts.apple.com/cl/podcast/tu-historia-en-mi/id6785640275",
      amazon: "https://music.amazon.com/podcasts/cb65284d-587e-40dc-800f-736c4a89adc0/tu-historia-en-mi",
    },
    tags: ["aceptación", "resiliencia", "fortaleza"],
  },
  {
    id: "t1e3",
    season: 1,
    episode: 3,
    title: "Ver con el Corazón",
    guest: "Rosario Rivera",
    description: "Rosario nos invita a mirar más allá de lo visible. Un testimonio sobre encontrar belleza y propósito donde otros solo ven dificultad.",
    image: "/images/episodios/t1e3.jpg",
    links: {
      youtube: "https://youtube.com/@tuHistoria-EnMi",
      spotify: "https://open.spotify.com/show/5BVlJIWDq8hEBvluzLs5DO",
      apple: "https://podcasts.apple.com/cl/podcast/tu-historia-en-mi/id6785640275",
      amazon: "https://music.amazon.com/podcasts/cb65284d-587e-40dc-800f-736c4a89adc0/tu-historia-en-mi",
    },
    tags: ["corazón", "perspectiva", "esperanza"],
  },
  {
    id: "t1e4",
    season: 1,
    episode: 4,
    title: "Un Punto seguido en mi historia",
    guest: "Berni Daniels",
    description: "Berni nos recuerda que cada historia tiene un punto seguido, no un punto final. Un mensaje de esperanza para quienes creen que todo terminó.",
    image: "/images/episodios/t1e4.jpg",
    links: {
      youtube: "https://youtube.com/@tuHistoria-EnMi",
      spotify: "https://open.spotify.com/show/5BVlJIWDq8hEBvluzLs5DO",
      apple: "https://podcasts.apple.com/cl/podcast/tu-historia-en-mi/id6785640275",
      amazon: "https://music.amazon.com/podcasts/cb65284d-587e-40dc-800f-736c4a89adc0/tu-historia-en-mi",
    },
    tags: ["esperanza", "nuevo comienzo", "fe"],
  },
  {
    id: "t1e5",
    season: 1,
    episode: 5,
    title: "Kilómetros de Historia",
    guest: "Santiago Cruzat",
    description: "Santiago nos lleva por un viaje de kilómetros recorridos y lecciones aprendidas. Un testimonio sobre el camino y lo que encontramos en él.",
    image: "/images/episodios/t1e5.jpg",
    links: {
      youtube: "https://youtube.com/@tuHistoria-EnMi",
      spotify: "https://open.spotify.com/show/5BVlJIWDq8hEBvluzLs5DO",
      apple: "https://podcasts.apple.com/cl/podcast/tu-historia-en-mi/id6785640275",
      amazon: "https://music.amazon.com/podcasts/cb65284d-587e-40dc-800f-736c4a89adc0/tu-historia-en-mi",
    },
    tags: ["camino", "viaje", "aprendizaje"],
  },
  {
    id: "t1e6",
    season: 1,
    episode: 6,
    title: "Historia del Corazón de Rodrigo",
    guest: "Rodrigo Bello",
    description: "Rodrigo abre su corazón y comparte su historia de superación. Un relato de cómo el amor y la fe pueden transformar una vida.",
    image: "/images/episodios/t1e6.jpg",
    links: {
      youtube: "https://youtube.com/@tuHistoria-EnMi",
      spotify: "https://open.spotify.com/show/5BVlJIWDq8hEBvluzLs5DO",
      apple: "https://podcasts.apple.com/cl/podcast/tu-historia-en-mi/id6785640275",
      amazon: "https://music.amazon.com/podcasts/cb65284d-587e-40dc-800f-736c4a89adc0/tu-historia-en-mi",
    },
    tags: ["corazón", "superación", "transformación"],
  },
  {
    id: "t2e7",
    season: 2,
    episode: 7,
    title: "Aunque no tengas Fe",
    guest: "Xime Vallejos",
    description: "Xime nos habla de la fe en medio de la duda. Un testimonio para quienes no tienen todas las respuestas pero siguen buscando.",
    image: "/images/episodios/t2e7.png",
    links: {
      youtube: "https://youtube.com/@tuHistoria-EnMi",
      spotify: "https://open.spotify.com/show/5BVlJIWDq8hEBvluzLs5DO",
      apple: "https://podcasts.apple.com/cl/podcast/tu-historia-en-mi/id6785640275",
      amazon: "https://music.amazon.com/podcasts/cb65284d-587e-40dc-800f-736c4a89adc0/tu-historia-en-mi",
    },
    tags: ["fe", "duda", "búsqueda"],
  },
  {
    id: "t2e8",
    season: 2,
    episode: 8,
    title: "Del abandono al propósito",
    guest: "Kristian Brione",
    description: "Kristian comparte cómo pasó del abandono a encontrar su propósito. Un testimonio de redención y de cómo Dios escribe recto sobre líneas torcidas.",
    image: "/images/episodios/t2e8.png",
    links: {
      youtube: "https://youtube.com/@tuHistoria-EnMi",
      spotify: "https://open.spotify.com/show/5BVlJIWDq8hEBvluzLs5DO",
      apple: "https://podcasts.apple.com/cl/podcast/tu-historia-en-mi/id6785640275",
      amazon: "https://music.amazon.com/podcasts/cb65284d-587e-40dc-800f-736c4a89adc0/tu-historia-en-mi",
    },
    tags: ["abandono", "propósito", "redención"],
  },
  {
    id: "t2e9",
    season: 2,
    episode: 9,
    title: "Del vacío a la libertad",
    guest: "Benja Ramírez",
    description: "Benja nos cuenta cómo encontró libertad donde solo había vacío. Un testimonio poderoso sobre soltar el pasado y abrazar una nueva vida.",
    image: "/images/episodios/t2e9.jpg",
    links: {
      youtube: "https://youtube.com/@tuHistoria-EnMi",
      spotify: "https://open.spotify.com/show/5BVlJIWDq8hEBvluzLs5DO",
      apple: "https://podcasts.apple.com/cl/podcast/tu-historia-en-mi/id6785640275",
      amazon: "https://music.amazon.com/podcasts/cb65284d-587e-40dc-800f-736c4a89adc0/tu-historia-en-mi",
    },
    tags: ["vacío", "libertad", "sanación"],
  },
];

const STORAGE_KEY = 'tm_episodes_admin';

type AdminEpisode = {
  id: string;
  season: number;
  episode: number;
  title: string;
  guest: string;
  description: string;
  image: string;
  youtube: string;
  spotify: string;
  apple: string;
  amazon: string;
};

function loadAdminEpisodes(): Episode[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const adminEpisodes: AdminEpisode[] = JSON.parse(data);
    return adminEpisodes.map(e => ({
      id: e.id,
      season: e.season,
      episode: e.episode,
      title: e.title,
      guest: e.guest,
      description: e.description,
      image: e.image || '/images/episode-placeholder.png',
      links: {
        youtube: e.youtube || undefined,
        spotify: e.spotify || undefined,
        apple: e.apple || undefined,
        amazon: e.amazon || undefined,
      },
      tags: [],
    }));
  } catch { return []; }
}

export function getAllEpisodes(): Episode[] {
  const admin = loadAdminEpisodes();
  const all = [...episodes];
  for (const ae of admin) {
    const idx = all.findIndex(e => e.id === ae.id);
    if (idx >= 0) all[idx] = ae;
    else all.push(ae);
  }
  return all;
}

export function getEpisodeById(id: string): Episode | undefined {
  return getAllEpisodes().find(e => e.id === id);
}

export function getEpisodesBySeason(season: number): Episode[] {
  return getAllEpisodes().filter(e => e.season === season);
}

export function getLatestEpisode(): Episode | undefined {
  const all = getAllEpisodes();
  return all[all.length - 1];
}
