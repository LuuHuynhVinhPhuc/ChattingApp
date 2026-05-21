import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { chatService } from '../services/api';
import { 
  LogOut, Hash, User, Send, Plus, X, 
  MessageSquare, Circle, Wifi, WifiOff, Users, Loader2 
} from 'lucide-react';

export default function ChatDashboard() {
  const { user, logout } = useAuth();
  const { 
    channels, users, activeTarget, messages, typingUsers, 
    connectionStatus, unreadCounts, sendMessage, sendTypingStatus, createChannel, selectTarget 
  } = useChat();

  const [messageInput, setMessageInput] = useState('');
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [modalError, setModalError] = useState('');

  // Channel Membership States
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [membersModalTab, setMembersModalTab] = useState('members');
  const [channelMembers, setChannelMembers] = useState([]);
  const [nonMembers, setNonMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [memberActionLoading, setMemberActionLoading] = useState(null);
  const [memberError, setMemberError] = useState('');

  const loadChannelMembersData = async () => {
    if (activeTarget?.type !== 'channel') return;
    setIsLoadingMembers(true);
    setMemberError('');
    try {
      const membersData = await chatService.getChannelMembers(activeTarget.id);
      setChannelMembers(membersData);

      const nonMembersData = await chatService.getNonMembers(activeTarget.id);
      setNonMembers(nonMembersData);
    } catch (err) {
      console.error(err);
      setMemberError('Failed to load channel members.');
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (showMembersModal && activeTarget?.type === 'channel') {
      loadChannelMembersData();
    }
  }, [showMembersModal, activeTarget]);

  const handleAddMember = async (userId) => {
    if (!activeTarget) return;
    setMemberActionLoading(userId);
    setMemberError('');
    try {
      await chatService.addMember(activeTarget.id, userId);
      await loadChannelMembersData();
    } catch (err) {
      console.error(err);
      setMemberError(err.response?.data?.error?.message || 'Could not add member.');
    } finally {
      setMemberActionLoading(null);
    }
  };

  const handleKickMember = async (userId) => {
    if (!activeTarget) return;
    setMemberActionLoading(userId);
    setMemberError('');
    try {
      await chatService.kickMember(activeTarget.id, userId);
      await loadChannelMembersData();
    } catch (err) {
      console.error(err);
      setMemberError(err.response?.data?.error?.message || 'Could not remove member.');
    } finally {
      setMemberActionLoading(null);
    }
  };

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  // Handle typing indicator debouncer
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    // Send typing: true
    sendTypingStatus(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 2000);
  };

  // Submit message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    await sendMessage(messageInput.trim());
    setMessageInput('');
  };

  // Submit new channel
  const handleCreateChannelSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!newChannelName.trim()) {
      setModalError('Channel name is required.');
      return;
    }

    setIsCreatingChannel(true);
    try {
      await createChannel(newChannelName.trim(), newChannelDesc.trim());
      setNewChannelName('');
      setNewChannelDesc('');
      setShowNewChannelModal(false);
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.error?.message || 'Could not create channel.');
    } finally {
      setIsCreatingChannel(false);
    }
  };

  // Get user avatar initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  // Render typing indicators text
  const getTypingText = () => {
    const typers = Object.values(typingUsers).filter(t => t.isTyping && t.senderId !== user.id);
    if (typers.length === 0) return null;
    if (typers.length === 1) return `${typers[0].userName} is typing...`;
    if (typers.length === 2) return `${typers[0].userName} and ${typers[1].userName} are typing...`;
    return 'Several people are typing...';
  };

  // Format timestamp to hh:mm
  const formatTime = (timeStr) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden relative">
      {/* Background glowing decorations */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar Section */}
      <aside className="w-80 bg-slate-900/60 border-r border-slate-800 flex flex-col z-10 backdrop-blur-md">
        {/* Current User Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20 shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-white text-sm font-semibold truncate leading-tight">{user.name}</h4>
              <p className="text-slate-400 text-xs truncate leading-normal">@{user.username}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            title="Log Out"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Channels list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 px-2">
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Channels</span>
              <button 
                onClick={() => setShowNewChannelModal(true)}
                className="w-5 h-5 rounded hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors duration-200"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <nav className="space-y-0.5">
              {channels.map((chan) => {
                const isActive = activeTarget?.type === 'channel' && activeTarget.id === chan.id;
                return (
                  <button
                    key={chan.id}
                    onClick={() => selectTarget({ type: 'channel', id: chan.id, name: chan.name, description: chan.description })}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm flex items-center justify-between transition-all duration-200 ${
                      isActive 
                        ? 'bg-indigo-600/15 border border-indigo-500/20 text-indigo-200 font-medium' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Hash className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span className="truncate">{chan.name}</span>
                    </div>
                    {unreadCounts && unreadCounts[chan.id] > 0 && (
                      <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0 min-w-[20px] text-center shadow-sm shadow-indigo-600/35">
                        {unreadCounts[chan.id]}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Active Users (Direct Messages) */}
          <div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 px-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Direct Messages
            </div>
            <nav className="space-y-0.5">
              {users.map((u) => {
                const isActive = activeTarget?.type === 'user' && activeTarget.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => selectTarget({ type: 'user', id: u.id, name: u.name })}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm flex items-center justify-between transition-all duration-200 ${
                      isActive 
                        ? 'bg-indigo-600/15 border border-indigo-500/20 text-indigo-200 font-medium' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-semibold shrink-0">
                        {getInitials(u.name)}
                      </div>
                      <span className="truncate">{u.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {unreadCounts && unreadCounts[u.id] > 0 && (
                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm shadow-indigo-600/35">
                          {unreadCounts[u.id]}
                        </span>
                      )}
                      <Circle className={`w-2 h-2 shrink-0 ${
                        u.isOnline ? 'fill-emerald-500 text-emerald-500 animate-pulse' : 'text-slate-700 fill-slate-700'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Connection status footer */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/40 flex items-center gap-2 justify-between">
          <span className="text-xs text-slate-400">Connection Status</span>
          <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1.5 ${
            connectionStatus === 'Connected' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : connectionStatus === 'Connecting' 
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {connectionStatus === 'Connected' ? (
              <>
                <Wifi className="w-3 h-3" /> Connected
              </>
            ) : connectionStatus === 'Connecting' ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" /> Connecting
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" /> Offline
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col z-10 bg-slate-950/20">
        {activeTarget ? (
          <>
            {/* Chat Target Header */}
            <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/10 backdrop-blur-md">
              <div>
                <div className="flex items-center gap-2">
                  {activeTarget.type === 'channel' ? (
                    <Hash className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <User className="w-5 h-5 text-indigo-400" />
                  )}
                  <h3 className="text-white font-semibold">{activeTarget.name}</h3>
                </div>
                {activeTarget.description && (
                  <p className="text-slate-400 text-xs mt-0.5 truncate max-w-lg">{activeTarget.description}</p>
                )}
              </div>

              {activeTarget.type === 'channel' && !['General', 'Random', 'ABP Framework', 'React & Tailwind'].includes(activeTarget.name) && (
                <button
                  onClick={() => {
                    setMembersModalTab('members');
                    setShowMembersModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all duration-200"
                >
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  Manage Members
                </button>
              )}
            </header>

            {/* Message Logs */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-sm">No messages yet. Send a message to start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user.id;
                  return (
                    <div 
                      key={msg.id}
                      className={`flex gap-3 max-w-[70%] animate-fade-in ${
                        isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-semibold shrink-0">
                        {getInitials(msg.senderName)}
                      </div>

                      {/* Content Bubble */}
                      <div className="space-y-1">
                        <div className={`flex items-center gap-2 text-[10px] ${
                          isMe ? 'justify-end text-indigo-300' : 'text-slate-400'
                        }`}>
                          <span className="font-semibold">{msg.senderName}</span>
                          <span>•</span>
                          <span>{formatTime(msg.creationTime)}</span>
                        </div>
                        <div className={`p-3.5 rounded-2xl text-sm ${
                          isMe 
                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10' 
                            : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                        }`}>
                          <p className="whitespace-pre-wrap break-all leading-relaxed">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator message bubble */}
              {getTypingText() && (
                <div className="flex items-center gap-2.5 text-xs text-slate-400 px-12 animate-pulse">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>{getTypingText()}</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Chat input box */}
            <footer className="p-4 bg-slate-950/40 border-t border-slate-800/80">
              <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3 relative">
                <input
                  type="text"
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder={`Send a message to ${activeTarget.name}...`}
                  className="flex-1 px-4 py-3.5 rounded-xl text-white outline-none glass-input text-sm pr-14"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 hover:shadow-[0_0_12px_rgba(99,102,241,0.35)] text-white flex items-center justify-center transition-all duration-200"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-2" />
            <p>Loading your chat room...</p>
          </div>
        )}
      </main>

      {/* New Channel Modal */}
      {showNewChannelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setShowNewChannelModal(false)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" 
          />
          {/* Content */}
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl shadow-2xl relative z-10 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" /> Create Channel
              </h3>
              <button 
                onClick={() => setShowNewChannelModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChannelSubmit} className="space-y-4">
              {modalError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm rounded-xl flex items-center gap-2 animate-fade-in">
                  <Circle className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Channel Name
                </label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="e.g. general-tech"
                  className="w-full px-3.5 py-2.5 rounded-xl text-white outline-none glass-input text-sm"
                  disabled={isCreatingChannel}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  placeholder="Briefly describe what this channel is about"
                  rows="3"
                  className="w-full px-3.5 py-2.5 rounded-xl text-white outline-none glass-input text-sm resize-none"
                  disabled={isCreatingChannel}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewChannelModal(false)}
                  className="px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-sm transition-colors duration-200"
                  disabled={isCreatingChannel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl text-sm transition-all duration-200 flex items-center gap-2 font-medium"
                  disabled={isCreatingChannel}
                >
                  {isCreatingChannel && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setShowMembersModal(false)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" 
          />
          {/* Content */}
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl shadow-2xl relative z-10 animate-slide-up flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" /> Channel Members
                </h3>
                <p className="text-xs text-indigo-300 font-medium">#{activeTarget?.name}</p>
              </div>
              <button 
                onClick={() => setShowMembersModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800/80 mb-4 mt-2 shrink-0">
              <button
                onClick={() => setMembersModalTab('members')}
                className={`flex-1 pb-2.5 text-sm font-semibold transition-all duration-200 border-b-2 ${
                  membersModalTab === 'members' 
                    ? 'text-indigo-400 border-indigo-500' 
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                Members ({channelMembers.length})
              </button>
              <button
                onClick={() => setMembersModalTab('add')}
                className={`flex-1 pb-2.5 text-sm font-semibold transition-all duration-200 border-b-2 ${
                  membersModalTab === 'add' 
                    ? 'text-indigo-400 border-indigo-500' 
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                Add Member ({nonMembers.length})
              </button>
            </div>

            {memberError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2 mb-4 shrink-0 animate-fade-in">
                <Circle className="w-2 h-2 fill-rose-500 text-rose-500" />
                <span>{memberError}</span>
              </div>
            )}

            {/* List area */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-[250px]">
              {isLoadingMembers ? (
                <div className="h-full flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                </div>
              ) : membersModalTab === 'members' ? (
                channelMembers.length === 0 ? (
                  <p className="text-center text-slate-500 text-xs py-8">No members found.</p>
                ) : (
                  channelMembers.map((memberUser) => (
                    <div key={memberUser.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/40">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-semibold shrink-0">
                          {getInitials(memberUser.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-xs font-semibold truncate leading-tight flex items-center gap-1.5">
                            {memberUser.name}
                            {memberUser.id === user.id && <span className="text-[10px] bg-indigo-600/20 text-indigo-400 px-1 rounded font-normal">(You)</span>}
                          </p>
                          <p className="text-slate-500 text-[10px] truncate leading-normal">@{memberUser.userName}</p>
                        </div>
                      </div>
                      
                      {memberUser.id !== user.id && (
                        <button
                          onClick={() => handleKickMember(memberUser.id)}
                          disabled={memberActionLoading !== null}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-500/20 border border-rose-500/10 hover:border-transparent transition-all duration-200 disabled:opacity-50 flex items-center gap-1"
                        >
                          {memberActionLoading === memberUser.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            'Kick'
                          )}
                        </button>
                      )}
                    </div>
                  ))
                )
              ) : (
                nonMembers.length === 0 ? (
                  <p className="text-center text-slate-500 text-xs py-8">All users are members of this channel.</p>
                ) : (
                  nonMembers.map((nonMemberUser) => (
                    <div key={nonMemberUser.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/40">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-semibold shrink-0">
                          {getInitials(nonMemberUser.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-xs font-semibold truncate leading-tight">{nonMemberUser.name}</p>
                          <p className="text-slate-500 text-[10px] truncate leading-normal">@{nonMemberUser.userName}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleAddMember(nonMemberUser.id)}
                        disabled={memberActionLoading !== null}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-400 hover:text-white hover:bg-emerald-500/20 border border-emerald-500/10 hover:border-transparent transition-all duration-200 disabled:opacity-50 flex items-center gap-1"
                      >
                        {memberActionLoading === nonMemberUser.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          'Add'
                        )}
                      </button>
                    </div>
                  ))
                )
              )}
            </div>

            <div className="flex justify-end mt-4 pt-2 border-t border-slate-800/60 shrink-0">
              <button
                type="button"
                onClick={() => setShowMembersModal(false)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs transition-colors duration-200 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
