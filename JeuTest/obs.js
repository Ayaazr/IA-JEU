class Vehicle {
  constructor(x, y, img = null) {
    this.pos = createVector(x, y);
    this.vel = createVector();
    this.acc = createVector();
    this.r = 20;  // Rayon du véhicule
    this.maxSpeed = 5;
    this.maxForce = 0.1;
    this.img = img;  // Image optionnelle pour le véhicule
    this.mass = 1;  // Masse du véhicule pour gérer l'accélération
  }

  // Appliquer les comportements (seeking, avoidance, flocking)
  applyBehaviors(target, obstacles, vehicles) {
    let steer = this.seek(target);  // Comportement d'aller vers la cible
    steer.add(this.avoidObstacles(obstacles));  // Ajouter évitement des obstacles
    steer.add(this.flock(vehicles));  // Comportement de flocking

    this.applyForce(steer);
  }

  // Méthode pour éviter les obstacles
  avoidObstacles(obstacles) {
    let steer = createVector();
    let desiredDistance = this.r + 20;  // Distance minimale de sécurité avec l'obstacle

    for (let obstacle of obstacles) {
      let d = p5.Vector.dist(this.pos, obstacle.pos);

      // Si le véhicule est trop proche de l'obstacle, appliquer une force de répulsion
      if (d < desiredDistance + obstacle.r) {
        let diff = p5.Vector.sub(this.pos, obstacle.pos);  // Vecteur de répulsion
        diff.normalize();

        // Limiter la force pour éviter un impact trop important
        let force = map(d, 0, desiredDistance + obstacle.r, this.maxForce, 0);
        diff.mult(force);
        steer.add(diff);
      }
    }

    return steer;
  }

  // Appliquer la force (avec gestion de la masse)
  applyForce(force) {
    let f = p5.Vector.div(force, this.mass); // Diviser la force par la masse du véhicule
    this.acc.add(f);
  }

  // Mise à jour de la position du véhicule
  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0); // Reset de l'accélération
  }

  // Affichage du véhicule
  show() {
    push();
    fill(127);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.r * 2);
    if (this.img) {
      imageMode(CENTER);
      image(this.img, this.pos.x, this.pos.y, this.r * 2, this.r * 2);
    }
    pop();
  }

  // Comportements de flocking (alignement, cohésion, séparation)
  flock(vehicles) {
    let alignment = this.align(vehicles);
    let cohesion = this.cohesion(vehicles);
    let separation = this.separation(vehicles);

    // Poids des comportements
    alignment.mult(1);
    cohesion.mult(1);
    separation.mult(1.5);

    return alignment.add(cohesion).add(separation);
  }

  // Alignement avec les autres véhicules
  align(vehicles) {
    let steer = createVector();
    let total = 0;
    for (let other of vehicles) {
      let d = p5.Vector.dist(this.pos, other.pos);
      if (other != this && d < 50) {
        steer.add(other.vel);
        total++;
      }
    }
    if (total > 0) {
      steer.div(total);
      steer.setMag(this.maxSpeed);
      steer.sub(this.vel);
      steer.limit(this.maxForce);
    }
    return steer;
  }

  // Cohésion avec les autres véhicules
  cohesion(vehicles) {
    let steer = createVector();
    let total = 0;
    for (let other of vehicles) {
      let d = p5.Vector.dist(this.pos, other.pos);
      if (other != this && d < 50) {
        steer.add(other.pos);
        total++;
      }
    }
    if (total > 0) {
      steer.div(total);
      steer.sub(this.pos);
      steer.setMag(this.maxSpeed);
      steer.sub(this.vel);
      steer.limit(this.maxForce);
    }
    return steer;
  }

  // Séparation des autres véhicules pour éviter les collisions
  separation(vehicles) {
    let steer = createVector();
    let total = 0;
    for (let other of vehicles) {
      let d = p5.Vector.dist(this.pos, other.pos);
      if (other != this && d < this.r * 2) {
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.div(d); // Plus proche = plus forte force
        steer.add(diff);
        total++;
      }
    }
    if (total > 0) {
      steer.div(total);
    }
    if (steer.mag() > 0) {
      steer.setMag(this.maxSpeed);
      steer.sub(this.vel);
      steer.limit(this.maxForce);
    }
    return steer;
  }

  // Comportement de recherche vers une cible
  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    desired.normalize();
    desired.mult(this.maxSpeed);

    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);

    return steer;
  }
}
