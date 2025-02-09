import React from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const GeneratePdf = () => {
  const handleGeneratePdf = async () => {
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 30;
    page.drawText("This is a pdf", {
      x: 50,
      y: height - 4 * fontSize,
      size: fontSize,
      font: timesRomanFont,
      color: rgb(0, 0.53, 0.71),
    });

    const pdfBytes = await pdfDoc.save();

    // Trigger file download
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "example.pdf";
    link.click();
  };

  return (
    <button onClick={handleGeneratePdf} style={{ marginTop: "20px" }}>
      Generate PDF
    </button>
  );
};

export default GeneratePdf;
