export type CityKey = 'rome' | 'paris' | 'london';

export const CITIES: Record<CityKey, { label: string; lat: number; lon: number }> = {
  rome:   { label: 'Roma',   lat: 41.9028, lon: 12.4964 },
  paris:  { label: 'Parigi', lat: 48.8566, lon:   2.3522 },
  london: { label: 'Londra', lat: 51.5072, lon:  -0.1276 },
};

export type POI = {
  id: string;
  city: CityKey;
  name: string;
  category: 'museo'|'monumento'|'parco'|'mercato'|'quartiere'|'arte'|'chiesa';
  indoor: boolean;
  hours?: string;
  price?: number; // € indicativi
  tags?: string[];
};

export const POIS: POI[] = [
  // ROMA
  { id:'rm-colosseo', city:'rome', name:'Colosseo', category:'monumento', indoor:false, hours:'08:30–19:00', price:16, tags:['storico','icona'] },
  { id:'rm-foro', city:'rome', name:'Foro Romano', category:'monumento', indoor:false, hours:'09:00–19:00', price:12, tags:['storico','rovine'] },
  { id:'rm-vaticani', city:'rome', name:'Musei Vaticani', category:'museo', indoor:true, hours:'09:00–18:00', price:17, tags:['arte','museo'] },
  { id:'rm-pantheon', city:'rome', name:'Pantheon', category:'chiesa', indoor:true, hours:'09:00–19:00', price:0, tags:['architettura'] },
  { id:'rm-villa-borghese', city:'rome', name:'Villa Borghese', category:'parco', indoor:false, hours:'Sempre aperto', price:0, tags:['verde','relax'] },
  { id:'rm-galleria-borghese', city:'rome', name:'Galleria Borghese', category:'museo', indoor:true, hours:'09:00–19:00', price:15, tags:['arte'] },

  // PARIGI
  { id:'pa-louvre', city:'paris', name:'Louvre', category:'museo', indoor:true, hours:'09:00–18:00', price:17, tags:['arte','icona'] },
  { id:'pa-orsay', city:'paris', name:'Musée d’Orsay', category:'museo', indoor:true, hours:'09:30–18:00', price:16, tags:['impressionismo'] },
  { id:'pa-eiffel', city:'paris', name:'Torre Eiffel', category:'monumento', indoor:false, hours:'09:30–23:45', price:26, tags:['icona','vista'] },
  { id:'pa-tuileries', city:'paris', name:'Giardini Tuileries', category:'parco', indoor:false, hours:'07:00–21:00', price:0, tags:['verde'] },
  { id:'pa-notre-dame', city:'paris', name:'Notre-Dame (esterni)', category:'chiesa', indoor:false, hours:'—', price:0, tags:['gotico'] },
  { id:'pa-pompidou', city:'paris', name:'Centre Pompidou', category:'museo', indoor:true, hours:'11:00–21:00', price:15, tags:['moderno'] },

  // LONDRA
  { id:'ld-british', city:'london', name:'British Museum', category:'museo', indoor:true, hours:'10:00–17:30', price:0, tags:['storia','museo'] },
  { id:'ld-tower', city:'london', name:'Tower of London', category:'monumento', indoor:false, hours:'09:00–17:30', price:29, tags:['corona','storia'] },
  { id:'ld-nhm', city:'london', name:'Natural History Museum', category:'museo', indoor:true, hours:'10:00–17:50', price:0, tags:['famiglie'] },
  { id:'ld-hyde', city:'london', name:'Hyde Park', category:'parco', indoor:false, hours:'05:00–24:00', price:0, tags:['verde','relax'] },
  { id:'ld-tate', city:'london', name:'Tate Modern', category:'museo', indoor:true, hours:'10:00–18:00', price:0, tags:['moderno'] },
  { id:'ld-westminster', city:'london', name:'Abbazia di Westminster', category:'chiesa', indoor:true, hours:'09:30–15:30', price:29, tags:['gotico'] },
];
