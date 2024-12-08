// vehicle.js

function findProjection(pos, a, b) {
    let v1 = p5.Vector.sub(a, pos);
    let v2 = p5.Vector.sub(b, pos);
    v2.normalize();
    let sp = v1.dot(v2);
    v2.mult(sp);
    v2.add(pos);
    return v2;
  }

class Vehicle {
    static debug = false;
    constructor(x, y, img = null) {
      this.pos = createVector(x, y);
      this.vel = createVector(random(-2, 2), random(-2, 2));
      this.acc = createVector(0, 0);
      this.maxSpeed = 3;
      this.maxForce = 0.1;
      this.r = 10; // Rayon du véhicule
      this.img = img;
      this.alignWeight = 1.5;
      this.cohesionWeight = 1;
      this.separationWeight = 3;
      this.boundariesWeight = 10;
      this.perceptionRadius = 25;
    }
    
  // Appliquer les forces de comportement
  applyBehaviors(target, obstacles, vehicles) {
    let seekForce = this.seek(target);
    let avoidForce = this.avoidObstacles(obstacles);
    let separateForce = this.separate(vehicles);

    seekForce.mult(0.7);
    avoidForce.mult(5);
    separateForce.mult(0.7);

    this.applyForce(seekForce);
    this.applyForce(avoidForce);
    this.applyForce(separateForce);
  }


    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        
        // Empêcher le véhicule de traverser les bords de l'écran (rebond)
        if (this.pos.x > width - this.r) {
          this.pos.x = width - this.r;  // Bloque la position à droite
          this.vel.x *= -1;  // Inverse la direction horizontale
        } else if (this.pos.x < this.r) {
          this.pos.x = this.r;  // Bloque la position à gauche
          this.vel.x *= -1;  // Inverse la direction horizontale
        }
      
        if (this.pos.y > height - this.r) {
          this.pos.y = height - this.r;  // Bloque la position en bas
          this.vel.y *= -1;  // Inverse la direction verticale
        } else if (this.pos.y < this.r) {
          this.pos.y = this.r;  // Bloque la position en haut
          this.vel.y *= -1;  // Inverse la direction verticale
        }
      
