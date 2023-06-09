// Load the face detection and face expression recognition models.
async function loadModels() {
  const modelBaseUrl = "models/";
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri(modelBaseUrl);
    await faceapi.nets.faceExpressionNet.loadFromUri(modelBaseUrl);
    console.log("Models loaded successfully");
  } catch (error) {
    console.error("Error loading models:", error);
  }
}

// Initialize the webcam.
async function initializeWebcam() {
  const videoElement = document.getElementById("video");

  // Request permission to use the webcam.
  const mediaStream = await navigator.mediaDevices.getUserMedia({ video: {} });
  videoElement.srcObject = mediaStream;
  videoElement.play();

  return new Promise((resolve) => {
    videoElement.onloadedmetadata = () => resolve(videoElement);
  });
}

// Detect faces and expressions using the face-api.js library.
async function detectFacesAndExpressions(videoElement) {
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 160 });
  const detections = await faceapi
    .detectAllFaces(videoElement, options)
    .withFaceExpressions();
  return detections;
}

// Display the counts for different emotions.
function displayEmotionCounts(detections) {
  const emotionCounts = {
    happy: 0,
    sad: 0,
    angry: 0,
    disgusted: 0,
    surprised: 0,
    fearful: 0,
    neutral: 0,
  };

  for (const detection of detections) {
    const { expressions } = detection;

    const maxEmotion = Object.keys(expressions).reduce((a, b) =>
      expressions[a] > expressions[b] ? a : b
    );

    if (expressions[maxEmotion] > 0.7) {
      emotionCounts[maxEmotion]++;
    }
  }

  const resultElement = document.getElementById("result");
  resultElement.innerHTML = `
    Number of happy: ${emotionCounts.happy}<br>
    Number of sad: ${emotionCounts.sad}<br>
    Number of angry: ${emotionCounts.angry}<br>
    Number of disgusted: ${emotionCounts.disgusted}<br>
    Number of surprised: ${emotionCounts.surprised}<br>
    Number of fearful: ${emotionCounts.fearful}<br>
    Number of neutral: ${emotionCounts.neutral}
  `;
}

// Run the emotion detection process.
async function runEmotionDetection() {
  // Load the face-api.js models.
  await loadModels();

  // Initialize the webcam.
  const videoElement = await initializeWebcam();

  // Continuously detect emotions and update the result.
  setInterval(async () => {
    const detections = await detectFacesAndExpressions(videoElement);
    displayEmotionCounts(detections);
  }, 1000);
}

// Run the emotion detection process when the page is loaded.
window.addEventListener("load", runEmotionDetection);
