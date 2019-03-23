// les librairies externes

// pour téléchrager des fichiers en ligne:
const fetch = require('node-fetch')
// pour la fonction csvParse qui transforme le csv en json:
const d3 = require('d3')
// pour transformer les données en json:
const R = require('ramda')
// pour la fonction writeFile qui crée un fichier:
const fs = require('fs')


// l'url où nous allons chercher les données:
const URL = 'https://raw.githubusercontent.com/walkerkq/musiclyrics/master/billboard_lyrics_1964-2015.csv'

// les fonctions que nous allons utiliser


// trouver les noms d'artistes
const getArtists = songs => {
  // ici "songs" est une liste d'objets avec entre autres les clés "Artist" et "Song"
  const artists = songs.map(R.prop('Artist'))
  // "songs.map(d => d.Artist)" fait la même chose

  // la liste "artists" contient tous les artistes
  // certains y seront présents plusieurs fois
  // la fonction "uniq" de ramda prends une liste et retourne les éléments uniques
  return R.uniq(artists)
}

// trouver toutes les chansons pour un artiste
const getSongsByArtist = (songs, artist) => {
  // "songs" est toujours une liste d'objets
  // "artist" est le nom de l'artiste pour lequel nous souhaitons avoir toutes les chansons

  return songs
    .filter(d => R.prop('Artist', d) === artist)
    // prends toutes les entrées de "songs" où la clé "Artist" correspond à celui que nous cherchons
    // ".filter(d => d.Artist === artist)" fait la même chose
    .map(R.prop('Song'))
    // retourne une liste de chansons
    // ".map(d => d.Song)" marche aussi
}

// la fonction que nous allons appliquer à la liste de chansons
const formatData = songs => {
  // utilisons la fonction créée plus haut pour avoir la liste d'artistes
  const artists = getArtists(songs)
  // pour chaque artiste, récupérons toutes ses chansons avec "getSongsByArtist"
  return artists
    .map(artist => ({
      // artist est un élément de la liste "artistes", un nom d'artiste
      artist,
      // songs est une liste de chansons pour cet artiste
      songs: getSongsByArtist(songs, artist),
    }))
    // compter le nombre de chansons par artiste
    .map(d => ({ ...d, sum: d.songs.length }))
    // ici "d" représente un objet { artist: 'x', songs:['x', 'y', 'z'] }
    // "...d" copie l'objet
    // nous ajoutons une clé "sum" qui correspond au nombre de chansons
    .sort((a, b) => a.sum > b.sum ? -1 : 1)
    // pour ordonner les artistes par le nombre de chansons
    .filter((d, i) => i < 10)
    // pour ne prendre que les dix premiers

}

// pour écrire un fichier "dixPremiersArtistes.json"
const saveJSON = data => {
  // data est la liste d'objets créés avec "formatData"
  fs.writeFile(
    'dixPremiersArtistes.json', // le nom du fichier
    JSON.stringify(data, null, 2), // les données transformées en chaîne de charactères
    'utf-8', // l'encodage du fichier
    err => err ? console.log(err) : console.log('Saved dixPremiersArtistes.json')
    // cette fonction est appelée quand le fichier a été sauvé
    // ou si une erreur est survenue
    // elle prends un argument "err" qui est l'erreur s'il y en a une ou "null"
    // si "err" existe, nous écrivons l'erreur dans la console
    // sinon nous disons que le fichier a été sauvé
  )
}

// le script final

// fetch va chercher le fichier
fetch(URL)
  // lire le fichier comme un texte
  .then(res => res.text())
  // transformer le csv en json
  .then(d3.csvParse)
  // formatter les données avec "formatData" créé plus haut
  .then(formatData)
  // sauver le fichier
  .then(saveJSON)
  // si une erreur survient, l'écrire dans la console
  .catch(console.log)