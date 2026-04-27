import QRCode from "qrcode";

export async function generateQRPng(url: string, options?: { size?: number }): Promise<Buffer> {
  const size = options?.size || 300;
  const buffer = await QRCode.toBuffer(url, {
    type: "png",
    width: size,
    margin: 2,
    color: { dark: "#000000", light: "#FFFFFF" },
  });
  return buffer;
}

export async function generateQRSvg(url: string): Promise<string> {
  return QRCode.toString(url, { type: "svg", margin: 2 });
}

export async function generateQRDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, { width: 200, margin: 2 });
}
