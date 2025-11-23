// Tamaño fijo para todos los lienzos (las dos entradas y el resultado)
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 300;

let image1Loaded = false;
let image2Loaded = false;

window.addEventListener("DOMContentLoaded", () => {
  const canvasIds = ["canvasInput1", "canvasInput2", "canvasOutput"];
  canvasIds.forEach((id) => {
    const c = document.getElementById(id);
    c.width = CANVAS_WIDTH;
    c.height = CANVAS_HEIGHT;
  });

  const fileInput1 = document.getElementById("fileInput1");
  const fileInput2 = document.getElementById("fileInput2");

  fileInput1.addEventListener("change", (e) =>
    handleFileChange(e, "canvasInput1", 1)
  );
  fileInput2.addEventListener("change", (e) =>
    handleFileChange(e, "canvasInput2", 2)
  );

  // Botones de operaciones
  document.getElementById("btnAdd").addEventListener("click", onAdd);
  document.getElementById("btnSub").addEventListener("click", onSub);
  document.getElementById("btnAnd").addEventListener("click", onAnd);
  document.getElementById("btnOr").addEventListener("click", onOr);
  document.getElementById("btnXor").addEventListener("click", onXor);
  document.getElementById("btnBlend").addEventListener("click", onBlend);

  // Slider de alpha
  const alphaSlider = document.getElementById("alphaSlider");
  const alphaValue = document.getElementById("alphaValue");
  alphaSlider.addEventListener("input", () => {
    alphaValue.textContent = Number(alphaSlider.value).toFixed(2);
  });

  setStatus(
    "Carga dos imágenes (idealmente del mismo tamaño similar) y luego aplica una operación."
  );
});

function setStatus(text) {
  document.getElementById("status").textContent = text;
}

function handleFileChange(event, canvasId, index) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  const img = new Image();

  reader.onload = (e) => {
    img.onload = () => {
      const canvas = document.getElementById(canvasId);
      const ctx = canvas.getContext("2d");

      // Escalado manteniendo proporción, centrado en el canvas
      const scale = Math.min(
        CANVAS_WIDTH / img.width,
        CANVAS_HEIGHT / img.height
      );
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      const offsetX = (CANVAS_WIDTH - drawWidth) / 2;
      const offsetY = (CANVAS_HEIGHT - drawHeight) / 2;

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      if (index === 1) {
        image1Loaded = true;
      } else if (index === 2) {
        image2Loaded = true;
      }

      setStatus(
        "Imágenes cargadas correctamente. Ahora puedes aplicar una operación."
      );
    };
    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

function ensureImagesLoaded() {
  if (!image1Loaded || !image2Loaded) {
    alert("Por favor, carga las dos imágenes antes de aplicar la operación.");
    return false;
  }
  return true;
}

// Utilidad para leer las dos imágenes como cv.Mat y devolverlas
function getInputMats() {
  const src1 = cv.imread("canvasInput1");
  const src2 = cv.imread("canvasInput2");
  return { src1, src2 };
}

// Mostrar y limpiar memoria
function showResult(dst) {
  cv.imshow("canvasOutput", dst);
  dst.delete();
}

// ===== Operaciones =====

function onAdd() {
  if (!ensureImagesLoaded()) return;

  const { src1, src2 } = getInputMats();
  const dst = new cv.Mat();

  cv.add(src1, src2, dst); // suma elemento a elemento
  showResult(dst);

  src1.delete();
  src2.delete();
  setStatus("Operación: Suma de imágenes (cv.add).");
}

function onSub() {
  if (!ensureImagesLoaded()) return;

  const { src1, src2 } = getInputMats();
  const dst = new cv.Mat();

  // img1 - img2
  cv.subtract(src1, src2, dst);
  showResult(dst);

  src1.delete();
  src2.delete();
  setStatus("Operación: Resta de imágenes (cv.subtract).");
}

function onAnd() {
  if (!ensureImagesLoaded()) return;

  const { src1, src2 } = getInputMats();
  const dst = new cv.Mat();

  cv.bitwise_and(src1, src2, dst);
  showResult(dst);

  src1.delete();
  src2.delete();
  setStatus("Operación: AND bit a bit (cv.bitwise_and).");
}

function onOr() {
  if (!ensureImagesLoaded()) return;

  const { src1, src2 } = getInputMats();
  const dst = new cv.Mat();

  cv.bitwise_or(src1, src2, dst);
  showResult(dst);

  src1.delete();
  src2.delete();
  setStatus("Operación: OR bit a bit (cv.bitwise_or).");
}

function onXor() {
  if (!ensureImagesLoaded()) return;

  const { src1, src2 } = getInputMats();
  const dst = new cv.Mat();

  cv.bitwise_xor(src1, src2, dst);
  showResult(dst);

  src1.delete();
  src2.delete();
  setStatus("Operación: XOR bit a bit (cv.bitwise_xor).");
}

function onBlend() {
  if (!ensureImagesLoaded()) return;

  const alpha = parseFloat(document.getElementById("alphaSlider").value);
  const beta = 1.0 - alpha;
  const gamma = 0.0;

  const { src1, src2 } = getInputMats();
  const dst = new cv.Mat();

  // dst = src1 * alpha + src2 * beta + gamma
  cv.addWeighted(src1, alpha, src2, beta, gamma, dst);
  showResult(dst);

  src1.delete();
  src2.delete();
  setStatus(
    `Operación: Blend (cv.addWeighted) con α=${alpha.toFixed(
      2
    )} y β=${beta.toFixed(2)}.`
  );
}
