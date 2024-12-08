class Obstacle {
    constructor(x, y, r, couleur) {
      this.pos = createVector(x, y);
      this.r = r;
      this.color = couleur;
    }
  
    show() {
      push();
      fill(this.color);
      stroke(0);
      strokeWeight(3);
      ellipse(this.pos.x, this.pos.y, this.r * 2);
      fill(0);
      ellipse(this.pos.x, this.pos.y, 10);
      pop();
    }
      // Méthode pour vérifier si un véhicule touche cet obstacle
  isColliding(vehicle) {
    let d = p5.Vector.dist(vehicle.pos, this.pos);
    return d < vehicle.r + this.r; // Collision si la distance est inférieure à la somme des rayons
  }
}

  