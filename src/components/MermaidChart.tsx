"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface MermaidChartProps {
    chart: string;
}

let chartCounter = 0;

const MIN_SCALE = 0.1;
const MAX_SCALE = 10;
const ZOOM_FACTOR = 1.15; // multiplicative so zoom feels uniform at all levels

export function MermaidChart({ chart }: MermaidChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgWrapRef   = useRef<HTMLDivElement>(null);

    const [error,    setError]    = useState<string | null>(null);
    const [rendered, setRendered] = useState(false);
    const [scaleDisplay, setScaleDisplay] = useState(100);

    // We control zoom/pan through the SVG's own viewBox — fully vector at every level
    const viewBox      = useRef({ x: 0, y: 0, w: 0, h: 0 });
    const naturalBox   = useRef({ w: 0, h: 0 }); // original SVG dimensions
    const dragging     = useRef(false);
    const dragLast     = useRef({ x: 0, y: 0 });
    const lastPinchDist = useRef<number | null>(null);

    // ── helpers ────────────────────────────────────────────────────────
    const getSvg = useCallback((): SVGSVGElement | null => {
        return svgWrapRef.current?.querySelector("svg") ?? null;
    }, []);

    const applyViewBox = useCallback(() => {
        const svg = getSvg();
        if (!svg) return;
        const { x, y, w, h } = viewBox.current;
        svg.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
        const scale = naturalBox.current.w / w;
        setScaleDisplay(Math.round(scale * 100));
    }, [getSvg]);

    const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
        const svg = getSvg();
        const el  = containerRef.current;
        if (!svg || !el) return;

        const rect = el.getBoundingClientRect();
        const vb   = viewBox.current;

        // Map screen point into SVG coordinate space
        const svgX = vb.x + ((cx - rect.left) / rect.width)  * vb.w;
        const svgY = vb.y + ((cy - rect.top)  / rect.height) * vb.h;

        const newW = vb.w / factor;
        const newH = vb.h / factor;

        // Clamp
        const currentScale = naturalBox.current.w / newW;
        if (currentScale < MIN_SCALE || currentScale > MAX_SCALE) return;

        // Zoom toward cursor: keep svgX/svgY at the same screen fraction
        const fracX = (cx - rect.left) / rect.width;
        const fracY = (cy - rect.top)  / rect.height;

        viewBox.current = {
            x: svgX - fracX * newW,
            y: svgY - fracY * newH,
            w: newW,
            h: newH,
        };
        applyViewBox();
    }, [applyViewBox, getSvg]);

    const zoomIn  = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        zoomAt(ZOOM_FACTOR, r.left + r.width / 2, r.top + r.height / 2);
    }, [zoomAt]);

    const zoomOut = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        zoomAt(1 / ZOOM_FACTOR, r.left + r.width / 2, r.top + r.height / 2);
    }, [zoomAt]);

    const resetView = useCallback(() => {
        viewBox.current = { x: 0, y: 0, w: naturalBox.current.w, h: naturalBox.current.h };
        applyViewBox();
    }, [applyViewBox]);

    const fitView = useCallback(() => {
        const svg = getSvg();
        const el  = containerRef.current;
        if (!svg || !el) return;

        const containerRect = el.getBoundingClientRect();
        const nw = naturalBox.current.w;
        const nh = naturalBox.current.h;
        const containerAspect = containerRect.width / containerRect.height;
        const svgAspect       = nw / nh;

        let fitW: number, fitH: number;
        if (svgAspect > containerAspect) {
            // SVG is wider — fit to width
            fitW = nw;
            fitH = nw / containerAspect;
        } else {
            // SVG is taller — fit to height
            fitH = nh;
            fitW = nh * containerAspect;
        }
        viewBox.current = {
            x: (nw - fitW) / 2,
            y: (nh - fitH) / 2,
            w: fitW,
            h: fitH,
        };
        applyViewBox();
    }, [applyViewBox, getSvg]);

    // ── mouse handlers ─────────────────────────────────────────────────
    const onWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
        zoomAt(factor, e.clientX, e.clientY);
    }, [zoomAt]);

    const onMouseDown = useCallback((e: MouseEvent) => {
        if (e.button !== 0) return;
        dragging.current = true;
        dragLast.current = { x: e.clientX, y: e.clientY };
        if (containerRef.current) containerRef.current.style.cursor = "grabbing";
    }, []);

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!dragging.current) return;
        const el = containerRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const vb   = viewBox.current;

        // How many SVG units per pixel
        const sx = vb.w / rect.width;
        const sy = vb.h / rect.height;

        viewBox.current = {
            ...vb,
            x: vb.x - (e.clientX - dragLast.current.x) * sx,
            y: vb.y - (e.clientY - dragLast.current.y) * sy,
        };
        dragLast.current = { x: e.clientX, y: e.clientY };
        applyViewBox();
    }, [applyViewBox]);

    const onMouseUp = useCallback(() => {
        dragging.current = false;
        if (containerRef.current) containerRef.current.style.cursor = "grab";
    }, []);

    // ── touch handlers ─────────────────────────────────────────────────
    const onTouchStart = useCallback((e: TouchEvent) => {
        if (e.touches.length === 1) {
            dragging.current = true;
            dragLast.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.touches.length === 2) {
            dragging.current = false;
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastPinchDist.current = Math.hypot(dx, dy);
        }
    }, []);

    const onTouchMove = useCallback((e: TouchEvent) => {
        e.preventDefault();
        if (e.touches.length === 1 && dragging.current) {
            const el = containerRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const vb   = viewBox.current;
            const sx = vb.w / rect.width;
            const sy = vb.h / rect.height;

            viewBox.current = {
                ...vb,
                x: vb.x - (e.touches[0].clientX - dragLast.current.x) * sx,
                y: vb.y - (e.touches[0].clientY - dragLast.current.y) * sy,
            };
            dragLast.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            applyViewBox();
        } else if (e.touches.length === 2 && lastPinchDist.current !== null) {
            const dx   = e.touches[0].clientX - e.touches[1].clientX;
            const dy   = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.hypot(dx, dy);
            const cx   = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const cy   = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            const factor = dist / lastPinchDist.current;
            lastPinchDist.current = dist;
            zoomAt(factor, cx, cy);
        }
    }, [applyViewBox, zoomAt]);

    const onTouchEnd = useCallback(() => {
        dragging.current      = false;
        lastPinchDist.current = null;
    }, []);

    // ── attach/detach listeners ────────────────────────────────────────
    useEffect(() => {
        const el = containerRef.current;
        if (!el || !rendered) return;

        el.addEventListener("wheel",      onWheel,     { passive: false });
        el.addEventListener("mousedown",  onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup",   onMouseUp);
        el.addEventListener("touchstart", onTouchStart, { passive: false });
        el.addEventListener("touchmove",  onTouchMove,  { passive: false });
        el.addEventListener("touchend",   onTouchEnd);

        return () => {
            el.removeEventListener("wheel",      onWheel);
            el.removeEventListener("mousedown",  onMouseDown);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup",   onMouseUp);
            el.removeEventListener("touchstart", onTouchStart);
            el.removeEventListener("touchmove",  onTouchMove);
            el.removeEventListener("touchend",   onTouchEnd);
        };
    }, [rendered, onWheel, onMouseDown, onMouseMove, onMouseUp,
        onTouchStart, onTouchMove, onTouchEnd]);

    // ── render mermaid ─────────────────────────────────────────────────
    useEffect(() => {
        if (!svgWrapRef.current) return;

        const wrapper = svgWrapRef.current;
        const chartId = `mermaid-chart-${++chartCounter}`;
        setError(null);
        setRendered(false);

        const renderChart = async () => {
            try {
                const mermaid = (await import("mermaid")).default;

                const isDark =
                    document.documentElement.getAttribute("data-theme") === "dark" ||
                    !document.documentElement.classList.contains("light");

                mermaid.initialize({
                    startOnLoad: false,
                    theme: isDark ? "dark" : "default",
                    fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
                    securityLevel: "loose",
                    suppressErrorRendering: true,
                    // Let diagrams expand to natural width — prevents text truncation
                    flowchart:  { useMaxWidth: false },
                    sequence:   { useMaxWidth: false },
                    gantt:      { useMaxWidth: false },
                    journey:    { useMaxWidth: false },
                    timeline:   { useMaxWidth: false },
                    mindmap:    { useMaxWidth: false },
                    class:      { useMaxWidth: false },
                    state:      { useMaxWidth: false },
                    er:         { useMaxWidth: false },
                    pie:        { useMaxWidth: false },
                    quadrantChart: { useMaxWidth: false },
                    gitGraph:   { useMaxWidth: false },
                });

                const { svg } = await mermaid.render(chartId, chart.trim());

                if (wrapper) {
                    wrapper.innerHTML = svg;

                    // Capture the natural SVG dimensions for viewBox-based zoom
                    const svgEl = wrapper.querySelector("svg");
                    if (svgEl) {
                        // Remove any fixed width/height so SVG fills its container
                        const origW = svgEl.width.baseVal.value  || svgEl.getBoundingClientRect().width;
                        const origH = svgEl.height.baseVal.value || svgEl.getBoundingClientRect().height;

                        naturalBox.current = { w: origW, h: origH };
                        viewBox.current    = { x: 0, y: 0, w: origW, h: origH };

                        // Make SVG fill the viewport div, viewBox controls what's visible
                        svgEl.removeAttribute("width");
                        svgEl.removeAttribute("height");
                        svgEl.removeAttribute("style");
                        svgEl.setAttribute("width",  "100%");
                        svgEl.setAttribute("height", "100%");
                        svgEl.setAttribute("viewBox", `0 0 ${origW} ${origH}`);
                        svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
                    }

                    setRendered(true);
                }
            } catch (e: any) {
                const stray = document.getElementById(chartId);
                stray?.remove();
                setError(e?.message || "Failed to render diagram");
            }
        };

        renderChart();
    }, [chart]);

    // ── error state ────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="mermaid-error">
                <div className="mermaid-error-label">⚠ Mermaid Parse Error</div>
                <pre className="mermaid-error-pre">{error}</pre>
                <pre className="mermaid-source">{chart}</pre>
            </div>
        );
    }

    return (
        <div className="mermaid-outer">
            {/* Controls */}
            {rendered && (
                <div className="mermaid-controls">
                    <button type="button" className="mermaid-ctrl-btn" onClick={zoomIn}  title="Zoom in">＋</button>
                    <span className="mermaid-ctrl-scale">{scaleDisplay}%</span>
                    <button type="button" className="mermaid-ctrl-btn" onClick={zoomOut} title="Zoom out">－</button>
                    <button type="button" className="mermaid-ctrl-btn mermaid-ctrl-reset" onClick={fitView} title="Fit to view">⊞</button>
                    <button type="button" className="mermaid-ctrl-btn mermaid-ctrl-reset" onClick={resetView} title="Reset (1:1)">1:1</button>
                </div>
            )}

            {/* Viewport */}
            <div
                ref={containerRef}
                className="mermaid-container"
                style={{ cursor: rendered ? "grab" : "default" }}
            >
                {!rendered && (
                    <div className="mermaid-loading">
                        <span className="mermaid-loading-dot" />
                        <span className="mermaid-loading-dot" />
                        <span className="mermaid-loading-dot" />
                    </div>
                )}
                <div
                    ref={svgWrapRef}
                    className="mermaid-render"
                    style={{ display: rendered ? "block" : "none" }}
                />
            </div>

            {rendered && (
                <p className="mermaid-hint">Scroll to zoom · Drag to pan · Pinch on mobile</p>
            )}
        </div>
    );
}
