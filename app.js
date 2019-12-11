// canvas initialization 
const gameField = document.querySelector('#game-field');

gameField.width = window.innerWidth;
gameField.height = window.innerHeight;

window.addEventListener('resize', () => {
    gameField.width = window.innerWidth;
    gameField.height = window.innerHeight;

    // make player stay at half of window.height
    playerProperties.y = window.innerHeight / 2 - playerProperties.radius / 2;
    if (player) {

        player.y = playerProperties.y;
        player.draw();
    }
});

const c = gameField.getContext('2d');

// 'enemies' classes

class Particle {
    constructor(x, y, color, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = 40;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.radiusDecrease = 0.5;
    }

    draw() {
        c.beginPath();
        c.fillStyle = this.color;
        c.fillRect(this.x, this.y, this.radius, this.radius);
        c.fill();
    }

    update() {
        if (this.radius <= 0) {
            spawnedParticles.shift();
        }
        else {
            this.x += this.velocityX;
            this.y += this.velocityY;
            this.radius -= this.radiusDecrease;
            this.draw();
        }
    }
}

class Shape {
    constructor(x, y, shape, color, radius, playerX) {
        this.x = x;
        this.y = y;
        this.shape = shape;
        this.color = color;
        this.radius = radius;
        this.playerX = playerX;
        this.radiusDecrease = 0;
    }

    draw() {
        c.beginPath();
        c.fillStyle = this.color;
    }

    update() {
        this.x -= speed;
        this.radius -= this.radiusDecrease;
        if (this.radius <= 0) {
            this.radiusDecrease = 0;
            spawnedShapes.shift();
        }
        this.checkForCollision();
        this.draw();
    }

    spawnParticles() {
        spawnedParticles.push(new Particle(this.x + 10, this.y + 10, this.color, 2, 2));
        spawnedParticles.push(new Particle(this.x + 10, this.y - 10, this.color, 2, -2));
        spawnedParticles.push(new Particle(this.x - 10, this.y + 10, this.color, -2, 2));
        spawnedParticles.push(new Particle(this.x - 10, this.y - 10, this.color, -2, -2));
    }



    checkForCollision() {
        if (this.x <= this.playerX + this.radius * 1.5) {
            if (this.color === playerProperties.color && this.shape === playerProperties.shape) {
                animatedPoints.classList.remove('inactive');
                player.score += 100;
                setTimeout(() => {
                    animatedPoints.classList.add('inactive');
                    gameScore.innerHTML = `Score: ${player.score}`;
                }, 700);
                this.radiusDecrease = 10;
                player.numberOfCorrect++;
                player.correctForLifes++;
                if (player.correctForLifes === 10 && player.lifes < 3) {
                    player.lifes++;
                    player.correctForLifes = 0;
                    let img = document.createElement('img');
                    img.src = 'img/heart.png';
                    img.classList.add('heart');
                    img.classList.add('slideIn');
                    lifes.appendChild(img);

                    setTimeout(() => {
                        lifes.lastChild.classList.remove('slideIn');
                    }, 1000);
                }

                if (speed < maxSpeed) {
                    speed = 2 + player.numberOfCorrect / 10;
                }

            }
            else {
                player.numberOfIncorrect++;
                player.lifes--;

                if (player.lifes >= 0) {
                    this.spawnParticles();
                    lifes.lastChild.classList.add('drop');
                    setTimeout(() => {
                        lifes.removeChild(lifes.lastChild);
                    }, 1000);
                }

                if (player.lifes === 0) {
                    // end of game
                    endOfGame();
                }

                spawnedShapes.shift();

            }
        }
    }
};

class Circle extends Shape {
    draw() {
        super.draw();
        c.arc(this.x + this.radius, this.y, this.radius, 0, Math.PI * 2, false);
        c.fill();
    }
};

class Rectangle extends Shape {
    draw() {
        super.draw();

        c.fillRect(this.x, this.y - this.radius, this.radius * 2, this.radius * 2);

        c.fill();
    }
};

class Triangle extends Shape {
    draw() {
        super.draw();

        c.moveTo(this.x, this.y - this.radius);
        c.lineTo(this.x + this.radius * 1.5, this.y);
        c.lineTo(this.x, this.y + this.radius);
        c.closePath();

        c.fill();
    }
};

