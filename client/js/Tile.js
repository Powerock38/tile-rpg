class Tile {
  static load(callback) {
    fetch("./loading/tiles.json").then(response => response.json())
    .then(list => {
      let nbToLoad = list.length;
      for(const tile of list) {
        if(tile === "") {
          new Tile(false, tile);
          console.log("Loaded empty tile");
          --nbToLoad === 0 && callback();
        } else {
          let image = new Image();
          image.src = "./tiles/" + tile + ".png";
          image.onload = () =>  {
            new Tile(image, tile);
            console.log("Loaded tile " + tile);
            --nbToLoad === 0 && callback();
          }
        }
      }
    });
  }

  constructor(image, id) {
    this.image = image;
    this.id = id;
    Tile.list.set(this.id, this);
  }

  draw(x, y) {
    if(this.image)
      CTX.drawImage(this.image, x * 32, y * 32, 32, 32);
  }
}
Tile.list = new Map();
