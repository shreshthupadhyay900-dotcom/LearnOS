import { motion } from 'framer-motion';
import { Share2, Zap, Lock, CheckCircle2 } from 'lucide-react';

export default function KnowledgeGraph({ data = [] }) {
  // Map data to graph nodes
  const concepts = data.length > 0 ? data.map((d, i) => ({
    id: d.topic,
    label: d.topic,
    status: d.accuracy >= 70 ? 'completed' : d.accuracy >= 40 ? 'in-progress' : 'locked',
    x: 100 + (i % 4) * 180,
    y: 100 + Math.floor(i / 4) * 150,
  })) : [
    { id: '1', label: 'Initialize', status: 'in-progress', x: 400, y: 150 }
  ];

  const connections = concepts.slice(1).map((c, i) => ({
    from: concepts[i].id,
    to: c.id
  }));

  return (
    <div className="card !p-0 overflow-hidden bg-slate-950 border-white/5 relative min-h-[450px] group">
      <div className="absolute top-6 left-8 z-10">
         <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[10px] font-black uppercase tracking-widest">
            <Share2 size={12} /> Conceptual Neural Net
         </div>
         <h3 className="text-xl font-display font-black text-white italic uppercase mt-2">Knowledge Topology</h3>
      </div>

      <div className="absolute inset-0 opacity-20 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#4f69f8_0%,transparent_70%)]" />
      </div>

      <div className="w-full h-full overflow-x-auto scrollbar-none p-10">
        <svg className="min-w-[800px] h-[400px] overflow-visible" viewBox="0 0 800 400">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f69f8" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>

          {connections.map((conn, i) => {
            const fromNode = concepts.find(c => c.id === conn.from);
            const toNode = concepts.find(c => c.id === conn.to);
            const isActive = fromNode.status === 'completed' && toNode.status !== 'locked';

            return (
              <motion.line
                key={i}
                x1={fromNode.x} y1={fromNode.y}
                x2={toNode.x} y2={toNode.y}
                stroke={isActive ? "url(#lineGrad)" : "rgba(255,255,255,0.1)"}
                strokeWidth={isActive ? "2" : "1"}
                strokeDasharray={isActive ? "none" : "5 5"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: i * 0.1 }}
              />
            );
          })}

          {concepts.map((node, i) => (
            <g key={node.id} className="cursor-pointer group/node">
              <motion.circle
                cx={node.x} cy={node.y} r="25"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: i * 0.05 }}
                fill={node.status === 'completed' ? '#4f69f8' : node.status === 'in-progress' ? '#1e293b' : '#0f172a'}
                stroke={node.status === 'in-progress' ? '#4f69f8' : 'rgba(255,255,255,0.1)'}
                strokeWidth="2"
                className="transition-all duration-300 group-hover/node:r-30"
              />
              <foreignObject x={node.x - 10} y={node.y - 10} width="20" height="20">
                <div className="w-full h-full flex items-center justify-center">
                  {node.status === 'completed' ? <CheckCircle2 size={16} className="text-white" /> : 
                   node.status === 'in-progress' ? <Zap size={16} className="text-primary-500 animate-pulse" /> : 
                   <Lock size={16} className="text-white/20" />}
                </div>
              </foreignObject>
              <text
                x={node.x} y={node.y + 45}
                textAnchor="middle"
                className="text-[9px] font-black uppercase fill-white/60 tracking-widest italic"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="absolute bottom-6 right-8 flex gap-4">
         <div className="flex items-center gap-2 text-[8px] font-black text-white/40 uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Mastered
         </div>
         <div className="flex items-center gap-2 text-[8px] font-black text-white/40 uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800 border border-primary-500" /> Active
         </div>
         <div className="flex items-center gap-2 text-[8px] font-black text-white/40 uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-white/10" /> Locked
         </div>
      </div>
    </div>
  );
}

