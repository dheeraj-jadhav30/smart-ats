import { PDFParse } from "pdf-parse";

export const extractTextFromPDF = async (buffer) => {
  const signature = buffer.toString("utf8", 0, 5);

  if (signature !== "%PDF-") {
    throw new Error("Invalid file format : not a legitimate PDF file");
  }

  const parser = new PDFParse({ data: buffer });
  const data = await parser.getText();
  await parser.destroy();

  const extractedText = data.text ? data.text.trim() : "";

  if (extractedText.length === 0) {
    throw new Error(
      "Uploaded PDF contains no extractable text. Scanned or image-only PDFs are not supported.",
    );
  }
  return extractedText;
};