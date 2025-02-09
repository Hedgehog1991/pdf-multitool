import React, { useState } from "react";

const Dropzone = ({ onFileDrop }) => {
  const [highlight, setHighlight] = useState(false);

  const handleDragOver = (event) => {
    event.preventDefault();
    setHighlight(true);
  };

  const handleDragLeave = () => {
    setHighlight(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setHighlight(false);

    const file = event.dataTransfer.files[0];
    if (file && onFileDrop) {
      onFileDrop(file);
    }
  };
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        width: "300px",
        height: "200px",
        textAlign: "center",
        marginTop: "50px",
        border: "2px solid black",
        backgroundColor: highlight ? "#d4f1c5" : "#ffffff", // Change background color based on highlight state
      }}
    >
      {highlight ? "Release to drop the file" : "Drag and drop a file here"}
    </div>
  );
};
export default Dropzone;
