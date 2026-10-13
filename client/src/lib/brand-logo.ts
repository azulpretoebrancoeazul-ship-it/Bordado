export const MAX_BRAND_LOGO_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_BRAND_LOGO_UPLOAD_BYTES = 950 * 1024;

const ALLOWED_LOGO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function prepareBrandLogo(file: File): Promise<string> {
  if (!ALLOWED_LOGO_TYPES.has(file.type)) {
    throw new Error("Escolha uma imagem PNG, JPG ou WEBP.");
  }
  if (file.size > MAX_BRAND_LOGO_FILE_BYTES) {
    throw new Error("A imagem precisa ter até 10 MB.");
  }

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  try {
    image.src = objectUrl;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 40_000_000) {
      throw new Error("A imagem é grande demais para ser usada como logotipo.");
    }

    let maxDimension = 900;
    let dataUrl = "";
    while (maxDimension >= 200) {
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Não foi possível preparar esta imagem.");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      dataUrl = canvas.toDataURL("image/webp", 0.82);
      if (!dataUrl.startsWith("data:image/webp")) {
        context.fillStyle = "#ffffff";
        context.globalCompositeOperation = "destination-over";
        context.fillRect(0, 0, canvas.width, canvas.height);
        dataUrl = canvas.toDataURL("image/jpeg", 0.82);
      }
      if (dataUrl.length <= MAX_BRAND_LOGO_UPLOAD_BYTES * 1.4) return dataUrl;
      maxDimension = Math.floor(maxDimension * 0.72);
    }
    throw new Error("A imagem não pôde ser reduzida o suficiente. Escolha uma imagem menor ou mais simples.");
  } catch (error) {
    if (error instanceof Error && error.message) throw error;
    throw new Error("Não foi possível abrir esta imagem. Tente um arquivo PNG, JPG ou WEBP.");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
