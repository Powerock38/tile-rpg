class Entity {
  constructor(spriteName) {
    this.x = null; // tile coordinates, not pixels
    this.y = null;
    this.z = null;
    this.cell = null;
    this.animX = null;
    this.animY = null;
    this.facing = D.down;
    this.frame = 2;
    this.speed = 8;
    this.sprite = Spritesheet.list[spriteName];
    this.going = {
      up: 0,
      down: 0,
      left: 0,
      right: 0
    };
  }

  setCell(cell, x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.cell = cell;
  }

  get adjTiles() {
    return {
      on:    Tile.list[(this.cell.terrain[this.z][this.y]     || "")[this.x]],
      up:    Tile.list[(this.cell.terrain[this.z][this.y - 1] || "")[this.x]],
      down:  Tile.list[(this.cell.terrain[this.z][this.y + 1] || "")[this.x]],
      right: Tile.list[(this.cell.terrain[this.z][this.y]     || "")[this.x + 1]],
      left:  Tile.list[(this.cell.terrain[this.z][this.y]     || "")[this.x - 1]],
    };
  }

  get belowTiles() {
    return {
      on:    Tile.list[((this.cell.terrain[this.z - 1] || "")[this.y]     || "")[this.x]],
      up:    Tile.list[((this.cell.terrain[this.z - 1] || "")[this.y - 1] || "")[this.x]],
      down:  Tile.list[((this.cell.terrain[this.z - 1] || "")[this.y + 1] || "")[this.x]],
      right: Tile.list[((this.cell.terrain[this.z - 1] || "")[this.y]     || "")[this.x + 1]],
      left:  Tile.list[((this.cell.terrain[this.z - 1] || "")[this.y]     || "")[this.x - 1]],
    };
  }

  update() {
    let x = this.x * 32;
    let y = this.y * 32;
    if(this.going.up > 0) {
      y += (this.going.up--) * (32 / this.speed) - 32;
      this.frame = (this.going.up % 3) + D.up - 1;
      if(this.going.up === 0) this.afterMove(D.up);
    } else if(this.going.down > 0) {
      y -= (this.going.down--) * (32 / this.speed) - 32;
      this.frame = (this.going.down % 3) + D.down - 1;
      if(this.going.down === 0) this.afterMove(D.down);
    } else if(this.going.left > 0) {
      x += (this.going.left--) * (32 / this.speed) - 32;
      this.frame = (this.going.left % 3) + D.left - 1;
      if(this.going.left === 0) this.afterMove(D.left);
    } else if(this.going.right > 0) {
      x -= (this.going.right--) * (32 / this.speed) - 32;
      this.frame = (this.going.right % 3) + D.right - 1;
      if(this.going.right === 0) this.afterMove(D.right);
    } else {
      this.frame = this.facing;
    }
    this.animX = x;
    this.animY = y;
  }

  draw() {
    this.sprite.drawFrame(Cell.ctx, this.frame, this.animX, this.animY);
  }

  afterMove(dir) {
    if(dir === D.up) {
      this.y--;
    } else if(dir === D.down) {
      this.y++;
    } else if(dir === D.left) {
      this.x--;
    } else if(dir === D.right) {
      this.x++;
    }
    if(this.belowTiles.on && this.belowTiles.on.stairs)
      this.cell.moveEntity(this, this.x, this.y, this.z - 1);
  }

  canMove(dir) {
    for(let going of Object.values(this.going)) {
      if(going > 0) return false;
    }

    if(dir === D.up) {
      return (this.adjTiles.up && this.adjTiles.up !== Tile.list[""]) || (this.belowTiles.up && this.belowTiles.up.stairs);
    } else if(dir === D.down) {
      return (this.adjTiles.down && this.adjTiles.down !== Tile.list[""]) || (this.belowTiles.down && this.belowTiles.down.stairs);
    } else if(dir === D.left) {
      return (this.adjTiles.left && this.adjTiles.left !== Tile.list[""]) || (this.belowTiles.left && this.belowTiles.left.stairs);
    } else if(dir === D.right) {
      return (this.adjTiles.right && this.adjTiles.right !== Tile.list[""]) || (this.belowTiles.right && this.belowTiles.right.stairs);
    }
  }

  move(dir) {
    if(this.facing !== dir) {
      this.facing = dir;
    } else if(this.canMove(dir) || (this.adjTiles.on && this.adjTiles.on.stairs === dir)) {
      this.going = {
        up: 0,
        down: 0,
        left: 0,
        right: 0
      };
      if(dir === D.up) {
        this.going.up = this.speed;
      } else if(dir === D.down) {
        this.going.down = this.speed;
      } else if(dir === D.left) {
        this.going.left = this.speed;
      } else if(dir === D.right) {
        this.going.right = this.speed;
      }
      if(this.adjTiles.on.stairs === dir) {
        this.cell.moveEntity(this, this.x, this.y, this.z + 1);
      }
    }
  }
}

class Player extends Entity {
  constructor(sprite) {
    super(sprite);
    this.go = {
      up: false,
      down: false,
      left: false,
      right: false
    }
    document.addEventListener("keydown",(e)=>{
           if(e.key === "z") this.go.up = true;
      else if(e.key === "s") this.go.down = true;
      else if(e.key === "q") this.go.left = true;
      else if(e.key === "d") this.go.right = true;
    });

    document.addEventListener("keyup",(e)=>{
           if(e.key === "z") this.go.up = false;
      else if(e.key === "s") this.go.down = false;
      else if(e.key === "q") this.go.left = false;
      else if(e.key === "d") this.go.right = false;
    });
  }

  update() {
    super.update();

    if(this.go.up) this.move(D.up);
    else if(this.go.down) this.move(D.down);
    else if(this.go.left) this.move(D.left);
    else if(this.go.right) this.move(D.right);
  }
}
