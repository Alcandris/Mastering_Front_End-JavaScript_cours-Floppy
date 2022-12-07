//1-créer un render qui si genere en boucle :
//-permet de deplacer les images (effet de vol, deplacement des tubes)

const canvas = document.getElementById("canvas"); //
const ctx = canvas.getContext("2d");
const img = new Image(); // fonctionnellement équivalent à document.createElement('img')
img.src = "./media/flappy-bird-set.png";

//general settings
const largeurfenetre = window.width;
let gamePlaying = false; //toggle pour savoir si on est en train de jouer, pour savoir quelle page afficher
const gravityBasic = 0.5; //gravité pour la difficulté
const speedBasic = 6.2; // vitesse de l'oiseau
const size = [51, 36]; // taille de l'oiseau
const jumpBasic = -11.5; // difficulté du mouvement de l'oiseau
const cTenth = canvas.width / 10;

//pipe settings
const pipeWidth = 78;
const pipeGap = 270;
const pipeloc = () =>
  //hauteur du poteau
  Math.random() * (canvas.height - (pipeGap + pipeWidth) - pipeWidth) +
  pipeWidth;

let speed = 6.2;
let gravity = 0.5;
let jump = -11.5;
let index = 0; //creéation de l'effet d'optique, gere l'animation
let bestScore = 0;
let curentScore = 0;
let pipes = []; //poteaux
let flight; //vol
let flyHeight; //hauteur de vol
let rapport;

const setup = () => {
  rapport = window.devicePixelRatio;
  speed = speedBasic / rapport;
  gravity = gravityBasic / rapport;
  jump = jumpBasic / rapport;

  currentScore = 0;
  flight = jump;
  flyHeight = canvas.height / 2 - size[1] / 2;

  pipes = Array(3)
    .fill()
    .map((a, i) => [canvas.width + i * (pipeGap + pipeWidth), pipeloc()]);
};

const render = () => {
  index++;

  //background
  //2 images se suivent pour sonner de la fluidité
  ctx.drawImage(
    img,
    0,
    0,
    canvas.width,
    canvas.height,
    -((index * (speed / 2)) % canvas.width) + canvas.width, //image décalée de la largeur du canvas. le signe négatif permet le déplacement de la droite vers la gauche.
    //speed/2 = le décors bouge deux fois moins vite que les poteaux.
    //%canvas.width = ne pas partir à l'infini
    //point de départ pour coller l'image dans le canva. le rendre dynamique permet de faire se déplacer l'image
    0,
    canvas.width,
    canvas.height
  );
  ctx.drawImage(
    img,
    0,
    0,
    canvas.width,
    canvas.height,
    -((index * (speed / 2)) % canvas.width), //image non décalée de la largeur du canva
    0,
    canvas.width,
    canvas.height
  );

  //bird
  if (gamePlaying) {
    ctx.drawImage(
      img,
      432,
      Math.floor((index % 9) / 3) * size[1], //vaut 0,1 ou 2, permet de chnger d'image d'oiseau
      ...size,
      cTenth,
      flyHeight,
      ...size
    );
    flight += gravity;
    flyHeight = Math.min(flyHeight + flight, canvas.height - size[1]); //flyHeight prend la valeur la plus petite entre (flyHeight + flight) et (taille du canva - taille de l'oiseau, permet de le bloquer en bas) (plus flyHeight est petit, plus l'oiseau va vers le haut de l'écran).
    // au debut, flyHeight=milieu écran et flight augmente de la valeur de la gravité a chque défillement
  } else {
    //ecran acceuil
    flyHeight = canvas.height / 2 - size[1] / 2;
    ctx.drawImage(
      img,
      432,
      Math.floor((index % 9) / 3) * size[1], //vaut 0,1 ou 2, permet de chnger d'image d'oiseau
      ...size,
      canvas.width / 2 - size[0] / 2,
      flyHeight,
      ...size
    );

    ctx.fillText(`Meilleur score : ${bestScore}`, 55, 245);
    ctx.fillText("Cliquez pour jouer", 48, 535);
    ctx.font = "bold 30px courier";
  }

  //pipes display
  if (gamePlaying) {
    pipes.map((pipe) => {
      pipe[0] -= speed;
      //top pipe
      ctx.drawImage(
        img,
        432,
        588 - pipe[1],
        pipeWidth,
        pipe[1],
        pipe[0],
        0,
        pipeWidth,
        pipe[1]
      );
      //bottom pipe
      ctx.drawImage(
        img,
        432 + pipeWidth,
        108,
        pipeWidth,
        canvas.height - pipe[1] + pipeGap,
        pipe[0],
        pipe[1] + pipeGap,
        pipeWidth,
        canvas.height - pipe[1] + pipeGap
      );
      if (pipe[0] <= -pipeWidth) {
        currentScore++;
        bestScore = Math.max(bestScore, currentScore);

        //remove pipe + create new one
        pipes = [
          ...pipes.slice(1), //garde les elements 1 et 2 du  taleau
          [pipes[pipes.length - 1][0] + pipeGap + pipeWidth, pipeloc()],
          //pipes[pipes.length - 1][0] = 1er element du dernier elemnt du tableau. pipes est composé de 3 elemnts, chacun composé de 2 éléments
        ];
      }
      //if hit the pipe, end
      if (
        [
          pipe[0] <= cTenth + size[0], //on verifie que les poteaux se siteuent sur le y de l'oiseau
          pipe[0] + pipeWidth >= cTenth,
          pipe[1] > flyHeight || pipe[1] + pipeGap < flyHeight + size[1], //on verifie hauteur pipe top > hauteur de vol || hauteur pipe bottom < hauteur de vol (pour rappel, 0,0 se situe en haut a gauche)
        ].every((elem) => elem)
      ) {
        gamePlaying = false;
        setup();
      }
    });
  }

  document.getElementById("bestScore").innerHTML = `Meilleur : ${bestScore}`;
  document.getElementById(
    "currentScore"
  ).innerHTML = `Actuel : ${currentScore}`;

  window.requestAnimationFrame(render); //appel render, tourne en boucle
};

setup();
img.onload = render; //au chargement de l'image, on debute l'animation render
document.addEventListener("click", () => (gamePlaying = true));
window.onclick = () => (flight = jump);

console.log(window.devicePixelRatio);
