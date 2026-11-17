import { createContext, memo, useCallback, useContext, useEffect, useState, type Dispatch, type MouseEvent as ReactMouseEvent, type SetStateAction } from 'react';
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
};

function IdeaNodeView({ id, data, selected }: NodeProps<IdeaNode>) {
  const onLabelChange = useContext(LabelChangeContext);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const tone = data.tone ?? 'lavender';
  const startEditing = () => { setDraft(data.label); setEditing(true); };
  return (
    <div className={`idea-node idea-node--${tone}${selected ? ' is-selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <div className="idea-node__eyebrow">{id === 'root' ? 'IDEA CENTRAL' : 'IDEA'}</div>
      {editing ? (
        <input className="idea-node__input nodrag" autoFocus aria-label="Nombre de la idea" maxLength={500} value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            const label = event.target.value.trim();
            if (label) onLabelChange(id, label);
          }}
          onBlur={() => setEditing(false)}
          onKeyDown={(event) => { if (event.key === 'Enter' || event.key === 'Escape') event.currentTarget.blur(); }} />
      ) : (
        <button className="idea-node__label nodrag" onDoubleClick={startEditing} onKeyDown={(event) => {
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

function MapCanvas({ nodes, edges, setNodes, setEdges, setSelectedNodeId, onLabelChange, aiBusy }: Props) {
  const [minimumZoom, setMinimumZoom] = useState(() => window.matchMedia('(max-width: 760px)').matches ? 0.4 : 0.25);
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
    setEdges((current) => addEdge({ ...connection, type: 'smoothstep' }, current));
  }, [aiBusy, setEdges]);
  const onNodeClick = useCallback((_event: ReactMouseEvent, node: IdeaNode) => setSelectedNodeId(node.id), [setSelectedNodeId]);

  return (
    <ReactFlowProvider>
      <LabelChangeContext.Provider value={onLabelChange}>
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} ariaLabelConfig={ariaLabelConfig}
          onlyRenderVisibleElements={nodes.length >= 100} nodesDraggable={!aiBusy} nodesConnectable={!aiBusy}
          elementsSelectable={!aiBusy} deleteKeyCode={null} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect} onNodeClick={onNodeClick} fitView fitViewOptions={fitViewOptions} minZoom={minimumZoom} maxZoom={1.6}>
          <Background variant={BackgroundVariant.Dots} gap={23} size={1} color="#dfe3ee" />
          <Controls position="bottom-left" showInteractive={false} />
          {nodes.length <= minimapMaxNodes && <MiniMap position="bottom-right" pannable zoomable nodeStrokeWidth={2} />}
        </ReactFlow>
      </LabelChangeContext.Provider>
    </ReactFlowProvider>
  );
}

export default memo(MapCanvas);
