extends SceneTree

func _init() -> void:
	var tileset_path := "C:/Users/windo/3KDmap/public/assets/eiketsu/tileset.png"
	var units_path := "C:/Users/windo/3KDmap/public/assets/eiketsu/units.png"
	var kao_path := "C:/Users/windo/3KDmap/public/assets/eiketsu/kao.png"
	_check(tileset_path, 16)
	_check(units_path, 32)
	_check(kao_path, 64)
	var img := Image.load_from_file(tileset_path)
	var tex := ImageTexture.create_from_image(img)
	var ts := TileSet.new()
	ts.tile_size = Vector2i(16, 16)
	var src := TileSetAtlasSource.new()
	src.texture = tex
	src.texture_region_size = Vector2i(16, 16)
	src.separation = Vector2i(0, 0)
	src.margins = Vector2i(0, 0)
	var cols := img.get_width() / 16
	var rows := img.get_height() / 16
	for y in range(rows):
		for x in range(cols):
			if not src.has_tile(Vector2i(x, y)):
				src.create_tile(Vector2i(x, y))
	ts.add_source(src)
	var err := ResourceSaver.save(ts, "C:/Users/windo/3KDmap/tools/godot-eiketsu/eiketsu_tileset.tres")
	print("tileset_resource ", err, " tiles=", cols, "x", rows)
	quit()

func _check(path: String, cell: int) -> void:
	var img := Image.load_from_file(path)
	if img == null:
		push_error("failed to load " + path)
		return
	print(path.get_file(), " ", img.get_width(), "x", img.get_height(), " cell=", cell, " cols=", img.get_width() / cell)
