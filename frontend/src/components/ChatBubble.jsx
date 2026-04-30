/* eslint-disable */
import { motion } from 'framer-motion';
import { Bot, Volume2, ExternalLink, Book, Video, ShieldCheck, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
        <Bot size={14} className="text-white" />
      </div>
      <div className="chat-bubble-ai px-4 py-3">
        <div className="flex gap-1.5 items-center h-5">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

export default function ChatBubble({ message, isUser, onSpeak }) {
  const metadata = message.metadata || {};
  const hasResources = metadata.resources && metadata.resources.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 mb-6 group ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-md ${
        isUser
          ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white'
          : 'bg-gradient-primary text-white shadow-glow'
      }`}>
        {isUser ? 'U' : <Bot size={18} />}
      </div>

      {/* Bubble Container */}
      <div className={`flex flex-col gap-2 max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`relative px-5 py-4 text-sm leading-relaxed shadow-sm ${
          isUser ? 'chat-bubble-user rounded-3xl rounded-tr-none' : 'chat-bubble-ai rounded-3xl rounded-tl-none'
        }`}>
          {!isUser && onSpeak && (
            <button 
              onClick={onSpeak}
              className="absolute -right-10 top-0 p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 dark:hover:bg-primary-900/20"
              title="Listen to response"
            >
              <Volume2 size={16} />
            </button>
          )}

          {isUser ? (
            <p className="font-medium">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:text-primary-600 dark:prose-code:text-primary-400">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}

          {/* Metadata Badges */}
          {!isUser && (metadata.difficulty || metadata.intent) && (
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
              {metadata.intent && (
                <span className="px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-900/30 text-[10px] font-black uppercase tracking-widest text-primary-600">
                  {metadata.intent}
                </span>
              )}
              {metadata.difficulty && (
                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-[10px] font-black uppercase tracking-widest text-amber-600">
                  {metadata.difficulty} Level
                </span>
              )}
              {metadata.sources && metadata.sources.length > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                  <ShieldCheck size={10} /> Verified
                </span>
              )}
            </div>
          )}
        </div>

        {/* AI Resources Section */}
        {!isUser && hasResources && (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            {metadata.resources.map((res, i) => (
              <a
                key={i}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/10 rounded-2xl hover:border-primary-500 hover:shadow-md transition-all group/res"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${res.type === 'video' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                  {res.type === 'video' ? <Video size={16} /> : <Book size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-gray-900 dark:text-white truncate">{res.title}</p>
                  <p className="text-[9px] text-gray-500 flex items-center gap-1 capitalize">
                    {res.type} • External <ExternalLink size={8} />
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}

        <p className={`text-[10px] mt-1 font-medium ${isUser ? 'text-gray-400' : 'text-gray-400'}`}>
          {new Date(message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}


