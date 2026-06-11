import { useState, useMemo, useRef, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import type { Operation, RoutingEntry } from '@/stores/modelStore';

export interface RoutingFlowGraphHandle {
  reset: () => void;
  hasMoved: boolean;
}

interface Props {
  operations: Operation[];
  routing: RoutingEntry[];
  onLayoutChange?: (hasMoved: boolean) => void;
}

const NODE_W = 136;
const NODE_H = 46;
const H_SPACING = 190;
const V_SPACING = 72;
const PAD_X = 60;
const PAD_Y = 50;

interface GNode {
  name: string;
  opNumber: number;
  layer: number;
  cx: number;
  cy: number;
  kind: 'dock' | 'op' | 'stock' | 'scrap';
}

interface GEdge {
  from: string;
  to: string;
  pct: number;
  d: string;
  labelX: number;
  labelY: number;
  back: boolean;
}

type NodeOffset = {
  dx: number;
  dy: number;
};

type DragState = {
  nodeName: string;
  originalOffset?: NodeOffset;
};

const COLORS: Record<GNode['kind'], { bg: string; text: string; stroke: string }> = {
  dock: { bg: '#0C0F14', text: '#FFFFFF', stroke: '#2A3040' },
  op: { bg: '#00C4B4', text: '#0C0F14', stroke: '#00A89A' },
  stock: { bg: '#0F9470', text: '#FFFFFF', stroke: '#0D7F5F' },
  scrap: { bg: '#DC2626', text: '#FFFFFF', stroke: '#B91C1C' },
};

const EDGE_COLOR = '#334155';
const EDGE_BACK_COLOR = '#94A3B8';
const EDGE_ACCENT = '#0F766E';
const EDGE_BACK_ACCENT = '#64748B';
const LABEL_BG = '#FFFFFF';
const LABEL_TEXT = '#111827';
const LABEL_BORDER = '#E2E6EA';
const DRAG_GLOW = '#00C4B4';
const ARROW_MARKER_PX = 20;
const ARROW_BASE_X = 2.5;
const ARROW_TIP_X = 14;
/** Pixel length from arrow base (path end) to tip; matches marker viewBox scale. */
const ARROW_SIZE = ((ARROW_TIP_X - ARROW_BASE_X) * ARROW_MARKER_PX) / 16;

function computeInitialNodes(operations: Operation[], routing: RoutingEntry[]) {
  const allOps = [...operations].sort((a, b) => a.op_number - b.op_number);
  const opsByName = new Map(allOps.map((o) => [o.op_name, o]));

  const adj = new Map<string, string[]>();

  for (const r of routing) {
    if (!adj.has(r.from_op_name)) adj.set(r.from_op_name, []);
    adj.get(r.from_op_name)!.push(r.to_op_name);
  }

  const layers = new Map<string, number>();
  const visited = new Set<string>();
  const queue: string[] = [];

  if (opsByName.has('DOCK')) {
    layers.set('DOCK', 0);
    visited.add('DOCK');
    queue.push('DOCK');
  }

  while (queue.length > 0) {
    const cur = queue.shift()!;
    const curLayer = layers.get(cur)!;

    for (const next of adj.get(cur) ?? []) {
      if (visited.has(next)) continue;
      if (next === 'STOCK' || next === 'SCRAP') continue;

      visited.add(next);
      layers.set(next, curLayer + 1);
      queue.push(next);
    }
  }

  for (const op of allOps) {
    if (!layers.has(op.op_name) && op.op_name !== 'DOCK') {
      const maxSoFar = Math.max(0, ...layers.values());
      layers.set(op.op_name, maxSoFar + 1);
    }
  }

  const maxUserLayer = Math.max(0, ...layers.values());
  const terminalLayer = maxUserLayer + 1;

  const hasStock = routing.some((r) => r.to_op_name === 'STOCK');
  const hasScrap = routing.some((r) => r.to_op_name === 'SCRAP');

  if (hasStock) layers.set('STOCK', terminalLayer);
  if (hasScrap) layers.set('SCRAP', terminalLayer);

  const layerGroups = new Map<number, string[]>();

  for (const [name, layer] of layers) {
    if (!layerGroups.has(layer)) layerGroups.set(layer, []);
    layerGroups.get(layer)!.push(name);
  }

  for (const [, names] of layerGroups) {
    names.sort((a, b) => {
      const oa = opsByName.get(a);
      const ob = opsByName.get(b);

      const na =
        a === 'STOCK'
          ? 9998
          : a === 'SCRAP'
            ? 9999
            : oa?.op_number ?? 0;

      const nb =
        b === 'STOCK'
          ? 9998
          : b === 'SCRAP'
            ? 9999
            : ob?.op_number ?? 0;

      return na - nb;
    });
  }

  const maxLaneCount = Math.max(
    1,
    ...Array.from(layerGroups.values()).map((g) => g.length),
  );

  const totalLayerHeight =
    maxLaneCount * NODE_H + (maxLaneCount - 1) * (V_SPACING - NODE_H);

  const nodes: GNode[] = [];

  for (const [layer, names] of layerGroups) {
    const groupHeight =
      names.length * NODE_H + (names.length - 1) * (V_SPACING - NODE_H);

    const offsetY = (totalLayerHeight - groupHeight) / 2;

    names.forEach((name, idx) => {
      const op = opsByName.get(name);

      const kind: GNode['kind'] =
        name === 'DOCK'
          ? 'dock'
          : name === 'STOCK'
            ? 'stock'
            : name === 'SCRAP'
              ? 'scrap'
              : 'op';

      nodes.push({
        name,
        opNumber: op?.op_number ?? (name === 'DOCK' ? 0 : -1),
        layer,
        cx: PAD_X + layer * H_SPACING + NODE_W / 2,
        cy: PAD_Y + offsetY + idx * V_SPACING + NODE_H / 2,
        kind,
      });
    });
  }

  const maxLayerIdx = layerGroups.size > 0 ? Math.max(...layerGroups.keys()) : 0;

  return { nodes, maxLayerIdx, totalLayerHeight };
}

function computeEdges(nodes: GNode[], routing: RoutingEntry[]): GEdge[] {
  if (nodes.length === 0 || routing.length === 0) return [];

  const nodeMap = new Map(nodes.map((n) => [n.name, n]));

  const edgesBySource = new Map<string, RoutingEntry[]>();
  const edgesByTarget = new Map<string, RoutingEntry[]>();

  for (const r of routing) {
    if (!edgesBySource.has(r.from_op_name)) edgesBySource.set(r.from_op_name, []);
    edgesBySource.get(r.from_op_name)!.push(r);

    if (!edgesByTarget.has(r.to_op_name)) edgesByTarget.set(r.to_op_name, []);
    edgesByTarget.get(r.to_op_name)!.push(r);
  }

  for (const [, group] of edgesBySource) {
    group.sort(
      (a, b) =>
        (nodeMap.get(a.to_op_name)?.cy ?? 0) -
        (nodeMap.get(b.to_op_name)?.cy ?? 0),
    );
  }

  for (const [, group] of edgesByTarget) {
    group.sort(
      (a, b) =>
        (nodeMap.get(a.from_op_name)?.cy ?? 0) -
        (nodeMap.get(b.from_op_name)?.cy ?? 0),
    );
  }

  const FAN_STEP = 12;
  const graphBottom = Math.max(0, ...nodes.map((n) => n.cy + NODE_H / 2));
  const graphTop = Math.min(...nodes.map((n) => n.cy - NODE_H / 2));

  const edges: GEdge[] = [];

  let backEdgeIdx = 0;
  let detourBelowCount = 0;
  let detourAboveCount = 0;

  for (const r of routing) {
    const fromNode = nodeMap.get(r.from_op_name);
    const toNode = nodeMap.get(r.to_op_name);

    if (!fromNode || !toNode) continue;

    const isBack = toNode.layer < fromNode.layer;
    const layerDiff = toNode.layer - fromNode.layer;

    const srcGroup = edgesBySource.get(r.from_op_name)!;
    const srcIdx = srcGroup.indexOf(r);
    const srcCount = srcGroup.length;
    const srcFan = srcCount > 1 ? (srcIdx - (srcCount - 1) / 2) * FAN_STEP : 0;

    const tgtGroup = edgesByTarget.get(r.to_op_name)!;
    const tgtIdx = tgtGroup.indexOf(r);
    const tgtCount = tgtGroup.length;
    const tgtFan = tgtCount > 1 ? (tgtIdx - (tgtCount - 1) / 2) * FAN_STEP : 0;

    let d: string;
    let labelX: number;
    let labelY: number;

    if (isBack) {
      const loopY = graphBottom + 50 + backEdgeIdx * 32;
      backEdgeIdx++;

      const bsx = fromNode.cx;
      const bsy = fromNode.cy + NODE_H / 2;
      const bex = toNode.cx;
      const bey = toNode.cy + NODE_H / 2 + ARROW_SIZE;

      d = `M ${bsx} ${bsy} C ${bsx} ${loopY}, ${bex} ${loopY}, ${bex} ${bey}`;
      labelX = (bsx + bex) / 2;
      labelY = loopY + 5;
    } else {
      const sx = fromNode.cx + NODE_W / 2;
      const sy = fromNode.cy + srcFan;
      const ex = toNode.cx - NODE_W / 2 - ARROW_SIZE;
      const ey = toNode.cy + tgtFan;

      let needsDetour = false;
      let clearBelowY = graphBottom;
      let clearAboveY = graphTop;

      if (layerDiff > 1) {
        const intermediateNodes = nodes.filter(
          (n) => n.layer > fromNode.layer && n.layer < toNode.layer,
        );

        for (const n of intermediateNodes) {
          const nTop = n.cy - NODE_H / 2;
          const nBot = n.cy + NODE_H / 2;

          clearBelowY = Math.max(clearBelowY, nBot);
          clearAboveY = Math.min(clearAboveY, nTop);

          const t = (n.cx - sx) / ((ex - sx) || 1);
          const lineY = sy + t * (ey - sy);

          if (lineY >= nTop - 18 && lineY <= nBot + 18) {
            needsDetour = true;
          }
        }
      }

      if (needsDetour) {
        const goBelow = ey >= sy;
        const midX = (sx + ex) / 2;
        const hp = Math.min((ex - sx) / 3, 60);

        if (goBelow) {
          const detourY = clearBelowY + 32 + detourBelowCount * 28;
          detourBelowCount++;

          d = [
            `M ${sx} ${sy}`,
            `C ${sx + hp} ${sy}, ${sx + hp} ${detourY}, ${midX} ${detourY}`,
            `C ${ex - hp} ${detourY}, ${ex - hp * 0.5} ${ey}, ${ex} ${ey}`,
          ].join(' ');

          labelX = midX;
          labelY = detourY + 5;
        } else {
          const detourY = clearAboveY - 32 - detourAboveCount * 28;
          detourAboveCount++;

          d = [
            `M ${sx} ${sy}`,
            `C ${sx + hp} ${sy}, ${sx + hp} ${detourY}, ${midX} ${detourY}`,
            `C ${ex - hp} ${detourY}, ${ex - hp * 0.5} ${ey}, ${ex} ${ey}`,
          ].join(' ');

          labelX = midX;
          labelY = detourY - 15;
        }
      } else {
        const dx = ex - sx;
        const cp = Math.max(dx * 0.4, 50);

        d = `M ${sx} ${sy} C ${sx + cp} ${sy}, ${ex - cp} ${ey}, ${ex} ${ey}`;
        labelX = (sx + ex) / 2;
        labelY = (sy + ey) / 2 - 12;
      }
    }

    edges.push({
      from: r.from_op_name,
      to: r.to_op_name,
      pct: r.pct_routed,
      d,
      labelX,
      labelY,
      back: isBack,
    });
  }

  const LBL_W = 46;
  const LBL_H = 24;

  for (let pass = 0; pass < 15; pass++) {
    let moved = false;

    for (let i = 0; i < edges.length; i++) {
      for (let j = i + 1; j < edges.length; j++) {
        const a = edges[i];
        const b = edges[j];

        if (
          Math.abs(a.labelX - b.labelX) < LBL_W &&
          Math.abs(a.labelY - b.labelY) < LBL_H
        ) {
          const push = (LBL_H - Math.abs(a.labelY - b.labelY)) / 2 + 3;

          if (a.labelY <= b.labelY) {
            a.labelY -= push;
            b.labelY += push;
          } else {
            a.labelY += push;
            b.labelY -= push;
          }

          moved = true;
        }
      }
    }

    if (!moved) break;
  }

  for (const e of edges) {
    for (const n of nodes) {
      const nLeft = n.cx - NODE_W / 2 - 4;
      const nRight = n.cx + NODE_W / 2 + 4;
      const nTop = n.cy - NODE_H / 2 - 4;
      const nBot = n.cy + NODE_H / 2 + 4;

      const lLeft = e.labelX - LBL_W / 2;
      const lRight = e.labelX + LBL_W / 2;
      const lTop = e.labelY - LBL_H / 2;
      const lBot = e.labelY + LBL_H / 2;

      if (lRight > nLeft && lLeft < nRight && lBot > nTop && lTop < nBot) {
        if (e.labelY < n.cy) {
          e.labelY = nTop - LBL_H / 2 - 2;
        } else {
          e.labelY = nBot + LBL_H / 2 + 2;
        }
      }
    }
  }

  return edges;
}

export const RoutingFlowGraph = forwardRef<RoutingFlowGraphHandle, Props>(function RoutingFlowGraph({ operations, routing, onLayoutChange }, ref) {
  const { nodes: initNodes, maxLayerIdx, totalLayerHeight } = useMemo(
    () => computeInitialNodes(operations, routing),
    [operations, routing],
  );

  const [offsets, setOffsets] = useState<Record<string, NodeOffset>>({});
  const [dragState, setDragState] = useState<DragState | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setOffsets({});
    setDragState(null);
    lastPointerRef.current = null;
  }, [operations, routing]);

  const nodes = useMemo(
    () =>
      initNodes.map((n) => ({
        ...n,
        cx: n.cx + (offsets[n.name]?.dx ?? 0),
        cy: n.cy + (offsets[n.name]?.dy ?? 0),
      })),
    [initNodes, offsets],
  );

  const edges = useMemo(() => computeEdges(nodes, routing), [nodes, routing]);

  const svgW = useMemo(() => {
    const base = PAD_X * 2 + (maxLayerIdx + 1) * H_SPACING;

    if (nodes.length === 0) return base;

    const maxNodeRight = Math.max(...nodes.map((n) => n.cx + NODE_W / 2)) + PAD_X;
    const maxEdgeRight =
      edges.length > 0 ? Math.max(...edges.map((e) => e.labelX + 40)) + PAD_X : base;

    return Math.max(base, maxNodeRight, maxEdgeRight);
  }, [nodes, edges, maxLayerIdx]);

  const svgH = useMemo(() => {
    const base = PAD_Y * 2 + totalLayerHeight;

    const nodeTop =
      nodes.length > 0 ? Math.min(...nodes.map((n) => n.cy - NODE_H / 2)) - PAD_Y : 0;

    const nodeBottom =
      nodes.length > 0 ? Math.max(...nodes.map((n) => n.cy + NODE_H / 2)) + PAD_Y : base;

    const edgeBottom =
      edges.length > 0
        ? Math.max(...edges.map((e) => e.labelY + (e.back ? 40 : 30))) + PAD_Y
        : base;

    const edgeTop =
      edges.length > 0 ? Math.min(...edges.map((e) => e.labelY - 30)) - PAD_Y : 0;

    return Math.max(base, nodeBottom, edgeBottom, Math.abs(Math.min(nodeTop, edgeTop, 0)) + base);
  }, [nodes, edges, totalLayerHeight]);

  const hasMoved = Object.keys(offsets).length > 0;
  const dragging = dragState?.nodeName ?? null;

  useEffect(() => {
    onLayoutChange?.(hasMoved);
  }, [hasMoved, onLayoutChange]);

  const toSVG = useCallback((e: MouseEvent | React.MouseEvent | PointerEvent) => {
    const el = containerRef.current;
    if (!el) return null;

    const rect = el.getBoundingClientRect();

    return {
      x: e.clientX - rect.left + el.scrollLeft,
      y: e.clientY - rect.top + el.scrollTop,
    };
  }, []);

  const moveNodeToPoint = useCallback(
    (nodeName: string, x: number, y: number) => {
      const orig = initNodes.find((n) => n.name === nodeName);
      if (!orig) return;

      const safeX = Math.max(NODE_W / 2 + 8, x);
      const safeY = Math.max(NODE_H / 2 + 8, y);

      setOffsets((prev) => ({
        ...prev,
        [nodeName]: {
          dx: safeX - orig.cx,
          dy: safeY - orig.cy,
        },
      }));
    },
    [initNodes],
  );

  const handleNodePointerDown = useCallback(
    (name: string, e: React.PointerEvent<SVGElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const currentOffset = offsets[name];

      setDragState({
        nodeName: name,
        originalOffset: currentOffset,
      });

      const pt = toSVG(e);

      if (pt) {
        lastPointerRef.current = pt;
      }
    },
    [offsets, toSVG],
  );

  const placeDraggingNode = useCallback(() => {
    setDragState(null);
    lastPointerRef.current = null;
  }, []);

  const cancelDraggingNode = useCallback(() => {
    if (!dragState) return;

    const { nodeName, originalOffset } = dragState;

    setOffsets((prev) => {
      const next = { ...prev };

      if (originalOffset) {
        next[nodeName] = originalOffset;
      } else {
        delete next[nodeName];
      }

      return next;
    });

    setDragState(null);
    lastPointerRef.current = null;
  }, [dragState]);

  useEffect(() => {
    if (!dragState) return;

    let hasMoved = false;

    const handlePointerMove = (e: PointerEvent) => {
      const pt = toSVG(e);
      if (!pt) return;

      hasMoved = true;
      lastPointerRef.current = pt;
      moveNodeToPoint(dragState.nodeName, pt.x, pt.y);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!hasMoved) {
        // If the user clicked without moving, treat as a place at original position
        cancelDraggingNode();
        return;
      }

      const target = e.target as HTMLElement | SVGElement | null;
      const clickedButton =
        target instanceof HTMLElement && target.closest('button');
      if (clickedButton) return;

      placeDraggingNode();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelDraggingNode();
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    dragState,
    toSVG,
    moveNodeToPoint,
    placeDraggingNode,
    cancelDraggingNode,
  ]);

  const handleReset = useCallback(() => {
    setOffsets({});
    setDragState(null);
    lastPointerRef.current = null;
  }, []);

  useImperativeHandle(ref, () => ({
    reset: handleReset,
    hasMoved,
  }), [handleReset, hasMoved]);

  if (nodes.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No operations to display
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-x-auto overflow-y-auto rounded-b-lg bg-[#F8FAFB]"
      style={{
        maxHeight: 520,
        cursor: dragging ? 'grabbing' : undefined,
      }}
    >
      {dragging && (
        <div className="pointer-events-none absolute left-2 top-2 z-10 rounded-md border border-[#99F6E4] bg-white/95 px-2.5 py-1.5 text-meta font-medium text-[#0F766E] shadow-sm">
          Moving {dragging}. Release to place. Press Esc to cancel.
        </div>
      )}

      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="select-none"
        style={{
          minWidth: svgW,
          cursor: dragging ? 'grabbing' : 'default',
        }}
      >
        <defs>
          <marker
            id="arrow-forward"
            viewBox="0 0 16 16"
            refX={ARROW_BASE_X}
            refY="8"
            markerWidth={ARROW_MARKER_PX}
            markerHeight={ARROW_MARKER_PX}
            markerUnits="userSpaceOnUse"
            orient="auto"
          >
            <path
              d={`M ${ARROW_BASE_X} 2.5 L ${ARROW_TIP_X} 8 L ${ARROW_BASE_X} 13.5 Z`}
              fill={EDGE_ACCENT}
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </marker>

          <marker
            id="arrow-back"
            viewBox="0 0 16 16"
            refX={ARROW_BASE_X}
            refY="8"
            markerWidth={ARROW_MARKER_PX}
            markerHeight={ARROW_MARKER_PX}
            markerUnits="userSpaceOnUse"
            orient="auto"
          >
            <path
              d={`M ${ARROW_BASE_X} 2.5 L ${ARROW_TIP_X} 8 L ${ARROW_BASE_X} 13.5 Z`}
              fill={EDGE_BACK_ACCENT}
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </marker>

          <filter id="node-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="2"
              floodColor="#000"
              floodOpacity="0.10"
            />
          </filter>

          <filter id="drag-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="4"
              floodColor={DRAG_GLOW}
              floodOpacity="0.55"
            />
          </filter>
        </defs>

        {edges.map((e, i) => (
          <g key={`edge-line-${e.from}-${e.to}-${i}`} pointerEvents="none">
            <path
              d={e.d}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={e.back ? '6 4' : undefined}
              opacity={0.9}
            />
            <path
              d={e.d}
              fill="none"
              stroke={e.back ? EDGE_BACK_COLOR : EDGE_COLOR}
              strokeWidth={2.25}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={e.back ? '6 4' : undefined}
            />

            <rect
              x={e.labelX - 20}
              y={e.labelY - 10}
              width={40}
              height={20}
              rx={10}
              fill={LABEL_BG}
              stroke={LABEL_BORDER}
              strokeWidth={1}
            />

            <text
              x={e.labelX}
              y={e.labelY + 4}
              textAnchor="middle"
              fill={LABEL_TEXT}
              fontSize={11}
              fontFamily="'DM Mono', 'Roboto Mono', monospace"
              fontWeight={600}
            >
              {e.pct}%
            </text>
          </g>
        ))}

        {nodes.map((n) => {
          const c = COLORS[n.kind];

          const rx =
            n.kind === 'dock' || n.kind === 'stock' || n.kind === 'scrap'
              ? NODE_H / 2
              : 8;

          const isActive = dragging === n.name;
          const wasMoved = !!offsets[n.name];

          return (
            <g
              key={n.name}
              filter={isActive ? 'url(#drag-glow)' : 'url(#node-shadow)'}
              style={{
                cursor: isActive ? 'grabbing' : dragging ? 'default' : 'grab',
                pointerEvents: 'all',
              }}
              onPointerDown={(e) => handleNodePointerDown(n.name, e)}
            >
              {wasMoved && !isActive && (
                <rect
                  x={n.cx - NODE_W / 2 - 3}
                  y={n.cy - NODE_H / 2 - 3}
                  width={NODE_W + 6}
                  height={NODE_H + 6}
                  rx={rx + 3}
                  fill="none"
                  stroke={DRAG_GLOW}
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  opacity={0.45}
                  pointerEvents="none"
                />
              )}

              {isActive && (
                <rect
                  x={n.cx - NODE_W / 2 - 5}
                  y={n.cy - NODE_H / 2 - 5}
                  width={NODE_W + 10}
                  height={NODE_H + 10}
                  rx={rx + 5}
                  fill="none"
                  stroke={DRAG_GLOW}
                  strokeWidth={2.5}
                  opacity={0.95}
                  pointerEvents="none"
                />
              )}

              <rect
                x={n.cx - NODE_W / 2 - 7}
                y={n.cy - NODE_H / 2 - 7}
                width={NODE_W + 14}
                height={NODE_H + 14}
                rx={rx + 7}
                fill="transparent"
              />

              <rect
                x={n.cx - NODE_W / 2}
                y={n.cy - NODE_H / 2}
                width={NODE_W}
                height={NODE_H}
                rx={rx}
                fill={c.bg}
                stroke={isActive ? DRAG_GLOW : c.stroke}
                strokeWidth={isActive ? 2.2 : 1.5}
              />

              <text
                x={n.cx}
                y={
                  n.kind === 'dock' || n.kind === 'stock' || n.kind === 'scrap'
                    ? n.cy + 5
                    : n.cy + 1
                }
                textAnchor="middle"
                fill={c.text}
                fontSize={13}
                fontFamily="'DM Mono', 'Roboto Mono', monospace"
                fontWeight={600}
                pointerEvents="none"
              >
                {n.name}
              </text>

              {n.kind === 'op' && n.opNumber >= 0 && (
                <text
                  x={n.cx}
                  y={n.cy + 15}
                  textAnchor="middle"
                  fill={c.text}
                  fontSize={10}
                  fontFamily="'DM Sans', sans-serif"
                  opacity={0.6}
                  pointerEvents="none"
                >
                  Op #{n.opNumber}
                </text>
              )}
            </g>
          );
        })}

        {edges.map((e, i) => (
          <path
            key={`edge-arrow-${e.from}-${e.to}-${i}`}
            d={e.d}
            fill="none"
            stroke="transparent"
            strokeWidth={2.25}
            pointerEvents="none"
            markerEnd={e.back ? 'url(#arrow-back)' : 'url(#arrow-forward)'}
          />
        ))}

        {!dragging && !hasMoved && (
          <text
            x={svgW / 2}
            y={svgH - 10}
            textAnchor="middle"
            fill="#9CA3AF"
            fontSize={11}
            fontFamily="'DM Sans', sans-serif"
          >
            Click and drag any node to reposition it
          </text>
        )}
      </svg>
    </div>
  );
});