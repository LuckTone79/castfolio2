"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface CropRect { x: number; y: number; w: number; h: number }

type DragHandle =
  | "tl" | "tc" | "tr"
  | "ml" | "mr"
  | "bl" | "bc" | "br"
  | "move"
  | null;

interface DragState {
  handle: DragHandle;
  startX: number;
  startY: number;
  startCrop: CropRect;
}

// ── Constants ──────────────────────────────────────────────────────────────
const HANDLE_HALF = 5;    // handle square half-size in canvas px
const MIN_CROP    = 20;   // minimum crop dimension in canvas px
const CANVAS_W    = 360;  // fixed canvas width
const CANVAS_MAX_H = 260; // max canvas height (tall images capped here)

// ── Utilities ──────────────────────────────────────────────────────────────
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function getHandles(c: CropRect): Array<{ id: DragHandle; cx: number; cy: number }> {
  return [
    { id: "tl", cx: c.x,           cy: c.y         },
    { id: "tc", cx: c.x + c.w / 2, cy: c.y         },
    { id: "tr", cx: c.x + c.w,     cy: c.y         },
    { id: "ml", cx: c.x,           cy: c.y + c.h/2 },
    { id: "mr", cx: c.x + c.w,     cy: c.y + c.h/2 },
    { id: "bl", cx: c.x,           cy: c.y + c.h   },
    { id: "bc", cx: c.x + c.w / 2, cy: c.y + c.h   },
    { id: "br", cx: c.x + c.w,     cy: c.y + c.h   },
  ];
}

function hitTest(crop: CropRect, mx: number, my: number): DragHandle {
  for (const { id, cx, cy } of getHandles(crop)) {
    if (Math.abs(mx - cx) <= HANDLE_HALF + 3 && Math.abs(my - cy) <= HANDLE_HALF + 3) {
      return id;
    }
  }
  if (mx >= crop.x && mx <= crop.x + crop.w && my >= crop.y && my <= crop.y + crop.h) {
    return "move";
  }
  return null;
}

const CURSOR_MAP: Record<string, string> = {
  tl: "nw-resize", tc: "n-resize",  tr: "ne-resize",
  ml: "w-resize",                    mr: "e-resize",
  bl: "sw-resize", bc: "s-resize",  br: "se-resize",
  move: "move",
};

function redraw(canvas: HTMLCanvasElement, img: HTMLImageElement, crop: CropRect) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width: cw, height: ch } = canvas;

  // Draw source image (fills canvas)
  ctx.drawImage(img, 0, 0, cw, ch);

  // Semi-transparent dark overlay around the crop window (4 rects)
  ctx.fillStyle = "rgba(0,0,0,0.52)";
  ctx.fillRect(0,           0,           cw,           crop.y              );
  ctx.fillRect(0,           crop.y+crop.h, cw,         ch - crop.y - crop.h);
  ctx.fillRect(0,           crop.y,      crop.x,        crop.h              );
  ctx.fillRect(crop.x+crop.w, crop.y,   cw-crop.x-crop.w, crop.h           );

  // Crop-window border
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth   = 1.5;
  ctx.strokeRect(crop.x + 0.5, crop.y + 0.5, crop.w - 1, crop.h - 1);

  // Rule-of-thirds guide lines
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth   = 0.7;
  for (let i = 1; i <= 2; i++) {
    const gx = crop.x + (crop.w / 3) * i;
    const gy = crop.y + (crop.h / 3) * i;
    ctx.beginPath(); ctx.moveTo(gx, crop.y); ctx.lineTo(gx, crop.y + crop.h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(crop.x, gy); ctx.lineTo(crop.x + crop.w, gy); ctx.stroke();
  }

  // Resize handles
  for (const { cx, cy } of getHandles(crop)) {
    ctx.fillStyle   = "#ffffff";
    ctx.fillRect(cx - HANDLE_HALF, cy - HANDLE_HALF, HANDLE_HALF * 2, HANDLE_HALF * 2);
    ctx.strokeStyle = "#777777";
    ctx.lineWidth   = 1;
    ctx.strokeRect(cx - HANDLE_HALF, cy - HANDLE_HALF, HANDLE_HALF * 2, HANDLE_HALF * 2);
  }
}

// ── Component ──────────────────────────────────────────────────────────────
export interface ImageCropEditorProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** Output canvas width in pixels (default 900) */
  outputWidth?: number;
  /** Output canvas height in pixels (default 600) */
  outputHeight?: number;
}

