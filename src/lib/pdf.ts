import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateQRCardPdf({
  nameEn,
  url,
  qrPngBuffer,
}: {
  nameEn: string;
  url: string;
  qrPngBuffer: Buffer;
}): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([300, 400]);
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // White background
  page.drawRectangle({
    x: 0, y: 0, width, height,
    color: rgb(1, 1, 1),
  });

  // Name at top
  const nameSize = 16;
  const nameWidth = font.widthOfTextAtSize(nameEn, nameSize);
  page.drawText(nameEn, {
    x: (width - nameWidth) / 2,
    y: height - 50,
    size: nameSize,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  // QR Code image
  const qrImage = await pdfDoc.embedPng(qrPngBuffer);
  const qrSize = 180;
  page.drawImage(qrImage, {
    x: (width - qrSize) / 2,
    y: (height - qrSize) / 2 - 10,
    width: qrSize,
    height: qrSize,
  });

  // URL at bottom
  const urlSize = 8;
  const urlWidth = fontRegular.widthOfTextAtSize(url, urlSize);
  page.drawText(url, {
    x: Math.max(10, (width - urlWidth) / 2),
    y: 30,
    size: urlSize,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
