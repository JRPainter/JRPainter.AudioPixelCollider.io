let ratio = 1.6; // 4:3 aspect ratio
let globeScale; // Scale factor

let mic; // Microphone input
let vol; // Volume level
let normVol; // Normalized volume level
let volSense = 100; // Volume sensitivity
let sensitivity = 0.5; // Sensitivity to volume changes
let sensitivitySlider; // Slider to adjust sensitivity
let alphaButton;
let startAudio = false; // Start audio flag

//Frequency variables
let fft; // Fast Fourier Transform
let spectrum; // Frequency spectrum
let waveform; // Waveform

let circles = [];
let bassEnergy;
let freqThreshold = 100;
let beatThreshold = 150;
let lastBeatTime = 0;
let randDir;
let newCircle;
let leftBlocker;
let rightBlocker;
let blockerY = window.innerHeight/2;

let invert;
let level;

let redOrigin;
let blueOrigin;
let redX;
let blueX;
let cannonHeight;
let wheelHeight;
let redTranslation;
let blueTranslation;

let leftWave;
let rightWave;

let shootAngle = 1;
let shootRotation = false;

let waveColor = 120;



function setup() {

    createCanvas(window.innerWidth, window.innerWidth / ratio);

    globeScale = min(width, height);
    redOrigin = height/2;
    blueOrigin = height/2;
    redX = 150;
    blueX = width - 150;
    blueCannonX = width - 75;
    cannonHeight = 50;
    wheelHeight = 10;
    redTranslation = true;
    blueTranslation = false;
    colorMode(HSB);
    getAudioContext().suspend();

    leftWave = width/4;
    rightWave = width*3/4;
    invert = false;


    if(shootAngle <= 1) {
        shootRotation = true;
    }
    shootAngle = random(1,19)/10;

// Create a slider to adjust sensitivity
sensitivitySlider = createSlider(0, 1, sensitivity, 0.01);
sensitivitySlider.id('sensitivitySlider'); // Assign an ID to the slider

alphaButton = createButton('Toggle Invert');
alphaButton.id('alphaButton');
alphaButton.mousePressed(() => {
    invert = !invert; 
  });


}

function draw() {
    background(0, 0, 0);

    

    if(startAudio){
        vol = mic.getLevel(); // Get volume level
        fft.analyze();
        volSense = sensitivitySlider.value(); // Get the sensitivity value from the slider
        normVol = vol * volSense; // Normalize volume
        console.log(normVol);
        bassEnergy = fft.getEnergy("bass");       
        level = map(normVol, 0, 0.15, 150, 250);




        

        randDir = Math.random() < 0.5;
        if (bassEnergy > freqThreshold && !invert){
        newCircle = new Circle(redX + level/2, redOrigin, level, level, color(0,100,100, 0.15), shootAngle, 2-shootAngle, false, false, level);
        } else if (bassEnergy <= freqThreshold && !invert){
        newCircle = new Circle(blueX - level/2, blueOrigin, level, level, color(240,100,100, 0.15), shootAngle, 2-shootAngle, true, true, level);
        }
        if (bassEnergy <= freqThreshold && invert){
        newCircle = new Circle(redX + level/2, redOrigin, level, level, color(0,100,100, 0.15), shootAngle, 2-shootAngle, false, false, level);
        } else if (bassEnergy > freqThreshold && invert){
        newCircle = new Circle(blueX - level/2, blueOrigin, level, level, color(240,100,100, 0.15), shootAngle, 2-shootAngle, true, true, level);
        }

        fill(0, 0, 50);
        noStroke();

        quad(0, redOrigin + cannonHeight/2, 0, redOrigin - cannonHeight/2, redX, redOrigin - cannonHeight/2, redX, redOrigin + cannonHeight/2);
        quad(width, blueOrigin + cannonHeight/2, width, blueOrigin - cannonHeight/2, blueX, blueOrigin - cannonHeight/2, blueX, blueOrigin + cannonHeight/2);

        fill(23, 80, 35)

        quad(0, redOrigin + cannonHeight/2, 0, redOrigin + cannonHeight/2 + wheelHeight, redX/2, redOrigin + cannonHeight/2 + wheelHeight, redX/2, redOrigin + cannonHeight/2);
        quad(0, redOrigin - cannonHeight/2, 0, redOrigin - cannonHeight/2 - wheelHeight, redX/2, redOrigin - cannonHeight/2 - wheelHeight, redX/2, redOrigin - cannonHeight/2);
        quad(width, blueOrigin + cannonHeight/2, width, blueOrigin + cannonHeight/2 + wheelHeight, blueCannonX, blueOrigin + cannonHeight/2 + wheelHeight, blueCannonX, blueOrigin + cannonHeight/2);
        quad(width, blueOrigin - cannonHeight/2, width, blueOrigin - cannonHeight/2 - wheelHeight, blueCannonX, blueOrigin - cannonHeight/2 - wheelHeight, blueCannonX, blueOrigin - cannonHeight/2);
        
        noStroke();
        fill(0,0,100);

        
        if(millis() - lastBeatTime >= (250*(125/60))){
            circles.push(newCircle);
            lastBeatTime = millis();
        }

        for (let i = 0; i < circles.length; i++) {
            circles[i].display();
        }

        spectrum = fft.analyze(); // Get frequency spectrum
        waveform = fft.waveform(); // Get waveform



        if(redTranslation && redOrigin > height/4) {
            redOrigin -= 1;
        }
        if (redTranslation && redOrigin <= height/4) {
            redTranslation = false;
        }
        if (!redTranslation && redOrigin < height - height/4) {
            redOrigin += 1;
        }
        if (!redTranslation && redOrigin >= height - height/4) {
            redTranslation = true;
        }
        if (blueTranslation && blueOrigin > height/4) {
            blueOrigin -= 1;
        }
        if (blueTranslation && blueOrigin <= height/4) {
            blueTranslation = false;
        }
        if (!blueTranslation && blueOrigin < height - height/4) {
            blueOrigin += 1;
        }
        if (!blueTranslation && blueOrigin >= height - height/4) {
            blueTranslation = true;
        }

        if (shootRotation && shootAngle < 1.9) {
            shootAngle += 0.01;
        }
        if (shootRotation && shootAngle >= 1.9) {
            shootRotation = false;
        }
        if (!shootRotation && shootAngle > 0.1) {
            shootAngle -= 0.01;
        }
        if (!shootRotation && shootAngle <= 0.1) {
            shootRotation = true;
        }
        

        waveForm(); // Draw waveform
        //spectrumF(); // Draw frequency spectrum






        

    }

    stroke(0);

}

