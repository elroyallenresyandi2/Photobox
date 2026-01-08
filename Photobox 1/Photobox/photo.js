const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const timer = document.getElementById("timer");
const strip = document.getElementById("strip");
const ctx = canvas.getContext("2d");

let photos = [];
let maxPhotos = 3;

// Start camera
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
}

// Countdown
function countdown(sec) {
  return new Promise(resolve => {
    timer.style.display = "flex";
    timer.textContent = sec;

    const interval = setInterval(() => {
      sec--;
      timer.textContent = sec;
      if (sec === 0) {
        clearInterval(interval);
        timer.style.display = "none";
        resolve();
      }
    }, 1000);
  });
}

// Start photobox session
async function startSession() {
  photos = [];
  strip.innerHTML = "";
  document.getElementById("qr").innerHTML = "";

  maxPhotos = Number(document.getElementById("count").value);

  for (let i = 0; i < maxPhotos; i++) {
    await countdown(3);      // countdown 3-2-1
    await delay(500);       // ⏸️ jeda 0,5 detik
    takePhoto();             // ambil foto
  }

  generateQR();
}

// Take photo
function takePhoto() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imgData = canvas.toDataURL("image/png");
  photos.push(imgData);

  const img = document.createElement("img");
  img.src = imgData;
  strip.appendChild(img);
}

// Generate QR
function generateQR() {
  const data = JSON.stringify(photos);
  QRCode.toCanvas(document.createElement("canvas"), data, (err, cvs) => {
    document.getElementById("qr").appendChild(cvs);
    document.getElementById("qr").insertAdjacentHTML(
      "afterbegin",
      "<p>Scan QR to get your photos</p>"
    );
  });
}
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
window.addEventListener("load", () => {
  startCamera();
});
const frameSelect = document.getElementById("frameSelect");
const frameOverlay = document.getElementById("frameOverlay");
let selectedFrame = null;
frameSelect.addEventListener("change", () => {
  selectedFrame = frameSelect.value;
  frameOverlay.src = selectedFrame;
});
function takePhoto() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (selectedFrame) {
    const frameImg = new Image();
    frameImg.src = selectedFrame;
    frameImg.onload = () => {
      ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
      savePhoto();
    };
  } else {
    savePhoto();
  }
}
function savePhoto() {
  const imgData = canvas.toDataURL("image/png");
  photos.push(imgData);

  const img = document.createElement("img");
  img.src = imgData;
  strip.appendChild(img);
}
frameSelect.addEventListener("change", () => {
  const count = document.getElementById("count").value;

  if (count === "6") {
    selectedFrame = "frames/frame-6.png";
  }
});

function downloadStrip() {
  const stripCanvas = document.createElement("canvas");
  const ctxStrip = stripCanvas.getContext("2d");

  const imgCount = photos.length;
  const imgWidth = 800;
  const imgHeight = 1067;

  stripCanvas.width = imgWidth;
  stripCanvas.height = imgHeight * imgCount;

  let loaded = 0;

  photos.forEach((src, i) => {
    const img = new Image();
    img.onload = () => {
      ctxStrip.drawImage(
        img,
        0,
        i * imgHeight,
        imgWidth,
        imgHeight
      );

      loaded++;
      if (loaded === imgCount) {
        const link = document.createElement("a");
        link.download = "photobox-strip.png";
        link.href = stripCanvas.toDataURL("image/png");
        link.click();
      }
    };
    img.src = src;
  });
}
