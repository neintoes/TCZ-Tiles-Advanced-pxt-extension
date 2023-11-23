/**
* Adds additional tilemap functionality
*/
//% weight=0 color=#13a89e icon="\uf041" block="Tiles Advanced"
//% advanced=false
//% groups="['Getting Tiles', 'Tilemap Population', 'Tile Comparisons', 'Tile Animation', 'Pathfinding']"

namespace tilesAdvanced {
    /**
     * Returns a list of tiles in a plus sign within a tile in a given range
     */
    //% blockId=getAdjacentTiles
    //% block="get tiles near to $tile within $distance"
    //% tile.shadow=mapgettile
    //% group="Getting Tiles"
    //% weight=100
    export function getAdjacentTiles(tile: tiles.Location, distance: number): tiles.Location[] {
        let i: number;
        let col = tile.col;
        let row = tile.row;
        let adjacent_tiles = [tile];

        for (i = 0; i < distance; i++) {
            adjacent_tiles.push(tiles.getTileLocation(col - i, row))
        }
        for (i = 0; i < distance; i++) {
            adjacent_tiles.push(tiles.getTileLocation(col + i, row))
        }
        for (i = 0; i < distance; i++) {
            adjacent_tiles.push(tiles.getTileLocation(col, row - i))
        }
        for (i = 0; i < distance; i++) {
            adjacent_tiles.push(tiles.getTileLocation(col, row + i))
        }
        return adjacent_tiles
    }

    /**
     * Returns true if the given tiles are the same tile
     */
    //% blockId=tileIsTile
    //% block="$tile is $otherTile"
    //% tile.shadow=mapgettile
    //% otherTile.shadow=mapgettile
    //% group="Tile Comparisons"
    //% weight=100
    export function tileIsTile(tile: tiles.Location, otherTile: tiles.Location): boolean {
        if (tile.col == otherTile.col && tile.row == otherTile.row) {
            return true
        }
        return false
    }

    /**
     * Returns true if the given tile is in the list of tiles provided
     */
    //% blockId=tileIsInList
    //% block="$tile is in $tileList=variables_get(list)"
    //% tile.shadow=mapgettile
    //% group="Tile Comparisons"
    //% weight=3
    export function tileIsInList(tile: tiles.Location, tileList: tiles.Location[]): boolean {
        for (let tileInList of tileList) {
            if (tileIsTile(tile, tileInList)) {
                return true
            }
        }
        return false
    }

    /**
     * Sets the wall on or off for all tiles of a given type
     */
    //% blockId=setWallOnTilesOfType
    //% block="set walls $makeWall on tiles of type $tile"
    //% tile.shadow=tileset_tile_picker
    //% tile.decompileIndirectFixedInstances=true
    //% group="Tilemap Population"
    //% weight=4
    export function setWallOnTilesOfType(tile: Image, makeWall: boolean) {
        for (let tileOfType of tiles.getTilesByType(tile)) {
            tiles.setWallAt(tileOfType, makeWall)
        }
    }

    /**
     * All tiles of the same design have their image swapped for a given design
     */
    //% blockId=swapAllTiles
    //% block="swap tiles $from to $to"
    //% from.shadow=tileset_tile_picker
    //% from.decompileIndirectFixedInstances=true
    //% to.shadow=tileset_tile_picker
    //% to.decompileIndirectFixedInstances=true
    //% group="Tilemap Population"
    //% weight=5
    export function swapAllTiles(from: Image, to: Image) {
        for (let tileOfType of tiles.getTilesByType(from)) {
            tiles.setTileAt(tileOfType, to)
        }
    }

    /**
     * Returns a list of all the tiles that are a wall
     */
    //% blockId = getAllWallTiles
    //% block="array of all wall tiles"
    //% group="Getting Tiles"
    //% weight=6
    export function getAllWallTiles(): tiles.Location[]{
        let width = game.currentScene().tileMap.data.width - 1;
        let height = game.currentScene().tileMap.data.height - 1;
        let walls = [];
        for (let w = 0; w < width; w++){
            for (let h = 0; h < height; h++){
                let tile = tiles.getTileLocation(w, h);
                if (tiles.tileAtLocationIsWall(tile)){
                    walls.push(tile);
                }
            }
        }
        return walls;
    }

    /**
     * Returns the width of the tilemap in use
     */
    //% blockId = getTilemapWidth
    //% block="get tilemap width"
    //% group="Getting Tiles"
    //% weight=7
    export function getTilemapWidth(): number {
        return game.currentScene().tileMap.data.width;
    }

    /**
     * Returns the height of the tilemap in use
     */
    //% blockId = getTilemapHeight
    //% block="get tilemap height"
    //% group="Getting Tiles"
    //% weight=8
    export function getTilemapHeight(): number {
        return game.currentScene().tileMap.data.height;
    }

    /**
     * Animates all tiles of the given type with the animation passed in on the interval given
     */
    //% blockId=animateTileOfTypeWith
    //% block="animate $tile with $animation every $frameLength"
    //% tile.shadow=tileset_tile_picker
    //% tile.decompileIndirectFixedInstances=true
    //% group="Tile Animation"
    //% weight=6
    export function animateTileOfTypeWith(tile: Image, animation: Image[], frameLenght: number) {
        let frame = 0
        let tilesToAnimate = tiles.getTilesByType(tile)
        game.onUpdateInterval(frameLenght, function animateTiles() {
            for (let tileOfType of tilesToAnimate) {
                tiles.setTileAt(tileOfType, animation[frame])
            }
            frame += 1
            if (frame == animation.length - 1) {
                frame = 0
            }
        })
    }

    /**
     * Returns true if one sprite can see another without a wall in the way
     */
    //% blockId=checkLineOfSight
    //% block="can %sprite=variables_get(myEnemy) see %target=variables_get(mySprite)"
    //% group="Pathfinding"
    //% weight=8
    export function checkLineOfSight(lookingSprite: Sprite, target: Sprite): boolean {
        let xDif = target.x - lookingSprite.x
        let yDif = target.y - lookingSprite.y
        let distance = Math.sqrt(xDif ** 2 + yDif ** 2) // inventing triangles 
        let xIncrement = xDif / 25
        let yIncrement = yDif / 25
        for (let i = 0; i < 25; i++) {
            let x = lookingSprite.x + i * xIncrement
            let y = lookingSprite.y + i * yIncrement
            let col = Math.floor(x / 16)
            let row = Math.floor(y / 16)
            if (tiles.tileAtLocationIsWall(tiles.getTileLocation(col, row))) {
                return false
            }
        }
        return true
    }

    /**
     * Makes this sprite follow the target sprite using pathfinding
     */
    //% blockId=followUsingPathfinding
    //% block="set %sprite=variables_get(myEnemy) follow %target=variables_get(mySprite) || with speed %speed"
    //% group="Pathfinding"
    //% weight=7
    export function followUsingPathfinding(sprite: Sprite, target: Sprite, speed = 100) {
        let myStart = sprite.tilemapLocation();
        let path = scene.aStar(myStart, target.tilemapLocation());
        scene.followPath(sprite, path, speed);
        game.onUpdate(function tick() {
            if (!tileIsTile(sprite.tilemapLocation(), myStart)) {
                myStart = sprite.tilemapLocation();
                path = scene.aStar(myStart, target.tilemapLocation());
                scene.followPath(sprite, path, speed);
            }
            sprite.say("following")
        })
    }

}


