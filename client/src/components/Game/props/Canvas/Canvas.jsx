import React, { useRef, useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import "./Canvas.css";

const CanvasComponent = ({ roomCode, socket, isHost, isDrawer }) => {
  const canvasRef = useRef(null);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);

  const colors = [
    "#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00",
    "#FF00FF", "#00FFFF", "#FFFFFF", "#808080", "#FFA500",
  ];

  const brushSizes = [
    { size: 5, label: "Small" },
    { size: 10, label: "Medium" },
    { size: 20, label: "Large" },
  ];

  useEffect(() => {
    if (!socket) return;

    // Listen for drawing data from the server
    socket.on("drawing-data", (data) => {
      const ctx = canvasRef.current.getContext("2d");
      const { x, y, color, brushSize, type } = data;

      if (type === "begin") {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else if (type === "draw") {
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = color;
        ctx.lineCap = "round";
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (type === "stop") {
        ctx.closePath();
      }
    });

    // Clear canvas listener
    socket.on("clear-canvas", () => {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    });

    return () => {
      socket.off("drawing-data");
      socket.off("clear-canvas");
    };
  }, [socket]);

  const startDrawing = (e) => {
    if (!isDrawer) return; // Prevent non-drawers from drawing
    const ctx = canvasRef.current.getContext("2d");
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);

    // Emit drawing begin event
    socket.emit("drawing", { roomCode, x, y, color, brushSize, type: "begin" });
  };

  const draw = (e) => {
    if (!isDrawing || !isDrawer) return; // Prevent non-drawers from drawing
    const ctx = canvasRef.current.getContext("2d");
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineTo(x, y);
    ctx.stroke();

    // Emit drawing data
    socket.emit("drawing", { roomCode, x, y, color, brushSize, type: "draw" });
  };

  const stopDrawing = (e) => {
    if (!isDrawer) return; // Prevent non-drawers from drawing
    const ctx = canvasRef.current.getContext("2d");
    ctx.closePath();
    setIsDrawing(false);

    // Emit stop drawing event
    socket.emit("drawing", { roomCode, type: "stop" });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Emit clear canvas event
    socket.emit("clear-canvas", { roomCode });
  };

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        className="canvas"
        width={800}
        height={500}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />

      {isDrawer && (
        <div className="toolbar">
          <div className="colors">
            {colors.map((c, idx) => (
              <div
                key={idx}
                className={`color ${color === c ? "active" : ""}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>

          <div className="brush-sizes">
            {brushSizes.map(({ size, label }, idx) => (
              <div
                key={idx}
                className={`brush ${brushSize === size ? "active" : ""}`}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: brushSize === size ? color : "#ccc",
                }}
                onClick={() => setBrushSize(size)}
                title={label}
              />
            ))}
          </div>

          {isDrawer && (
            <button className="clear-button" onClick={clearCanvas}>
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CanvasComponent;