export function ImageCropEditor({
  label,
  value,
  onChange,
  outputWidth  = 900,
  outputHeight = 600,
}: ImageCropEditorProps) {
  const [rawDataUrl, setRawDataUrl] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isApplied, setIsApplied]   = useState(false);

  // Refs: mutable state that must NOT trigger re-renders
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement | null>(null);
  const cropRef   = useRef<CropRect>({ x: 0, y: 0, w: 0, h: 0 });
  const dragRef   = useRef<DragState | null>(null);

  // ── Load image onto canvas after rawDataUrl state change ────────────────
  // Using useEffect ensures the canvas is already mounted in the DOM
  useEffect(() => {
    if (!rawDataUrl) return;
    const img = new window.Image();
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Size canvas to image aspect ratio (width fixed, height adaptive)
      const aspect = img.naturalWidth / img.naturalHeight;
      canvas.width  = CANVAS_W;
      canvas.height = Math.min(CANVAS_MAX_H, Math.round(CANVAS_W / aspect));
      // Start with full-image crop selection
      const init: CropRect = { x: 0, y: 0, w: canvas.width, h: canvas.height };
      cropRef.current = init;
      redraw(canvas, img, init);
    };
    img.src = rawDataUrl;
  }, [rawDataUrl]);

  // ── File loading (from input or drop) ──────────────────────────────────
  const onFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) { setRawDataUrl(result); setIsApplied(false); }
    };
    reader.readAsDataURL(file);
  }, []);

  // ── Drag & drop ────────────────────────────────────────────────────────
  const onDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); }, []);
  const onDragLeave = useCallback(() => setIsDragOver(false), []);
  const onDrop      = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }, [onFile]);

  // ── Mouse position helper ──────────────────────────────────────────────
  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width)  * c.width,
      y: ((e.clientY - r.top)  / r.height) * c.height,
    };
  };

  // ── Canvas mouse events ────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const { x, y } = getCanvasPos(e);
    const handle = hitTest(cropRef.current, x, y);
    if (handle) {
      dragRef.current = { handle, startX: x, startY: y, startCrop: { ...cropRef.current } };
    }
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img) return;

    const { x, y } = getCanvasPos(e);

    // Update cursor based on hover or active drag handle
    const activeHandle = dragRef.current?.handle ?? hitTest(cropRef.current, x, y);
    canvas.style.cursor = activeHandle ? (CURSOR_MAP[activeHandle] ?? "default") : "default";

    if (!dragRef.current) return;

    const { handle, startX, startY, startCrop: sc } = dragRef.current;
    const dx = x - startX;
    const dy = y - startY;
    const cw = canvas.width;
    const ch = canvas.height;

    let nx = sc.x, ny = sc.y, nw = sc.w, nh = sc.h;

    if (handle === "move") {
      nx = clamp(sc.x + dx, 0, cw - sc.w);
      ny = clamp(sc.y + dy, 0, ch - sc.h);
    } else {
      // Top edge
      if (handle === "tl" || handle === "tc" || handle === "tr") {
        const newY = clamp(sc.y + dy, 0, sc.y + sc.h - MIN_CROP);
        nh = sc.y + sc.h - newY;
        ny = newY;
      }
      // Bottom edge
      if (handle === "bl" || handle === "bc" || handle === "br") {
        nh = clamp(sc.h + dy, MIN_CROP, ch - sc.y);
      }
      // Left edge
      if (handle === "tl" || handle === "ml" || handle === "bl") {
        const newX = clamp(sc.x + dx, 0, sc.x + sc.w - MIN_CROP);
        nw = sc.x + sc.w - newX;
        nx = newX;
      }
      // Right edge
      if (handle === "tr" || handle === "mr" || handle === "br") {
        nw = clamp(sc.w + dx, MIN_CROP, cw - sc.x);
      }
    }

    const newCrop: CropRect = { x: nx, y: ny, w: nw, h: nh };
    cropRef.current = newCrop;
    setIsApplied(false);
    redraw(canvas, img, newCrop);
  };

  const onMouseUp = () => { dragRef.current = null; };

  // ── Apply crop to output canvas ────────────────────────────────────────
  const applyCrop = useCallback(() => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img) return;

    const crop  = cropRef.current;
    const scaleX = img.naturalWidth  / canvas.width;
    const scaleY = img.naturalHeight / canvas.height;

    const out = document.createElement("canvas");
    out.width  = outputWidth;
    out.height = outputHeight;
    out.getContext("2d")!.drawImage(
      img,
      crop.x * scaleX, crop.y * scaleY, crop.w * scaleX, crop.h * scaleY,
      0, 0, outputWidth, outputHeight,
    );
    onChange(out.toDataURL("image/jpeg", 0.9));
    setIsApplied(true);
  }, [onChange, outputWidth, outputHeight]);

  return (
    <div className="rounded-lg border border-gray-800 p-3 space-y-2">
      <p className="text-xs text-gray-400">{label}</p>

      {!rawDataUrl ? (
        /* ── Upload drop zone ────────────────────────────────────────── */
        <label
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={[
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed",
            "py-7 cursor-pointer transition-colors",
            isDragOver
              ? "border-blue-400 bg-blue-950/40"
              : "border-gray-700 hover:border-gray-500",
          ].join(" ")}
        >
          <Upload size={22} className="text-gray-500" />
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            이미지를 끌어다 놓거나<br />클릭하여 업로드
          </p>
          <p className="text-[10px] text-gray-600">JPG · PNG · WEBP</p>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
        </label>
      ) : (
        /* ── Visual crop editor ──────────────────────────────────────── */
        <div className="space-y-2">
          <div className="rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
            <canvas
              ref={canvasRef}
              className="block w-full select-none"
              style={{ touchAction: "none" }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={() => {
                onMouseUp();
                if (canvasRef.current) canvasRef.current.style.cursor = "default";
              }}
            />
          </div>

          <p className="text-[10px] text-gray-600 leading-relaxed">
            모서리·가장자리 핸들 드래그 → 영역 크기 조정 &nbsp;·&nbsp; 내부 드래그 → 이동
          </p>

          <div className="flex gap-2">
            <button
              onClick={applyCrop}
              className={[
                "flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2",
                "text-xs font-medium transition-colors",
                isApplied
                  ? "bg-green-900/60 text-green-300 border border-green-800"
                  : "bg-blue-600 hover:bg-blue-500 text-white",
              ].join(" ")}
            >
              {isApplied ? "✓ 적용됨" : "✂ 자르기 적용"}
            </button>
            <button
              onClick={() => { setRawDataUrl(""); setIsApplied(false); }}
              title="다른 이미지로 교체"
              className="rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
            >
              교체
            </button>
          </div>
        </div>
      )}

      {/* Current applied-image preview */}
      {value && (
        <div className="relative">
          <img
            src={value}
            alt="적용된 이미지"
            className="w-full rounded border border-gray-800 object-cover max-h-24"
          />
          <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-gray-400">
            적용된 이미지
          </span>
        </div>
      )}
    </div>
  );
}