        this.acc.mult(0);  // Réinitialiser l'accélération après chaque mise à jour
      }
      

    applyForce(force) {
      this.acc.add(force);
    }
  
    // Éviter les obstacles
  avoidObstacles(obstacles) {
    let avoidForce = createVector(0, 0);
    
    // Parcourir tous les obstacles et vérifier s'ils sont trop proches
    for (let obstacle of obstacles) {
      let d = p5.Vector.dist(this.pos, obstacle.pos);
      
      if (d < this.perceptionRadius + obstacle.r) {
        let diff = p5.Vector.sub(this.pos, obstacle.pos); // Direction d'évitement
        diff.normalize();
        diff.div(d); // Plus l'obstacle est proche, plus la force d'évitement est grande
        avoidForce.add(diff);
      }
    }
    
    return avoidForce;
  }
    // Appliquer les comportements de boids (flocking)
    applyBehaviors(target, obstacles, vehicles) {
      let alignment = this.align(vehicles);
      let cohesion = this.cohesion(vehicles);
      let separation = this.separation(vehicles);
  
      // Poids des comportements
      alignment.mult(this.alignWeight);
      cohesion.mult(this.cohesionWeight);
      separation.mult(this.separationWeight);
  
      this.applyForce(alignment);
      this.applyForce(cohesion);
      this.applyForce(separation);
  
      // Comportement de fuite avec une cible
      let fleeForce = this.fleeWithTargetRadius(target);
      this.applyForce(fleeForce);
    }
  
    flock(vehicles) {
      // Calcul de l'alignement, de la cohésion et de la séparation
      let alignment = this.align(vehicles);
      let cohesion = this.cohesion(vehicles);
      let separation = this.separation(vehicles);
  
      alignment.mult(this.alignWeight);
      cohesion.mult(this.cohesionWeight);
      separation.mult(this.separationWeight);
  
      this.applyForce(alignment);
      this.applyForce(cohesion);
      this.applyForce(separation);
    }
  
    // Alignement avec les autres véhicules
    align(vehicles) {
      let steering = createVector(0, 0);
      let total = 0;
      for (let other of vehicles) {
        let d = p5.Vector.dist(this.pos, other.pos);
        if (other != this && d < this.perceptionRadius) {
          steering.add(other.vel);
          total++;
        }
      }
      if (total > 0) {
        steering.div(total);
        steering.setMag(this.maxSpeed);
        steering.sub(this.vel);
        steering.limit(this.maxForce);
      }
      return steering;
    }
  
    // Cohésion avec les autres véhicules
    cohesion(vehicles) {
      let steering = createVector(0, 0);
      let total = 0;
      for (let other of vehicles) {
        let d = p5.Vector.dist(this.pos, other.pos);
        if (other != this && d < this.perceptionRadius) {
          steering.add(other.pos);
          total++;
        }
      }
      if (total > 0) {
        steering.div(total);
        steering.sub(this.pos);
        steering.setMag(this.maxSpeed);
        steering.sub(this.vel);
        steering.limit(this.maxForce);
      }
      return steering;
    }
  
    // Séparation des autres véhicules pour éviter les collisions
    separation(vehicles) {
      let steering = createVector(0, 0);
      let total = 0;
      for (let other of vehicles) {
        let d = p5.Vector.dist(this.pos, other.pos);
        if (other != this && d < this.r * 2) {
          let diff = p5.Vector.sub(this.pos, other.pos);
          diff.div(d); // Le facteur 1/d est utilisé pour plus d'évitement
          steering.add(diff);
          total++;
        }
      }
      if (total > 0) {
        steering.div(total);
      }
      if (steering.mag() > 0) {
        steering.setMag(this.maxSpeed);
        steering.sub(this.vel);
        steering.limit(this.maxForce);
      }
      return steering;
    }
  
    // Comportement de fuite vers une cible
    fleeWithTargetRadius(target) {
      let desired = p5.Vector.sub(this.pos, target);
      let d = desired.mag();
      if (d < 100) {
        desired.setMag(this.maxSpeed);
        desired.sub(this.vel);
        desired.limit(this.maxForce);
        return desired;
      }
      return createVector(0, 0); // Pas de fuite si la cible est trop éloignée
    }
  
    // Mise à jour de la position et de la vélocité
    update() {
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      this.acc.mult(0);
    }
  
    // Affichage du véhicule
    show() {
      if (this.img) {
        image(this.img, this.pos.x, this.pos.y, this.r * 2, this.r * 2);
      } else {
        fill(255);
        noStroke();
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
      }
    }
    
    // Fonction qui détermine si le véhicule est proche d'un obstacle
    getVehiculeLePlusProche(vehicles) {
      let closest = null;
      let record = Infinity;
      for (let vehicle of vehicles) {
        let d = p5.Vector.dist(this.pos, vehicle.pos);
        if (d < record) {
          record = d;
          closest = vehicle;
        }
      }
      return closest;
    }
    
    // Comportement de recherche (seek) d'une cible
    seek(target) {
      let desired = p5.Vector.sub(target, this.pos);
      desired.setMag(this.maxSpeed);
      let steering = p5.Vector.sub(desired, this.vel);
      steering.limit(this.maxForce);
      return steering;
    }
    
    wander() {
      // Logique pour le comportement de vagabondage
      return createVector(random(-1, 1), random(-1, 1)); // Simplification pour l'exemple
    }
  }
  
  class Target extends Vehicle {
    constructor(x, y) {
      super(x, y);
      this.vel = p5.Vector.random2D();
      this.vel.mult(5);
    }
  

  }