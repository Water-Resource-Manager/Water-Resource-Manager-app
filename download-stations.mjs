import fs from 'fs';

const HUBEAU_STATIONS_URL = "https://hubeau.eaufrance.fr/api/v1/niveaux_nappes/stations?format=geojson&size=20000";

async function downloadAll() {
  console.log("⏳ Début du téléchargement de toutes les stations Hub'Eau...");
  let allFeatures = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    console.log(`📥 Téléchargement de la page ${page}...`);
    const response = await fetch(`${HUBEAU_STATIONS_URL}&page=${page}`);
    const data = await response.json();
    const features = data.features || [];
    
    allFeatures = [...allFeatures, ...features];

    if (features.length < 20000) {
      hasMore = false;
    } else {
      page++;
    }
  }

  const geojson = {
    type: "FeatureCollection",
    features: allFeatures,
  };

  // Création du dossier public s'il n'existe pas
  if (!fs.existsSync('./public')) fs.mkdirSync('./public');
  
  // Sauvegarde dans un fichier local statique
  fs.writeFileSync('./public/stations.json', JSON.stringify(geojson));
  console.log(`✅ Succès ! ${allFeatures.length} stations enregistrées dans public/stations.json`);
}

downloadAll();