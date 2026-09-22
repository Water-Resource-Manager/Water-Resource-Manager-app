import fs from 'fs';
import https from 'https';

// API Hub'Eau : Qualité des nappes (Stations)
// On filtre sur les stations ayant des données récentes (ex: depuis 2010) pour éviter les forages abandonnés au 20ème siècle
const API_URL = 'https://hubeau.eaufrance.fr/api/v1/qualite_nappes/stations?format=json&size=20000&date_recherche_min=2010-01-01';
const OUTPUT_FILE = './public/stations-qualite.json';

console.log('⏳ Téléchargement des stations de qualité des eaux souterraines (actives depuis 2010)...');

https.get(API_URL, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Format de réponse inattendu');
      }

      console.log(`✅ ${response.data.length} stations récupérées.`);

      // Nettoyage et formatage léger (GeoJSON-like ou JSON plat optimisé)
      const features = response.data
        .filter(station => station.geometry && station.geometry.coordinates)
        .map(station => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: station.geometry.coordinates // [longitude, latitude]
          },
          properties: {
            id: station.bss_id,
            nom: station.nom_commune || 'Inconnu',
            code_commune: station.code_commune,
            departement: station.nom_departement,
            profondeur: station.profondeur_investigation,
            actif: true // A affiner selon les dates de fin de mesure
          }
        }));

      const geojson = {
        type: 'FeatureCollection',
        features: features
      };

      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(geojson));
      console.log(`💾 Fichier sauvegardé : ${OUTPUT_FILE} (${features.length} points valides)`);
      
    } catch (e) {
      console.error('❌ Erreur lors du parsing JSON :', e.message);
    }
  });
}).on('error', (err) => {
  console.error('❌ Erreur de requête :', err.message);
});