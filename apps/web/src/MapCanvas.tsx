import { createContext, memo, useCallback, useContext, useEffect, useRef, useState, type Dispatch, type MouseEvent as ReactMouseEvent, type SetStateAction } from 'react';
import '@xyflow/react/dist/style.css';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
  type OnEdgesChange,
  type OnNodesChange,
} from '@xyflow/react';
import type { IdeaNodeData } from '@espacio-visual/domain';

type IdeaNode = Node<IdeaNodeData, 'idea'>;
type LabelChange = (id: string, label: string) => void;
const LabelChangeContext = createContext<LabelChange>(() => undefined);
type Props = {
  nodes: IdeaNode[];
  edges: Edge[];
  setNodes: Dispatch<SetStateAction<IdeaNode[]>>;
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  setSelectedNodeId: (id: string) => void;
  onLabelChange: LabelChange;
  aiBusy: boolean;
  fitViewRequest: number;
};

function IdeaNodeView({ id, data, selected }: NodeProps<IdeaNode>) {
  const onLabelChange = useContext(LabelChangeContext);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const cancelEditRef = useRef(false);
  const labelButtonRef = useRef<HTMLButtonElement>(null);
  const tone = data.tone ?? 'lavender';
  const startEditing = () => { cancelEditRef.current = false; setDraft(data.label); setEditing(true); };
  return (
    <div className={`idea-node idea-node--${tone}${selected ? ' is-selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <div className="idea-node__eyebrow">{id === 'root' ? 'IDEA CENTRAL' : 'IDEA'}</div>
      {editing ? (
        <input className="idea-node__input nodrag" autoFocus aria-label="Nombre de la idea" maxLength={500} value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
          }}
          onBlur={() => {
            if (cancelEditRef.current) {
              cancelEditRef.current = false;
              setEditing(false);
              return;
            }
            const label = draft.trim();
            if (label && label !== data.label) onLabelChange(id, label);
            setEditing(false);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); }
            else if (event.key === 'Escape') {
              event.preventDefault();
              cancelEditRef.current = true;
              setDraft(data.label);
              setEditing(false);
              requestAnimationFrame(() => labelButtonRef.current?.focus());
            }
          }} />
      ) : (
        <button ref={labelButtonRef} className="idea-node__label nodrag" onDoubleClick={startEditing} onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== 'F2') return;
          event.preventDefault();
          event.stopPropagation();
          startEditing();
        }} title="Doble clic, Intro o F2 para editar">
          {data.label}
        </button>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = { idea: memo(IdeaNodeView) };
const fitViewOptions = { padding: 0.25 };
const minimapMaxNodes = 1_000;

function FitMapOnRequest({ request }: { request: number }) {
  const { fitView } = useReactFlow();
  const previousRequest = useRef(request);
  useEffect(() => {
    if (request === previousRequest.current) return;
    previousRequest.current = request;
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => { void fitView({ ...fitViewOptions, duration: 250 }); });
    });
    return () => { cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame); };
  }, [fitView, request]);
  return null;
}
const ariaLabelConfig = {
  'node.a11yDescription.default': 'Pulsa Intro o espacio para seleccionar una idea. Pulsa Suprimir para eliminarla o Escape para cancelar.',
  'node.a11yDescription.keyboardDisabled': 'Pulsa Intro o espacio para seleccionar una idea. Después usa las flechas para moverla, Suprimir para eliminarla o Escape para cancelar.',
  'node.a11yDescription.ariaLiveMessage': ({ direction, x, y }: { direction: string; x: number; y: number }) => `Idea seleccionada movida ${direction}. Nueva posición: x ${x}, y ${y}.`,
  'edge.a11yDescription.default': 'Pulsa Intro o espacio para seleccionar una conexión. Después pulsa Suprimir para eliminarla o Escape para cancelar.',
  'controls.ariaLabel': 'Controles del mapa',
  'controls.zoomIn.ariaLabel': 'Acercar',
  'controls.zoomOut.ariaLabel': 'Alejar',
  'controls.fitView.ariaLabel': 'Ajustar mapa a la vista',
  'controls.interactive.ariaLabel': 'Alternar interactividad',
  'minimap.ariaLabel': 'Minimapa',
  'handle.ariaLabel': 'Punto de conexión',
};

function MapCanvas({ nodes, edges, setNodes, setEdges, setSelectedNodeId, onLabelChange, aiBusy, fitViewRequest }: Props) {
  const [minimumZoom, setMinimumZoom] = useState(() => window.matchMedia('(max-width: 760px)').matches ? 0.4 : 0.25);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  useEffect(() => {
    const mobileViewport = window.matchMedia('(max-width: 760px)');
    const updateMinimumZoom = () => setMinimumZoom(mobileViewport.matches ? 0.4 : 0.25);
    mobileViewport.addEventListener('change', updateMinimumZoom);
    return () => mobileViewport.removeEventListener('change', updateMinimumZoom);
  }, []);
  const onNodesChange: OnNodesChange<IdeaNode> = useCallback((changes) => {
    if (aiBusy) return;
    setNodes((current) => applyNodeChanges(changes, current) as IdeaNode[]);
  }, [aiBusy, setNodes]);
  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    if (aiBusy) return;
    setEdges((current) => applyEdgeChanges(changes, current));
  }, [aiBusy, setEdges]);
  const onConnect = useCallback((connection: Connection) => {
    if (aiBusy) return;
    const labels = new Map(nodesRef.current.map((node) => [node.id, node.data.label]));
    const sourceLabel = labels.get(connection.source) ?? 'idea desconocida';
    const targetLabel = labels.get(connection.target) ?? 'idea desconocida';
    setEdges((current) => addEdge({ ...connection, type: 'smoothstep', ariaLabel: `Conexión de «${sourceLabel}» a «${targetLabel}»` }, current));
  }, [aiBusy, setEdges]);
  const onNodeClick = useCallback((_event: ReactMouseEvent, node: IdeaNode) => setSelectedNodeId(node.id), [setSelectedNodeId]);

  return (
    <ReactFlowProvider>
      <LabelChangeContext.Provider value={onLabelChange}>
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} ariaLabelConfig={ariaLabelConfig}
          onlyRenderVisibleElements={nodes.length >= 100} nodesDraggable={!aiBusy} nodesConnectable={!aiBusy}
          elementsSelectable={!aiBusy} deleteKeyCode={null} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect} onNodeClick={onNodeClick} fitView fitViewOptions={fitViewOptions} minZoom={minimumZoom} maxZoom={1.6}>
          <FitMapOnRequest request={fitViewRequest} />
          <Background variant={BackgroundVariant.Dots} gap={23} size={1} color="#dfe3ee" />
          <Controls position="bottom-left" showInteractive={false} />
          {nodes.length <= minimapMaxNodes && <MiniMap position="bottom-right" pannable zoomable nodeStrokeWidth={2} />}
        </ReactFlow>
      </LabelChangeContext.Provider>
    </ReactFlowProvider>
  );
}

export default memo(MapCanvas);