class Diamond extends Shape {
    draw() {
        super.draw();

        c.moveTo(this.x, this.y - this.radius / 2);
        c.lineTo(this.x + this.radius / 2, this.y - this.radius);
        c.lineTo(this.x + this.radius * 1.5, this.y - this.radius);
        c.lineTo(this.x + this.radius * 2, this.y - this.radius / 2);
        c.lineTo(this.x + this.radius, this.y + this.radius);
        c.closePath();

        c.fill();
    }
};


// 'player' setup

class Player {

    constructor(x, y, shape, color, radius) {
        this.x = x;
        this.y = y;
        this.shape = shape;
        this.color = color;
        this.radius = radius;
        this.score = 0;
        this.lifes = 3;
        this.numberOfCorrect = 0;
        this.numberOfIncorrect = 0;
        this.correctForLifes = 0;
    }

    draw() {
        c.beginPath();
        c.fillStyle = this.color;

        if (this.shape === 'circle') {
            c.arc(this.x + this.radius, this.y, this.radius, 0, Math.PI * 2, false);
        }
        else if (this.shape === 'rectangle') {
            c.fillRect(this.x, this.y - this.radius, this.radius * 2, this.radius * 2);
        }
        else if (this.shape === 'triangle') {
            c.moveTo(this.x, this.y - this.radius);
            c.lineTo(this.x + this.radius * 1.5, this.y);
            c.lineTo(this.x, this.y + this.radius);
            c.closePath();
        }
        else if (this.shape === 'diamond') {
            c.moveTo(this.x, this.y - this.radius / 2);
            c.lineTo(this.x + this.radius / 2, this.y - this.radius);
            c.lineTo(this.x + this.radius * 1.5, this.y - this.radius);
            c.lineTo(this.x + this.radius * 2, this.y - this.radius / 2);
            c.lineTo(this.x + this.radius, this.y + this.radius);
            c.closePath();
        }

        c.fill();
    }

    changeShape(shape) {
        this.shape = shape;
        playerProperties.shape = shape;
    }

    changeColor(color) {
        this.color = color;
        playerProperties.color = color;
    }

};

let shapesRadius = 70;

let playerProperties = {
    radius: shapesRadius,
    x: 20,
    y: window.innerHeight / 2 - shapesRadius / 2,
    color: '#011627',
    shape: 'circle',
}



let player;


// game properties

const colors = {
    blue: '#011627',
    green: '#2EC4B6',
    red: '#E71D36',
    yellow: '#FF9F1C',
};

const colorsKeys = Object.keys(colors);


const arrayOfKeyCodes = [81, 87, 69, 82, 85, 73, 79, 80, 27]; // q, w, e, r, u, i, o, p, esc

let inMenu = true;

let inStartMenu = true;

let gameStopped = false;

let animationRequest;

let countToStart;
let secondsToStart = 3;
let spawnTime = 3000;

let spawner;
let spawnedShapes = [];
let spawnedParticles = [];

let speed = 2;

const maxSpeed = 8;
const minSpawnTime = 600;

// dom elements (menus, hints, etc)

const startMenu = document.querySelector('.menu-start');
const pauseMenu = document.querySelector('.menu-pause');

const highscore = startMenu.querySelector('.highscore');

const scoreAndHealthBar = document.querySelector('.score-and-health-bar');
const gameScore = scoreAndHealthBar.querySelector('.score');
const lifes = scoreAndHealthBar.querySelector('.health');
const animatedPoints = scoreAndHealthBar.querySelector('.pointsIn');

const hintsBar = document.querySelector('.hintsBar');
const colorsBar = hintsBar.querySelector('.colors');
const shapesBar = hintsBar.querySelector('.shapes');

const startTimer = document.querySelector('.startTimer');

const endGameScreen = document.querySelector('.endGameScreen');
const endScore = endGameScreen.querySelector('.endScore');
const endCorrect = endGameScreen.querySelector('.endCorrect');
const endInCorrect = endGameScreen.querySelector('.endInCorrect');
const playAgainButton = endGameScreen.querySelector('.button-restart');


// getting actual highscore from local storage

if (localStorage.getItem('highscore') === null) {
    console.log('shit');
    localStorage.setItem('highscore', 0);
    highscore.innerHTML = 'Highscore: 0';
}
else {
    highscore.innerHTML = `Highscore: ${localStorage.getItem('highscore')}`;
}




// game controlls

