// Città supportate nella Fase 1
export type City = "Roma" | "Parigi" | "Londra";

// Modello POI
export type Poi = {
  id: string;
  title: string;
  city: City;
  category: string;        // es. "Monumenti", "Musei", "Parchi", "Food"
  description?: string;
  address?: string;
  lat: number;
  lng: number;
  image?: string;
};

// Stack principale
export type RootStackParamList = {
  Tabs: undefined;
  Login: undefined;

  // Dettaglio attrazione (accetta subset dei campi POI)
  AttractionDetails: Partial<Poi>;

  // Schermata Itinerario
  Itinerary: {
    city: City;
    pois: Poi[];
    startLat?: number;
    startLng?: number;
  };
};

// Tab per ospite (senza login)
export type GuestTabParamList = {
  Intro: undefined;
  Tours: undefined;
  Phrases: undefined;
  Privacy: undefined;
};

// Tab per utente autenticato
export type AuthedTabParamList = {
  Home: undefined;
  Tours: undefined;
  Phrases: undefined;
  Community: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
