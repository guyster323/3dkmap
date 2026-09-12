// LibreSprite: open atlas, log size, save .ase copy.
app.open("C:/Users/windo/3KDmap/public/assets/eiketsu/tileset.png")
var sprite = app.activeSprite
if (!sprite) {
  console.log("no active sprite")
} else {
  console.log("sprite " + sprite.filename + " " + sprite.width + "x" + sprite.height)
  console.log("layers " + sprite.layerCount)
  sprite.saveAs("C:/Users/windo/3KDmap/public/assets/eiketsu/tileset.ase", true)
  console.log("saved tileset.ase")
}
