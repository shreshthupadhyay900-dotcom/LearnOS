import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Search, Zap, Bot, ShieldCheck, Check, CheckCheck, Loader, Clock, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function timeAgo(date) {
  if (!date) return '';
  const secs = Math.floor((Date.now() - new Date(date)) / 1000);
  if (secs < 60) return 'now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`;
  return new Date(date).toLocaleDateString();
}

function Avatar({ name, role, size = 'md' }) {
  const sz = size === 'sm' ? 'w-9 h-9 text-sm rounded-xl' : size === 'lg' ? 'w-16 h-16 text-2xl rounded-[20px]' : 'w-12 h-12 text-lg rounded-2xl';
  const bg = role === 'teacher' ? 'bg-indigo-500 text-white' : 'bg-primary-500 text-white';
  return (
    <div className={`${sz} ${bg} flex items-center justify-center font-display font-black shrink-0 shadow-sm`}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
}

function ContactCard({ contact, isActive, onClick }) {
  return (
    <button onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all flex items-center gap-3 group ${isActive ? 'bg-indigo-500 text-white shadow-glow-sm' : 'hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
      <div className="relative shrink-0">
        <Avatar name={contact.name} role={contact.role} size="sm" />
        {contact.unread > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-white text-[9px] flex items-center justify-center font-black">{contact.unread}</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{contact.name}</p>
          <span className={`text-[9px] font-bold shrink-0 ml-2 ${isActive ? 'text-white/60' : 'text-gray-400'}`}>{timeAgo(contact.lastTime)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-black uppercase tracking-wider ${isActive ? 'text-white/60' : contact.role === 'teacher' ? 'text-indigo-500' : 'text-primary-500'}`}>
            {contact.role === 'teacher' ? '🎓 Faculty' : '👤 Student'}
          </span>
          {contact.lastMessage && (
            <p className={`text-[10px] truncate ${isActive ? 'text-white/60' : 'text-gray-400'}`}>· {contact.lastMessage}</p>
          )}
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ msg, isOwn }) {
  const isAI = msg.relatedTo === 'tutor';
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwn && <Avatar name={msg.sender?.name} role={msg.sender?.role} size="sm" />}
      <div className={`max-w-[70%] space-y-1 ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{msg.sender?.name}</p>}
        <div className={`px-4 py-3 rounded-[20px] text-sm font-medium leading-relaxed shadow-sm ${
          isOwn
            ? 'bg-indigo-500 text-white rounded-br-md'
            : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-white border border-gray-100 dark:border-white/5 rounded-bl-md'
        }`}>
          {isAI && <div className="flex items-center gap-1 mb-1 text-[9px] font-black uppercase text-indigo-300"><Bot size={10} /> AI Assisted</div>}
          {msg.content}
        </div>
        <div className={`flex items-center gap-1 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[9px] text-gray-400 font-bold">{timeAgo(msg.createdAt)}</span>
          {isOwn && (msg.isRead ? <CheckCheck size={12} className="text-indigo-400" /> : <Check size={12} className="text-gray-400" />)}
        </div>
      </div>
    </motion.div>
  );
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);
  const location = window.location; // Use location state if available

  useEffect(() => {
    fetchContacts();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  // Handle initial contact from state
  useEffect(() => {
    if (contacts.length > 0 && !activeContact) {
      // Check if we came from another page with a target student
      const targetId = window.history.state?.usr?.targetContactId;
      if (targetId) {
        const target = contacts.find(c => c._id === targetId);
        if (target) setActiveContact(target);
      } else if (!activeContact && window.innerWidth >= 1024) {
        // Default to first contact on desktop
        setActiveContact(contacts[0]);
      }
    }
  }, [contacts]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeContact) {
      fetchConversation(activeContact._id);
      // Poll every 5s for new messages
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => fetchConversation(activeContact._id, true), 5000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeContact?._id]);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/messages/contacts');
      setContacts(res.data.contacts || []);
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchConversation = async (contactId, silent = false) => {
    if (!silent) setLoadingMsgs(true);
    try {
      const res = await api.get(`/messages?with=${contactId}`);
      setMessages(res.data.messages || []);
      // Refresh unread badge in contacts
      setContacts(prev => prev.map(c => c._id === contactId ? { ...c, unread: 0 } : c));
    } catch (err) {
      console.error('Failed to fetch conversation:', err);
    } finally {
      if (!silent) setLoadingMsgs(false);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || !activeContact || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    // Optimistic update
    const optimistic = {
      _id: `temp-${Date.now()}`,
      sender: { _id: user._id, name: user.name, role: user.role },
      receiver: { _id: activeContact._id, name: activeContact.name, role: activeContact.role },
      content: text,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedTo: 'general'
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const res = await api.post('/messages', { receiverId: activeContact._id, content: text });
      // Replace optimistic with real
      setMessages(prev => prev.map(m => m._id === optimistic._id ? res.data.message : m));
      // Update last message in contact list
      setContacts(prev => prev.map(c => c._id === activeContact._id
        ? { ...c, lastMessage: text, lastTime: new Date().toISOString() }
        : c
      ));
    } catch (err) {
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const selectContact = (contact) => {
    setActiveContact(contact);
    setShowSidebar(false);
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = contacts.reduce((sum, c) => sum + (c.unread || 0), 0);

  return (
    <div className="flex h-[calc(100vh-4.5rem-2rem)] gap-0 max-w-7xl mx-auto overflow-hidden rounded-[32px] shadow-glow-lg border border-gray-100 dark:border-white/5">
      {/* Contacts Sidebar */}
      <div className={`${showSidebar ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-80 bg-white dark:bg-slate-950 border-r border-gray-100 dark:border-white/5 shrink-0`}>
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-black text-xl uppercase italic tracking-tighter text-gray-900 dark:text-white flex items-center gap-2">
                Uplink
                {totalUnread > 0 && (
                  <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full font-black">{totalUnread}</span>
                )}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {user?.role === 'teacher' ? '🎓 Faculty Portal' : '📡 Student Portal'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Zap size={18} className="text-indigo-500" />
            </div>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${user?.role === 'teacher' ? 'students' : 'teachers'}...`}
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none focus:border-indigo-500 transition-all" />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loadingContacts ? (
            <div className="flex items-center justify-center h-32">
              <Loader size={20} className="text-indigo-500 animate-spin" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-16 px-6 opacity-50">
              <MessageSquare size={32} className="mx-auto mb-3 text-gray-400" />
              <p className="text-xs font-bold text-gray-500">
                {contacts.length === 0
                  ? `No ${user?.role === 'teacher' ? 'students' : 'teachers'} registered yet.`
                  : 'No results found.'}
              </p>
            </div>
          ) : filteredContacts.map(contact => (
            <ContactCard key={contact._id} contact={contact}
              isActive={activeContact?._id === contact._id}
              onClick={() => selectContact(contact)} />
          ))}
        </div>

        {/* Footer hint */}
        <div className="p-4 border-t border-gray-100 dark:border-white/5 text-center">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
            {user?.role === 'student' ? '💬 Your teachers can see all messages' : '📡 Respond to student doubts'}
          </p>
        </div>
      </div>

      {/* Chat Panel */}
      <div className={`${!showSidebar ? 'flex' : 'hidden'} lg:flex flex-1 flex-col bg-gray-50 dark:bg-slate-900`}>
        {activeContact ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-white/5 shrink-0">
              <button onClick={() => setShowSidebar(true)} className="lg:hidden p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white">
                <ArrowLeft size={20} />
              </button>
              <div className="relative">
                <Avatar name={activeContact.name} role={activeContact.role} />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-black text-lg uppercase italic tracking-tighter text-gray-900 dark:text-white">{activeContact.name}</h3>
                <div className="flex items-center gap-2">
                  {activeContact.role === 'teacher' ? (
                    <><ShieldCheck size={11} className="text-indigo-500" /><span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Faculty</span></>
                  ) : (
                    <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Online</span></>
                  )}
                  <span className="text-[10px] text-gray-400 font-bold">· {activeContact.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-32">
                  <Loader size={20} className="text-indigo-500 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                  <div className="w-16 h-16 rounded-[24px] bg-gray-200 dark:bg-slate-800 flex items-center justify-center">
                    <MessageSquare size={28} className="text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-500">Start the conversation</p>
                    <p className="text-xs text-gray-400 mt-1">Send a message to {activeContact.name}</p>
                  </div>
                </div>
              ) : (
                messages.map(msg => (
                  <MessageBubble key={msg._id} msg={msg} isOwn={msg.sender?._id === user?._id || msg.sender?._id?.toString() === user?.id?.toString()} />
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-white/5 shrink-0">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder={`Message ${activeContact.name}...`}
                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl py-3.5 px-5 text-sm font-medium outline-none focus:border-indigo-500 transition-all" />
                </div>
                <motion.button whileTap={{ scale: 0.92 }} type="submit"
                  disabled={!input.trim() || sending}
                  className="w-12 h-12 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-glow-sm transition-all disabled:opacity-50 shrink-0">
                  {sending ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                </motion.button>
              </form>
              <p className="text-[9px] font-black uppercase tracking-widest text-center text-gray-400 mt-2">
                🔒 Secure Channel · Auto-refreshes every 5s
              </p>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-[32px] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Zap size={40} className="text-indigo-500" />
              </div>
              <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-[32px] animate-ping opacity-30" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-display font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">
                Uplink Ready
              </h3>
              <p className="text-sm text-gray-500 font-medium max-w-xs">
                {user?.role === 'teacher'
                  ? 'Select a student from the left to open a direct channel for doubt clarification.'
                  : 'Select a teacher from the left to ask questions and resolve doubts instantly.'}
              </p>
            </div>
            <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
              <div className="flex items-center gap-1.5"><Check size={12} className="text-emerald-500" /> Encrypted</div>
              <div className="flex items-center gap-1.5"><Clock size={12} className="text-indigo-500" /> Real-time</div>
              <div className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-primary-500" /> Secure</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
