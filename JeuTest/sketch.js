let pursuer1, pursuer2;
let target;
let obstacles = [];
let vehicules = [];
const flock = [];
let fishImage;
let requinImage;
let labelNbBoids;
let requins = [];
let imge;
let debugMode = false;  // Variable pour gérer l'activation du mode débogage


function draw() {
  background(imge);  // Affiche l'image comme arrière-plan à chaque frame

  // Mettre à jour le nombre de boids
  labelNbBoids.html("Nombre de boids : " + flock.length);

  // Dessiner la cible qui suit la souris
  target.x = mouseX;
  target.y = mouseY;
  fill("pink");
  noStroke();
  ellipse(target.x, target.y, target.r, target.r);

  // Appliquer les comportements de flocking à chaque boid
  for (let boid of flock) {
    boid.flock(flock);
    boid.fleeWithTargetRadius(target);
    boid.applyBehaviors(target, obstacles, flock); // Inclure le comportement d'évitement des obstacles
    boid.update();
    boid.show();
    
    if (debugMode) {
      console.log(`Boid position: (${boid.pos.x}, ${boid.pos.y}), Velocity: (${boid.vel.x}, ${boid.vel.y})`);
    }
  }

  // Gérer le requin
  let wanderForce = requin.wander();
  wanderForce.mult(1);
  requin.applyForce(wanderForce);

  let closest = requin.getVehiculeLePlusProche(flock);
  if (closest) {
    let d = p5.Vector.dist(requin.pos, closest.pos);
    if (d < 70) {
      let seekForce = requin.seek(closest.pos);
      seekForce.mult(7);
      requin.applyForce(seekForce);
    }

    if (d < 5) {
      let index = flock.indexOf(closest);
      flock.splice(index, 1); // Mange le poisson
    }
  }

  // Dessiner les obstacles
  obstacles.forEach(o => {
    o.show();
    if (debugMode) {
      console.log(`Obstacle position: (${o.pos.x}, ${o.pos.y}), Radius: ${o.r}`);
    }
  });

  // Appliquer les comportements aux véhicules (poursuiveurs)
  vehicules.forEach(v => {
    v.applyBehaviors(target, obstacles, vehicules);
    v.update();
    v.show();

    if (debugMode) {
      console.log(`Pursuer position: (${v.pos.x}, ${v.pos.y}), Velocity: (${v.vel.x}, ${v.vel.y})`);
    }
  });

  // Afficher l'indicateur du mode débogage à l'écran
  if (debugMode) {
    fill(0);
    textSize(16);
    text("Debug Mode: ON", 10, height - 20);
  }
}

if (this.pos.x > width - this.r) {
  this.pos.x = width - this.r; // Empêche de dépasser à droite
  this.vel.x *= -1; // Inverse la direction horizontale
} else if (this.pos.x < this.r) {
  this.pos.x = this.r; // Empêche de dépasser à gauche
  this.vel.x *= -1; // Inverse la direction horizontale
}

if (this.pos.y > height - this.r) {
  this.pos.y = height - this.r; // Empêche de dépasser en bas
  this.vel.y *= -1; // Inverse la direction verticale
} else if (this.pos.y < this.r) {
  this.pos.y = this.r; // Empêche de dépasser en haut
  this.vel.y *= -1; // Inverse la direction verticale
}

function mousePressed() {
  // TODO : ajouter un obstacle de taille aléatoire à la position de la souris
  obstacles.push(new Obstacle(mouseX, mouseY, random(20, 100), "green"));
}
function draw() {
  // changer le dernier param (< 100) pour effets de trainée
  background(0, 0, 0, 100);

  target = createVector(mouseX, mouseY);

  // Dessin de la cible qui suit la souris
  // Dessine un cercle de rayon 32px à la position de la souris
  fill(255, 0, 0);
  noStroke();
  circle(target.x, target.y, 32);

  // dessin des obstacles
  // TODO
  obstacles.forEach(o => {
    o.show();
  })

  vehicules.forEach(v => {
    // pursuer = le véhicule poursuiveur, il vise un point devant la cible
    v.applyBehaviors(target, obstacles, vehicules);

    // déplacement et dessin du véhicule et de la target
    v.update();
    v.show();
  });
}

function preload() {
  // Chargement des images
  fishImage = loadImage('assets/R.png');
  requinImage = loadImage('assets/angel.jpg');
  imge = loadImage('assets/stitchAR.jpg');

}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Initialisation des pursuers
  pursuer1 = new Vehicle(100, 100);
  pursuer2 = new Vehicle(random(width), random(height));
  vehicules.push(pursuer1);

  // Création des "boids"
  for (let i = 0; i < 200; i++) {
    const b = new Vehicle(random(width), random(height), fishImage);
    b.r = random(8, 40);
    flock.push(b);
  }

  // Création du requin
  requin = new Vehicle(width / 2, height / 2, requinImage);
  requin.r = 40;
  requin.maxSpeed = 7;
  requin.maxForce = 0.5;

  // Création des sliders pour ajuster les comportements
  const posYSliderDeDepart = 10;
  creerUnSlider("Poids alignment", flock, 0, 2, 1.5, 0.1, 10, posYSliderDeDepart, "alignWeight");
  creerUnSlider("Poids cohesion", flock, 0, 2, 1, 0.1, 10, posYSliderDeDepart + 30, "cohesionWeight");
  creerUnSlider("Poids séparation", flock, 0, 15, 3, 0.1, 10, posYSliderDeDepart + 60, "separationWeight");
  creerUnSlider("Poids boundaries", flock, 0, 15, 10, 1, 10, posYSliderDeDepart + 90, "boundariesWeight");
  creerUnSlider("Rayon des boids", flock, 4, 40, 6, 1, 10, posYSliderDeDepart + 120, "r");
  creerUnSlider("Perception radius", flock, 15, 60, 25, 1, 10, posYSliderDeDepart + 150, "perceptionRadius");

  // Création de la cible (suit la souris)
  target = createVector(mouseX, mouseY);
  target.r = 50;

  // Créer un label pour le nombre de boids
  labelNbBoids = createP("Nombre de boids : " + flock.length);
  labelNbBoids.style('color', 'white');
  labelNbBoids.position(10, posYSliderDeDepart + 180);
}

