import { Poi } from "../navigation/types";

export const POI: Record<"Roma" | "Parigi" | "Londra", Record<string, Poi[]>> = {
  Roma: {
    Monumenti: [
      { id: "colosseo", title: "Colosseo", city: "Roma", category: "Monumenti", lat: 41.8902, lng: 12.4922, address: "Piazza del Colosseo", description: "Anfiteatro Flavio, simbolo di Roma." },
      { id: "foro", title: "Foro Romano", city: "Roma", category: "Monumenti", lat: 41.8925, lng: 12.4853, address: "Via della Salara Vecchia", description: "Centro della vita politica dell'antica Roma." },
    ],
    Musei: [
      { id: "vaticani", title: "Musei Vaticani", city: "Roma", category: "Musei", lat: 41.9065, lng: 12.4536, address: "Viale Vaticano", description: "Collezioni d’arte e Cappella Sistina." },
    ],
    Parchi: [
      { id: "borghese", title: "Villa Borghese", city: "Roma", category: "Parchi", lat: 41.9142, lng: 12.4922, address: "Ingresso da P.zza del Popolo" },
    ],
    Food: [
      { id: "trastevere", title: "Trastevere (food area)", city: "Roma", category: "Food", lat: 41.8894, lng: 12.4708, address: "Rione Trastevere" },
    ],
  },
  Parigi: {
    Monumenti: [
      { id: "tour-eiffel", title: "Torre Eiffel", city: "Parigi", category: "Monumenti", lat: 48.8584, lng: 2.2945, address: "Champ de Mars", description: "Icona di Parigi." },
      { id: "notre-dame", title: "Notre-Dame", city: "Parigi", category: "Monumenti", lat: 48.853, lng: 2.3499, address: "Île de la Cité" },
    ],
    Musei: [
      { id: "louvre", title: "Louvre", city: "Parigi", category: "Musei", lat: 48.8606, lng: 2.3376, address: "Rue de Rivoli" },
    ],
    Parchi: [
      { id: "tuileries", title: "Giardini delle Tuileries", city: "Parigi", category: "Parchi", lat: 48.8635, lng: 2.327 },
    ],
    Food: [
      { id: "le-marais", title: "Le Marais (food area)", city: "Parigi", category: "Food", lat: 48.8579, lng: 2.3626 },
    ],
  },
  Londra: {
    Monumenti: [
      { id: "big-ben", title: "Big Ben", city: "Londra", category: "Monumenti", lat: 51.5007, lng: -0.1246, address: "Westminster" },
      { id: "tower-bridge", title: "Tower Bridge", city: "Londra", category: "Monumenti", lat: 51.5055, lng: -0.0754 },
    ],
    Musei: [
      { id: "british", title: "British Museum", city: "Londra", category: "Musei", lat: 51.5194, lng: -0.127 },
    ],
    Parchi: [
      { id: "hyde", title: "Hyde Park", city: "Londra", category: "Parchi", lat: 51.5073, lng: -0.1657 },
    ],
    Food: [
      { id: "borough", title: "Borough Market", city: "Londra", category: "Food", lat: 51.5055, lng: -0.091 },
    ],
  },
};
