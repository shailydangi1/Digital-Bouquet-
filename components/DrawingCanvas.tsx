
import React, { useRef, useState, useEffect, useCallback } from 'react';

interface DrawingCanvasProps {
  onSave: (dataUrl: string) => void;
  flowerIndex: number;
}

const COLORS = [
  { name: 'Charcoal', value: '#374151' },
  { name: 'Rose', value: '#E11D48' },
  { name: 'Sunflower', value: '#FACC15' },
  { name: 'Leaf', value: '#22C55E' },
  { name: 'Sky', value: '#3B82F6' },
  { name: 'Lavender', value: '#A855F7' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Pink', value: '#EC4899' },
];

const BRUSH_SIZES = [
  { label: 'S', value: 2 },
  { label: 'M', value: 5 },
  { label: 'L', value: 10 },
  { label: 'XL', value: 18 },
];

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onSave, flowerIndex }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [currentColor, setCurrentColor] = useState(COLORS[0].value);
  const [brushSize, setBrushSize] = useState(5);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.width * 0.6; // Maintain aspect ratio
    }

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    
    // Fill background with white for the save to work well with AI
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [currentColor, brushSize]);

  useEffect(() => {
    initCanvas();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, []);

  // Update context when color or size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
    }
  }, [currentColor, brushSize]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
    setHasContent(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => setIsDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    setHasContent(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasContent) return;
    onSave(canvas.toDataURL('image/png'));
    clear();
  };

  return (
    <div className="w-full max-w-3xl flex flex-col gap-4 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border-4 border-pink-50 p-2">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-[1.5rem]">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">Color</span>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCurrentColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    currentColor === c.value ? 'scale-125 border-pink-500 shadow-md' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">Brush</span>
            <div className="flex bg-white rounded-full p-1 border border-gray-200">
              {BRUSH_SIZES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setBrushSize(s.value)}
                  className={`w-10 h-8 rounded-full text-xs font-bold transition-all ${
                    brushSize === s.value ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={clear}
            className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest px-4 py-2"
          >
            Reset Sketch
          </button>
        </div>
        
        <div className="relative bg-white">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full cursor-crosshair touch-none"
          />
          {!hasContent && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <p className="font-serif italic text-2xl text-gray-400">Sketch flower #{flowerIndex + 1} here...</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50/50 rounded-b-[1.5rem] flex justify-center">
          <button
            onClick={handleSave}
            disabled={!hasContent}
            className={`group px-12 py-4 rounded-full font-bold text-lg transition-all shadow-xl flex items-center gap-3 ${
              hasContent 
              ? 'bg-pink-500 text-white hover:bg-pink-600 hover:-translate-y-1' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Finish Flower {flowerIndex + 1}
            <svg className={`w-5 h-5 transition-transform ${hasContent ? 'group-hover:translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawingCanvas;
