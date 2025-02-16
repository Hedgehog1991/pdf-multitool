import React, { useState } from "react";
import * as PDFLib from "pdf-lib";
import { useDropzone } from "react-dropzone";

function PDFPageExtractor() {
  const [haveFile, setHaveFile] = useState(false);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const [spec, setSpec] = useState("");
  const [downloadURL, setDownloadURL] = useState(null);
  const [downloadInfo, setDownloadInfo] = useState("");

  const appendBeforeExtension = (filename, suffix) => {
    const whereDot = filename.lastIndexOf(".");
    if (whereDot === -1) return filename + suffix;
    return (
      filename.substring(0, whereDot) + suffix + filename.substring(whereDot)
    );
  };

  const myArrayBuffer = async (blob) => {
    return new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.readAsArrayBuffer(blob);
    });
  };

  const pageNumberList = (spec, n) => {
    spec = spec.replace(/\s+/g, "").replace(/–/g, "-").replace(/-+/g, "-");
    const ranges = spec.split(",");
    const newOrder = [];
    for (let range of ranges) {
      if (!range.includes("-")) range = `${range}-${range}`;
      let [before, after] = range.split("-");
      before = Number(before) || 1;
      after = Number(after) || n;
      const sign = before <= after ? 1 : -1;
      for (let i = before; ; i += sign) {
        newOrder.push(i > 0 ? i - 1 : n);
        if (i === after) break;
      }
    }
    return newOrder;
  };

  const newPdfBytes = async (pdfDoc, spec) => {
    const pages = pdfDoc.getPages();
    const n = pages.length;
    const { width, height } = pages[n > 1 ? 1 : 0].getSize();
    pdfDoc.addPage([width, height]);

    const newOrder = pageNumberList(spec, n);

    const newDoc = await PDFLib.PDFDocument.create();
    const newPages = await newDoc.copyPages(pdfDoc, newOrder);
    for (let newPage of newPages) newDoc.addPage(newPage);

    return await newDoc.save();
  };

  const handleDrop = async (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    setDownloadInfo(`${selectedFile.name} (getting size...)`);

    try {
      const existingPdfBytes = await myArrayBuffer(selectedFile);

      setDownloadInfo(
        `${selectedFile.name} (${(existingPdfBytes.byteLength / 1024).toFixed(1)} KB) (reading...)`,
      );

      setNewFileName(appendBeforeExtension(selectedFile.name, "-modified"));

      const loadedPdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
      setPdfDoc(loadedPdfDoc);
      setDownloadInfo(
        `${selectedFile.name} (${(existingPdfBytes.byteLength / 1024).toFixed(1)} KB)`,
      );
      setSpec(`1-${loadedPdfDoc.getPages().length}`);
      setHaveFile(true);
    } catch (error) {
      console.error("Error handling file:", error);
      setDownloadInfo("Error reading file.");
    }
  };

  const generateOutput = async () => {
    if (!haveFile || !pdfDoc) return;

    setDownloadInfo(`(extracting pages...)`);

    try {
      const pdfBytes = await newPdfBytes(pdfDoc, spec);
      setDownloadInfo(` (${(pdfBytes.length / 1024).toFixed(1)} KB)`);

      const outputBlob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = window.URL.createObjectURL(outputBlob);
      setDownloadURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setDownloadInfo("Error generating PDF.");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: "application/pdf",
    onDrop: handleDrop,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        //Input Box
        style={{
          display: "flex",
          flexDirection: "column",
          width: "40%",
          height: "10rem",
          border: "1px dotted grey",
          margin: "auto",
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here...</p>
        ) : (
          <p>Drag and drop your PDF here, or click to select a file.</p>
        )}
        <p>{downloadInfo}</p>
      </div>

      <div
        //Page Selection
        style={{
          border: "1px dashed grey",
          margin: "1rem auto",
          textAlign: "center",
          width: "40%",
        }}
      >
        <p>
          Enter page ranges, like "1" or "2-" or "1-2,0,6-3"
          <br />
          ("0" means a new blank page)
        </p>
        <input
          type="text"
          value={spec}
          onChange={(e) => setSpec(e.target.value)}
        />
        <button onClick={generateOutput} disabled={!haveFile}>
          Done
        </button>
      </div>
      <div
        //Output Box
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          width: "40%",
          height: "10rem",
          border: "1px dotted grey",
          margin: "auto",
          cursor: "pointer",
        }}
      >
        <div>
          {downloadURL && (
            <div>
              <a href={downloadURL} download={newFileName}>
                {newFileName}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PDFPageExtractor;
