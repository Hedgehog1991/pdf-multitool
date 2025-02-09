import React from "react";

import PDFPageExtractor from "./pdfextractor";
import PDFMerger from "./pdfmerger";

export function FirstApplication() {
  return (
    <div>
      <PDFPageExtractor />
      <PDFMerger />
    </div>
  );
}
