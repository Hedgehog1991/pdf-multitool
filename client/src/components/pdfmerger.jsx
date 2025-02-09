import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { useDropzone } from "react-dropzone";

function PDFMerger() {
  const [pdf1, setPdf1] = useState(null);
  const [pdf2, setPdf2] = useState(null);
  const [downloadURL, setDownloadURL] = useState(null);

  const handleDrop = async (acceptedFiles, setPdfFile) => {
    if (acceptedFiles.length > 0) {
      setPdfFile(acceptedFiles[0]);
    }
  };

  const mergePDFs = async () => {
    if (!pdf1 || !pdf2) {
      alert("Please upload two PDF files before merging.");
      return;
    }

    const mergedPdf = await PDFDocument.create();

    for (const pdfFile of [pdf1, pdf2]) {
      const existingPdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const copiedPages = await mergedPdf.copyPages(
        pdfDoc,
        pdfDoc.getPageIndices(),
      );
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();
    const outputBlob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = window.URL.createObjectURL(outputBlob);
    setDownloadURL(url);
  };

  const renderDropZone = (label, pdfFile, setPdfFile) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: "application/pdf",
      onDrop: (acceptedFiles) => handleDrop(acceptedFiles, setPdfFile),
    });

    return (
      <div
        {...getRootProps()}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "40%",
          height: "10rem",
          border: "1px dotted grey",
          margin: "1rem auto",
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        <p>{label}</p>
        {pdfFile ? (
          <p>{pdfFile.name}</p>
        ) : isDragActive ? (
          <p>Drop here...</p>
        ) : (
          <p>Click or drag to upload PDF</p>
        )}
      </div>
    );
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>PDF Merger</h2>
      {renderDropZone("Upload First PDF", pdf1, setPdf1)}
      {renderDropZone("Upload Second PDF", pdf2, setPdf2)}
      <button onClick={mergePDFs} disabled={!pdf1 || !pdf2}>
        Merge PDFs
      </button>
      {downloadURL && (
        <div style={{ marginTop: "1rem" }}>
          <a href={downloadURL} download="MergedDocument.pdf">
            Download Merged PDF
          </a>
        </div>
      )}
    </div>
  );
}

export default PDFMerger;