function mousePressed(){
    getAudioContext().resume();
    if(!startAudio){
        mic = new p5.AudioIn();
        fft = new p5.FFT();
        fft.setInput(mic);
        mic.start();
        startAudio = true;
        
    }
}

function waveForm(){
    if(startAudio){
        //WAVEFORM VISUALIZATION-------------------------
        noFill();

        
        beginShape();
        for(let i = 0; i < waveform.length; i++){
            let x = map(i, 0, waveform.length, 0, height);
            let y = map(waveform[i], -1, 1, leftWave, rightWave);
            let strokeCol = map(waveform[i], -1, 1, 0, 360);
            let strokeSat = map(waveform[i], -1, 1, 0, 100);

            stroke(waveColor, 100, 100);
            strokeWeight(globeScale *0.01);
            
            vertex(y, x);
        }

        endShape();

    }
}

function spectrumF(){

    if(startAudio){
        for(let i = 0; i < spectrum.length; i++){

            let rectX = map(i, 0, spectrum.length, 0, width);
            let rectY = height;
            let rectW = globeScale*0.05;
            let rectH = -map(spectrum[i], 0, 255, 0, height);
            noStroke();
            fill(spectrum[i], 100, 100, 0.1);
            rect(rectX, rectY, rectW, rectH);
            let rectX2 = width - rectX - rectW;
            rect(rectX2, rectY, rectW, rectH);
        }
    }

}


function updateSize(circle) {
  circle.width = level;
  circle.height = level;
}


function redRect(redCircle) {
  if (waveColor >0) {
    waveColor -= 20;
  }
  if (rightWave < width) {
    rightWave += width/24;
    leftWave += width/24;
  }
      let beginningBeam = millis();
      let redCircleY = redCircle.y;
      let redCircleHeight = redCircle.height;
      if (millis() - beginningBeam <= 100) {
        fill(0,100,100);
        quad(redX, redOrigin + cannonHeight/2, redX, redOrigin - cannonHeight/2, width, redCircleY - redCircleHeight/2, width, redCircleY + redCircleHeight/2);
      }

}

function blueRect(blueCircle) {
  if (waveColor < 240) {
    waveColor += 20;
  }
  if (leftWave > 0) {
    rightWave -= width/24;
    leftWave -= width/24;
  }
  let beginningBeam = millis();
  let blueCircleY = blueCircle.y;
  let blueCircleHeight = blueCircle.height;
  if (millis() - beginningBeam <= 100) {
    fill(240,100,100);
    quad(0, blueCircleY + blueCircleHeight/2, 0, blueCircleY - blueCircleHeight/2, blueX, blueOrigin - cannonHeight/2, blueX, blueOrigin + cannonHeight/2);
  }
}



class Circle {

    constructor(x, y, width, height, color, xSpeed, ySpeed, xDirection, yDirection, volume) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = color;
      this.xSpeed = xSpeed;
      this.ySpeed = ySpeed;
      this.xDirection = xDirection;
      this.yDirection = yDirection;
      this.volume = volume;

      if (this.xDirection) {
        this.xSpeed = -this.xSpeed;
      }
      if (this.yDirection) {
        this.ySpeed = -this.ySpeed;
      }
    }

    display() {
      fill(this.color);
      ellipse(this.x, this.y, this.width, this.height);
      this.x += this.xSpeed;
      this.y += this.ySpeed;
      updateSize(this);
      
      if (this.x + this.width/2 <= 0) {
        blueRect(this);
        circles.splice(circles.indexOf(this), 1);
        this.this = null;
        
      }
      if (this.x - this.width/2 >= width) {
        redRect(this);
        circles.splice(circles.indexOf(this), 1);
        this.this = null;
      }

      if (this.y - this.height/2 <= 0 || this.y + this.height/2 >= height) {
        this.ySpeed = -this.ySpeed;
      }
      
      if (this.width == 0 && this.height == 0) {
        circles.splice(circles.indexOf(this), 1);
      }


    }

    
  }

/*
class Blob {

    constructor(x, y, radius) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.yoff = 0.0;
    }
  
    show() {
      push();
      translate(this.x,this.y);
      beginShape();
      let xoff = 0;
      for (let a = 0; a < TWO_PI; a += 0.1) {
        let offset = map(noise(xoff, this.yoff), 0, 1, -25, 25);
        let r = this.radius + offset;
        let x = r * cos(a);
        let y = r * sin(a);
        vertex(x, y);
        xoff += 0.1;
        //ellipse(x, y, 4, 4);
      }
      endShape();
  
      this.yoff += 0.01;
      pop();
    }
  }
    */