window.addEventListener('keydown', (e) => {
    const keyCode = e.keyCode;

    if (arrayOfKeyCodes.includes(keyCode)) {
        if (keyCode === 81) {
            player.changeColor(colors.blue)

            colorsBar.querySelectorAll('.option')
                .forEach(option => option.classList.remove('active'));
            colorsBar.querySelector('.blue').classList.add('active');
        }
        else if (keyCode === 87) {
            player.changeColor(colors.green)

            colorsBar.querySelectorAll('.option')
                .forEach(option => option.classList.remove('active'));
            colorsBar.querySelector('.green').classList.add('active');
        }
        else if (keyCode === 69) {
            player.changeColor(colors.red)

            colorsBar.querySelectorAll('.option')
                .forEach(option => option.classList.remove('active'));
            colorsBar.querySelector('.red').classList.add('active');
        }
        else if (keyCode === 82) {
            player.changeColor(colors.yellow)

            colorsBar.querySelectorAll('.option')
                .forEach(option => option.classList.remove('active'));
            colorsBar.querySelector('.yellow').classList.add('active');
        }
        else if (keyCode === 85) {
            player.changeShape('circle');

            shapesBar.querySelectorAll('.option')
                .forEach(option => option.classList.remove('active'));
            shapesBar.querySelector('.circle').classList.add('active');
        }
        else if (keyCode === 73) {
            player.changeShape('rectangle');

            shapesBar.querySelectorAll('.option')
                .forEach(option => option.classList.remove('active'));
            shapesBar.querySelector('.rect').classList.add('active');
        }
        else if (keyCode === 79) {
            player.changeShape('triangle');

            shapesBar.querySelectorAll('.option')
                .forEach(option => option.classList.remove('active'));
            shapesBar.querySelector('.trian').classList.add('active');
        }
        else if (keyCode === 80) {
            player.changeShape('diamond');

            shapesBar.querySelectorAll('.option')
                .forEach(option => option.classList.remove('active'));
            shapesBar.querySelector('.diam').classList.add('active');
        }
        else {
            if (inMenu === false && inStartMenu === false) {
                if (controlsDisplay.classList.contains('inactive')) {
                    pauseMenu.classList.remove('inactive');
                    scoreAndHealthBar.classList.add('inactive');
                    hintsBar.classList.add('inactive');
                    clearTimeout(spawner);
                    gameStopped = true;
                    inMenu = true;
                }
            }
            else if (inMenu === true && inStartMenu === false) {
                if (controlsDisplay.classList.contains('inactive')) {
                    pauseMenu.classList.add('inactive');
                    scoreAndHealthBar.classList.remove('inactive');
                    hintsBar.classList.remove('inactive');
                    gameStopped = false;
                    inMenu = false;
                    spawner = setTimeout(function tick() {
                        spawnShape();
                        spawner = setTimeout(tick, spawnTime);
                    }, spawnTime);
                }

            }
        }
    }
});


// buttons event listeners setup

const startGameButton = startMenu.querySelector('.button-start');
startGameButton.addEventListener('click', (e) => {
    e.preventDefault();
    startMenu.classList.add('inactive');
    startGame();
});

const controlsDisplay = document.querySelector('.controls');
const controlsButtons = document.querySelectorAll('.button-controls');
controlsButtons.forEach(button => button.addEventListener('click', (e) => {
    e.preventDefault();
    controlsDisplay.classList.remove('inactive');
}));

const closeButton = document.querySelector('.close-button');
closeButton.addEventListener('click', () => {
    controlsDisplay.classList.add('inactive');
});

const resumeButton = pauseMenu.querySelector('.button-resume');
resumeButton.addEventListener('click', (e) => {
    e.preventDefault();
    gameStopped = !gameStopped;
    pauseMenu.classList.add('inactive');
    scoreAndHealthBar.classList.toggle('inactive');
    hintsBar.classList.toggle('inactive');
    inMenu = false;
    spawner = setTimeout(function tick() {
        spawnShape();
        spawner = setTimeout(tick, spawnTime);
    }, spawnTime);
});

const backToMenuButtons = document.querySelectorAll('.button-back');

backToMenuButtons.forEach(button => button.addEventListener('click', (e) => {
    e.preventDefault();
    cancelAnimationFrame(animationRequest);
    c.clearRect(0, 0, innerWidth, innerHeight);
    pauseMenu.classList.add('inactive');
    startMenu.classList.remove('inactive');
    endGameScreen.classList.add('inactive');
    inMenu = !inMenu;
    inStartMenu = true;
    gameStopped = true;
    if (player.score > localStorage.getItem('highscore')) {
        localStorage.setItem('highscore', player.score);
    }

    while (lifes.firstChild) {
        lifes.removeChild(lifes.firstChild);
    }

    highscore.innerHTML = `Highscore: ${localStorage.getItem('highscore')}`;
}));