function draw() {
  background(imge);  // Affiche l'image comme arrière-plan à chaque frame


  // Mettre à jour le nombre de boids
  labelNbBoids.html("Nombre de boids : " + flock.length);

  // Dessiner la cible qui suit la souris
  target.x = mouseX;
  target.y = mouseY;
  fill("pink");
  noStroke();
  ellipse(target.x, target.y, target.r, target.r);

  // Appliquer les comportements de flocking à chaque boid
  for (let boid of flock) {
    boid.flock(flock);
    boid.fleeWithTargetRadius(target);
    boid.update();
    boid.show();
    
    // Si le mode débogage est activé, afficher des informations de débogage
    if (debugMode) {
      console.log(`Boid position: (${boid.pos.x}, ${boid.pos.y}), Velocity: (${boid.vel.x}, ${boid.vel.y})`);
    }
  }

  // Gérer le requin
  let wanderForce = requin.wander();
  wanderForce.mult(1);
  requin.applyForce(wanderForce);

  // Chercher le poisson le plus proche
  let closest = requin.getVehiculeLePlusProche(flock);
  if (closest) {
    let d = p5.Vector.dist(requin.pos, closest.pos);
    if (d < 70) {
      let seekForce = requin.seek(closest.pos);
      seekForce.mult(7);
      requin.applyForce(seekForce);
    }

    if (d < 5) {
      let index = flock.indexOf(closest);
      flock.splice(index, 1); // Mange le poisson
    }
  }

  // Dessiner les obstacles
  obstacles.forEach(o => {
    o.show();
    // Si le mode débogage est activé, afficher la position et le type de chaque obstacle
    if (debugMode) {
      console.log(`Obstacle position: (${o.pos.x}, ${o.pos.y}), Radius: ${o.r}`);
    }
  });

  // Appliquer les comportements aux véhicules (poursuiveurs)
  vehicules.forEach(v => {
    v.applyBehaviors(target, obstacles, vehicules);
    v.update();
    v.show();

    // Si le mode débogage est activé, afficher des informations sur chaque véhicule
    if (debugMode) {
      console.log(`Pursuer position: (${v.pos.x}, ${v.pos.y}), Velocity: (${v.vel.x}, ${v.vel.y})`);
    }
  });

  // Afficher l'indicateur du mode débogage à l'écran
  if (debugMode) {
    fill(0);
    textSize(16);
    text("Debug Mode: ON", 10, height - 20);
  }
}

// Fonction pour ajouter un slider
function creerUnSlider(label, tabVehicules, min, max, val, step, posX, posY, propriete) {
  let slider = createSlider(min, max, val, step);
  
  let labelP = createP(label);
  labelP.position(posX, posY);
  labelP.style('color', 'white');

  slider.position(posX + 150, posY + 17);

  let valueSpan = createSpan(slider.value());
  valueSpan.position(posX + 300, posY + 17);
  valueSpan.style('color', 'white');
  valueSpan.html(slider.value());

  slider.input(() => {
    valueSpan.html(slider.value());
    tabVehicules.forEach(vehicle => {
      vehicle[propriete] = slider.value();
    });
  });
  return slider;
}

// Ajouter un poisson à la position de la souris
function mousePressed() {
  const b = new Vehicle(mouseX, mouseY, fishImage);
  b.r = random(34, 78);
  flock.push(b);
}

function keyPressed() {
  if (key == "v") {
    // Crée un véhicule à une position aléatoire
    vehicles.push(new Vehicle(random(width), random(height)));
  } else if (key == "d") {
    // Bascule le mode de débogage
    debugMode = !debugMode;
    console.log("Debug Mode Toggled:", debugMode ? "ON" : "OFF");
  } else if (key == "f") {
    // Crée 10 véhicules avec des vitesses aléatoires
    for (let i = 0; i < 10; i++) {
      let v = new Vehicle(20, 300);
      v.vel = new p5.Vector(random(1, 5), random(1, 5));
      vehicles.push(v);
    }
  } else if (key == "o") {
    // Crée un obstacle supplémentaire à une position aléatoire
    obstacles.push(new Obstacle(random(width), random(height), random(20, 50), color(random(255), random(255), random(255)), random(["circle", "square"])));
  }
}
