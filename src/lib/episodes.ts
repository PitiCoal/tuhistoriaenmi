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
    image: "/images/episode-placeholder.png",
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
    image: "/images/episode-placeholder.png",
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
    image: "/images/episode-placeholder.png",
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
    image: "/images/episode-placeholder.png",
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
    image: "/images/episode-placeholder.png",
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
    image: "/images/episode-placeholder.png",
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
    image: "/images/episode-placeholder.png",
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
    image: "/images/episode-placeholder.png",
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
    image: "/images/episode-placeholder.png",
    links: {
      youtube: "https://youtube.com/@tuHistoria-EnMi",
      spotify: "https://open.spotify.com/show/5BVlJIWDq8hEBvluzLs5DO",
      apple: "https://podcasts.apple.com/cl/podcast/tu-historia-en-mi/id6785640275",
      amazon: "https://music.amazon.com/podcasts/cb65284d-587e-40dc-800f-736c4a89adc0/tu-historia-en-mi",
    },
    tags: ["vacío", "libertad", "sanación"],
  },
];

export function getEpisodeById(id: string): Episode | undefined {
  return episodes.find(e => e.id === id);
}

export function getEpisodesBySeason(season: number): Episode[] {
  return episodes.filter(e => e.season === season);
}

export function getLatestEpisode(): Episode | undefined {
  return episodes[episodes.length - 1];
}
