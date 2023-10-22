window.map = L.map('mapApp').setView([0, 0], 2);
const clearBtn = document.getElementById('clearBtn');
const toCsvBtn = document.getElementById('exportCsvBtn');
const shapefileInput = document.getElementById('shapefile-input');
const csvfileInput = document.getElementById('csvfile-input');
const colors = ["red", "blue", "green", "purple", "grey", "pink", "black", "white", 'brown']
var selectedElement;
var selectedFeature;
// Create a layer control
var baseLayers = {
  "Street Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map),
  // "Satellite Imagery": L.tileLayer('http://localhost:5500/maps/default/{z}/{x}/{y}', {}),
};

window.layerControl = L.control.layers(baseLayers, {}).addTo(map);

window.featureCollections = {}
window.featureCollectionLayers = {}

function onPopup(layer) {
  console.log('onPopup called')
  selectedFeature = layer.feature
  window.layer = layer
  let properties = layer.feature.properties;
  let content = '<div class="popup-container"><table class="table table-sm table-striped">';
  // content += `<thead>${layer.name}</thead>`
  for (let key in properties) {
    switch (key) {
      case 'color':
        colorSelect = colors.map(c => {
          if (c == properties[key]) {
            return `<option value='${c}' selected>${c}</option>`
          }
          return `<option value='${c}'>${c}</option>`
        })
        content += `<tr>
                        <td>${key}</td>
                        <td>
                            <select id="color" name="color"  onchange='colorChange(event, ${properties["ID"]})'>
                                ${colorSelect.join('')}
                            </select>
                        </td>
                    </tr>`;
        break;
      default:
        content += `<tr><td>${key}</td><td>${properties[key]}</td></tr>`;
    }
  }
  content += `<tr><td>lll</td><td>lll</td></tr>`;
  content += '</table></div>';
  return content;
};

function encapsulation(t) {
  return '"' + t + '"';
}

function colorChange(e, id) {
  newColor = e.target.value
  for (collectionName in featureCollections) {
    featureCollections[collectionName].find(v => (v.properties.ID == id)).properties.color = newColor
  }
  selectedElement.setAttribute('fill', newColor)
  selectedElement.setAttribute('stroke', newColor)
  selectedFeature.properties.color = newColor
}

function addLayer(features, baseName) {
  try {
    let name = baseName.split(" ").join('_')
    console.log("addLayer " + name)
    const featureCollection = {
      type: 'FeatureCollection',
      features: features
    }
    const featureCollectionLayer = L.geoJSON(turf.toWgs84(featureCollection), {
      style: function (feature) {
        return {
          color: feature.properties.color ? feature.properties.color : 'blue'
        };
      }
    }).addTo(map);
    featureCollectionLayer.on('click', function (e) {
      selectedElement = e.originalEvent.srcElement
      const popupContent = onPopup(e.layer)
      L.popup()
        .setLatLng(e.latlng) // Display the popup at the click location
        .setContent(popupContent)
        .openOn(map);
    });
    featureCollections[name] = features;
    featureCollectionLayers[name] = featureCollectionLayer;
    layerControl.addOverlay(featureCollectionLayer, name)
    const bbox = turf.bbox(turf.toWgs84(featureCollection));
    const bounds = L.latLngBounds(L.latLng(bbox[0], bbox[1]), L.latLng(bbox[2], bbox[3]));
    map.fitBounds(bounds);
  } catch (e) {
    console.error(e)
  }
}
clearBtn.addEventListener('click', (event) => {
  for (layer in featureCollectionLayers) {
    layerControl.removeLayer(featureCollectionLayers[layer.toString()])
    featureCollectionLayers[layer].remove()
  }
  featureCollectionLayers = {}
  map.setView([0, 0], 2)
  shapefileInput.value = ''
  csvfileInput.value = ''
})
toCsvBtn.addEventListener('click', (event) => {
  if (Object.keys(featureCollections).length == 0) {
    alert("no layer loaded")
    return
  } else {
    files = ''
    for (collectionName in featureCollections) {
      files += collectionName + " "
      collection = featureCollections[collectionName]
      header = ''
      window.sam = collection[0]
      for (p in sam.properties) {
        header += p + ','
      }
      header += 'bbox,Geotype,GeoData\n'

      res = ''
      for (i in collection) {
        sam = collection[i]
        line = ''
        props = ''
        try {
          line += encapsulation(sam.geometry.bbox.toString()) + "," +
            sam.geometry.type + "," + encapsulation(sam.geometry.coordinates.toString())
        } catch (e) {
          console.log(e)
        }
        for (key in sam.properties) {
          props += sam.properties[key] + ','
        }
        line = props + line;
        res += line + '\n';
      }

      const data = header + res;
      const blob = new Blob([data], {
        type: "text/plain"
      });
      const url = URL.createObjectURL(blob);
      window.link = document.createElement("a");
      link.href = url;
      link.download = collectionName + '.csv';
      link.click();
    }
    alert(files + " are exported")
  }
})
csvfileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const fileExtension = file.name.slice(-4);
    const reader = new FileReader(); // Create a new FileReader instance
    if (fileExtension == '.csv') {
      reader.readAsText(file);
      reader.onload = function (e) {
        console.log(`${file.name} loaded`)
        const fileContent = e.target.result;
        let data = Papa.parse(fileContent).data
        let header = data[0]
        let content = data.slice(1, -1)
        window.features = content.map(feature => {
          // if(feature.length != 1) {
          // console.log(feature)
          let bbox = feature[feature.length - 3].split(',')
          let type = feature[feature.length - 2]
          let pps = feature[feature.length - 1].split(',')
          let coordinates;
          if (type == 'Polygon') {
            coordinates = new Array()
            coordinates.push(new Array())
            while (pps.length) {
              let point = new Array();
              point.push(pps.shift())
              point.push(pps.shift())
              point.push(pps.shift())
              coordinates[0].push(point)
            }
          }
          let geometry = {
            bbox,
            type,
            coordinates
          }
          let properties = {}
          for (i in header.slice(0, -3)) {
            properties[header[i]] = feature[i]
          }
          // console.log(properties)
          return {
            type: "Feature",
            geometry,
            properties
          }
          // }                        
        })
        addLayer(features, file.name.slice(0, -4))
      };
    } else {
      alert("please only choose .csb files")
    }
  }
})

shapefileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader(); // Create a new FileReader instance

    const fileExtension = file.name.slice(-4);
    switch (fileExtension) {
      case ".shp":
        reader.readAsArrayBuffer(file);
        reader.onload = function (e) {
          console.log(`${file.name} loaded`)
          const fileContent = e.target.result;

          window.temp = shp.parseShp(fileContent) //.then(t => console.log(t))
          // if(temp.length == 1){
          // temp[1] = temp[0];
          // }
          window.features = temp.map(i => {
            return {
              type: "Feature",
              geometry: i,
              properties: {}
            }
          })
          addLayer(features, file.name.slice(0, -4))
        };
        break;
      case '.zip':
        reader.readAsArrayBuffer(file);
        reader.onload = function (e) {
          console.log(`${file.name} loaded`)
          const fileContent = e.target.result;
          shp.parseZip(fileContent).then(zip => {
            console.log('zip loaded')
            try {
              if (Array.isArray(zip)) {
                zip.forEach(featureCollection => {
                  addLayer(featureCollection.features, featureCollection.fileName.split('/').pop())
                });
              } else {
                addLayer(featureCollection.features, featureCollection.fileName.split('/').pop())
              }
            } catch (e) {
              console.error(e)
            }
          })
        };
        break;
      default:
        alert("please only choose .shp, .zip files")
    }
  }
});