import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export type WeatherMapMode = 'radar' | 'forecast';

type Props = {
  lat: number;
  lon: number;
  zoom?: number;
  mode?: WeatherMapMode;      // 'radar' | 'forecast'
  timeISO?: string | null;    // usato SOLO in forecast
};

/**
 * WeatherMap
 * - mode="radar": Leaflet + RainViewer (past + nowcast) con Play/Pause
 * - mode="forecast": Windy embed (overlay "rain") posizionato sull'ora indicata
 *
 * NOTE per Windy:
 *  - tolto "calendar=now" (può ignorare time)
 *  - passiamo sia "time=YYYY-MM-DDTHH:MM" sia "hour=HH" (alcune build leggono hour)
 *  - usiamo ORARIO LOCALE (niente utc=1)
 */
export default function WeatherMap({ lat, lon, zoom = 9, mode = 'forecast', timeISO }: Props) {
  // ---------------- RADAR (RainViewer) ----------------
  const radarHtml = useMemo(() => `<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  html,body,#map { height:100%; margin:0; padding:0; }
  .leaflet-control-attribution { font-size: 11px; }
  .toolbar {
    position:absolute; bottom:8px; left:8px; right:8px;
    display:flex; align-items:center; gap:8px;
    background: rgba(255,255,255,0.9); padding:6px 8px; border-radius:8px;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; font-size:12px;
  }
  .btn { background:#0A84FF; color:#fff; border:none; border-radius:6px; padding:6px 10px; font-weight:700; }
  .time { color:#111; min-width:140px }
</style>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
</head>
<body>
<div id="map"></div>
<div class="toolbar">
  <button id="play" class="btn">Play</button>
  <span id="time" class="time">—</span>
</div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  const map = L.map('map', { zoomControl: true }).setView([${lat}, ${lon}], ${zoom});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18, attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  let frames = []; // {time, layer}
  let idx = 0, playing = false;
  const timeEl = document.getElementById('time');
  const btn = document.getElementById('play');

  function render(i){
    frames.forEach(f => { if (f.layer) map.removeLayer(f.layer); });
    const f = frames[i]; if(!f) return;
    const url = 'https://tilecache.rainviewer.com/v2/radar/' + f.time + '/256/{z}/{x}/{y}/2/1_1.png';
    f.layer = L.tileLayer(url,{opacity:0.6}); f.layer.addTo(map);
    timeEl.textContent = new Date(f.time*1000).toLocaleString();
  }
  function tick(){ if(!playing) return; idx = (idx+1)%frames.length; render(idx); setTimeout(tick, 800); }
  btn.onclick = ()=>{ playing=!playing; btn.textContent = playing?'Pause':'Play'; if(playing) tick(); };

  fetch('https://api.rainviewer.com/public/weather-maps.json')
    .then(r=>r.json())
    .then(j=>{
      const past = (j.radar && j.radar.past) ? j.radar.past.slice(-6) : [];
      const nowc = (j.radar && j.radar.nowcast) ? j.radar.nowcast.slice(0,6) : [];
      frames = past.concat(nowc);
      if(!frames.length) return;
      idx = Math.max(0, frames.length-1);
      render(idx);
    })
    .catch(()=>{ /* no-op */ });
</script>
</body>
</html>`, [lat, lon, zoom]);

  // ---------------- FORECAST (Windy) ----------------
  const timeParam = useMemo(() => {
    if (!timeISO) return { time: '', hour: '' };
    const d = new Date(timeISO); // usiamo i campi locali
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    const hh   = String(d.getHours()).padStart(2, '0');
    const mi   = '00';
    return {
      time: `&time=${yyyy}-${mm}-${dd}T${hh}:${mi}`,
      hour: `&hour=${hh}`
    };
  }, [timeISO]);

  const forecastHtml = useMemo(() => `<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  html,body,.wrap{height:100%;margin:0;padding:0;}
  iframe{border:0;width:100%;height:100%;}
</style>
</head>
<body>
<div class="wrap">
  <iframe
    src="https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&zoom=${zoom}&level=surface&overlay=rain&product=ecmwf&menu=false&message=false&marker=true&pressure=true&type=map&location=coordinates&detail=true&metricWind=km%2Fh&metricTemp=%C2%B0C${timeParam.time}${timeParam.hour}"
    loading="lazy"
    allowfullscreen
    referrerpolicy="no-referrer"
  ></iframe>
</div>
</body>
</html>`, [lat, lon, zoom, timeParam]);

  const html = mode === 'radar' ? radarHtml : forecastHtml;

  return (
    <View style={styles.wrap}>
      <WebView originWhitelist={['*']} source={{ html }} javaScriptEnabled domStorageEnabled />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 460, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' }
});
