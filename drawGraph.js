// les librairies
// pour les échelles:
const d3 = require('d3')
// pour écrire le fichier:
const fs = require('fs')

// charger le fichier JSON créé avec "node run.js"
const data = require('./dixPremiersArtistes.json')

// configuration du graphique
const WIDTH = 500
const HEIGHT = 500
const BAR_SPACE = HEIGHT / data.length
const BAR_HEIGHT = BAR_SPACE * 0.7
const BAR_COLOR = 'steelblue'
const NAME_MARGIN_LEFT = WIDTH / 50
const NAME_COLOR = 'white'
const SUM_MARGIN_RIGHT = WIDTH / 50
const SUM_COLOR = 'white'

// l'échelle pour retourner une valeur en fonction du nombre de chansons
const scale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.sum)])
  .range([0, WIDTH])

// dessiner un bâton
const drawBar = (sum, index) =>
  `<rect
    y="${index * BAR_SPACE}"
    height="${BAR_HEIGHT}"
    width="${scale(sum)}" 
    fill="${BAR_COLOR}"/>`

// dessiner tous les bâtons
const drawBars = data =>
  data
    // pour chaque élément de la liste nous passons la clé "sum" et l'index à "drawBar"
    .map((d, i) => drawBar(d.sum, i))
    // "drawBar" retourne une chaîne de charactères que nous joignons avec "\n" (à la ligne)
    .join('\n')

// écrire le nom d'un artiste sur le bâton
const writeArtistName = (name, index) =>
  `<text
    x="${NAME_MARGIN_LEFT}"
    y="${index * BAR_SPACE + BAR_HEIGHT * 0.7}"
    fill="${NAME_COLOR}">
    ${name.toUpperCase()}
  </text>`

// écrire tous les noms d'artistes
const writeNames = data =>
  data
    .map((d, i) => writeArtistName(d.artist, i))
    .join('\n')

// écrire le nombre de chansons
const writeNumberOfSongs = (sum, index) =>
  `<text
    x="${scale(sum) - SUM_MARGIN_RIGHT}"
    y="${index * BAR_SPACE + BAR_HEIGHT * 0.7}"
    fill="${SUM_COLOR}"
    text-anchor="end">
    ${sum}
    </text>`

// écrire le nombre de chansons sur tous les bâtons
const writeNumbersOfSongs = data =>
  data
    .map((d, i) => writeNumberOfSongs(d.sum, i))
    .join('\n')

// pour créer un fichier SVG
// nous ajoutons l'attribut "xmlns" pour dire quel dialecte XML nous utilisons
// et une viewBox pour définir le système de coordonnées
// puis nous appelons les fonctions créées plus haut pour ajouter les éléments
const svg = data => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    ${drawBars(data)}
    ${writeNames(data)}
    ${writeNumbersOfSongs(data)}
  </svg>
`

// écrire le fichier "graph.svg"
fs.writeFileSync('graph.svg', svg(data), 'utf-8')