playAgainButton.addEventListener('click', (e) => {
    e.preventDefault();
    endGameScreen.classList.add('inactive');
    startGame();
})



// game functions

function animate() {
    animationRequest = requestAnimationFrame(animate);
    if (gameStopped === false) {
        c.clearRect(0, 0, innerWidth, innerHeight);
        player.draw();
        spawnedShapes.forEach(shape => shape.update());
        spawnedParticles.forEach(particle => particle.update());
    }
}


function Game() {
    inMenu = false;
    inStartMenu = false;
    clearInterval(countToStart);
    startTimer.classList.add('inactive');
    scoreAndHealthBar.classList.remove('inactive');
    hintsBar.classList.remove('inactive');
    secondsToStart = 3;
    gameStopped = false;
    player = new Player(playerProperties.x, playerProperties.y, 'circle', '#011627', playerProperties.radius);
    gameScore.innerHTML = `Score: ${player.score}`;
    spawnedShapes = [];
    for (let i = 0; i < player.lifes; i++) {
        let img = document.createElement('img');
        img.classList.add('heart');
        img.src = 'img/heart.png';
        lifes.appendChild(img);
    }
    animate();
    spawnShape();
    spawner = setTimeout(function tick() {
        spawnShape();
        if (spawnTime >= minSpawnTime) {
            spawnTime = 3000 - player.numberOfCorrect * 50;
        }
        spawner = setTimeout(tick, spawnTime);
    }, spawnTime);
}

function spawnShape() {
    const rand = Math.floor(Math.random() * (4));
    const randColor = colorsKeys[Math.floor(Math.random() * colorsKeys.length)];

    if (rand === 0) {
        spawnedShapes.push(new Circle(window.innerWidth, playerProperties.y, 'circle', colors[randColor], playerProperties.radius, playerProperties.x))
    }
    else if (rand === 1) {
        spawnedShapes.push(new Rectangle(window.innerWidth, playerProperties.y, 'rectangle', colors[randColor], playerProperties.radius, playerProperties.x))
    }
    else if (rand === 2) {
        spawnedShapes.push(new Triangle(window.innerWidth, playerProperties.y, 'triangle', colors[randColor], playerProperties.radius, playerProperties.x))
    }
    else {
        spawnedShapes.push(new Diamond(window.innerWidth, playerProperties.y, 'diamond', colors[randColor], playerProperties.radius, playerProperties.x))
    }
}

function startGame() {
    c.clearRect(0, 0, innerWidth, innerHeight);
    startTimer.classList.remove('inactive');
    startTimer.innerHTML = secondsToStart;
    countToStart = setInterval(() => {
        secondsToStart--;
        if (secondsToStart === 0) {
            startTimer.innerHTML = 'START!';
        }
        else {
            startTimer.innerHTML = secondsToStart;
        }
    }, 1000);
    setTimeout(Game, 4000);
}

function endOfGame() {
    gameStopped = true;
    clearTimeout(spawner);
    spawnedShapes = [];
    spawnedParticles = [];
    cancelAnimationFrame(animationRequest);

    spawnTime = 3000;
    speed = 2;

    endGameScreen.classList.remove('inactive');
    scoreAndHealthBar.classList.add('inactive');
    hintsBar.classList.add('inactive');

    endScore.innerHTML = `Your score is: ${player.score}`;
    endCorrect.innerHTML = `Correct: ${player.numberOfCorrect}`;
    endInCorrect.innerHTML = `Incorrect: ${player.numberOfIncorrect}`;
    inStartMenu = true;

    colorsBar.querySelectorAll('.option')
        .forEach(option => option.classList.remove('active'));
    colorsBar.querySelector('.blue').classList.add('active');

    shapesBar.querySelectorAll('.option')
        .forEach(option => option.classList.remove('active'));
    shapesBar.querySelector('.circle').classList.add('active');


    if (player.score > localStorage.getItem('highscore')) {
        localStorage.setItem('highscore', player.score);
    }

    highscore.innerHTML = `Highscore: ${localStorage.getItem('highscore')}`;
    c.clearRect(0, 0, innerWidth, innerHeight);
}

