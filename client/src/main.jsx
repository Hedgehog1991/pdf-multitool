import React from "react";

import PDFPageExtractor from "./components/pdfextractor";
import PDFMerger from "./components/pdfmerger";

export function Main() {
  return (
    <div>
      <PDFPageExtractor />
      <PDFMerger />
    </div>
  );
}
