import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, MessageSquare, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import io from 'socket.io-client';
import api from '../../lib/axios';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const API_SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

const ChatPage = () => {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const partnerIdParam = searchParams.get('partnerId');
  const partnerNameParam = searchParams.get('name');

  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 1. Fetch conversations
  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/chat/conversations');
      if (data.success) {
        let list = data.conversations || [];
        
        // If query param exists and partner not in active chats, prepend a mock conversation entry
        if (partnerIdParam && !list.some((c) => c.partner._id === partnerIdParam)) {
          const newPartner = {
            _id: partnerIdParam,
            fullName: partnerNameParam || 'Seller',
            role: 'seller',
            lastActive: new Date().toISOString()
          };
          list = [
            {
              partner: newPartner,
              lastMessage: 'Start typing to chat...',
              lastMessageTime: new Date().toISOString(),
              unreadCount: 0
            },
            ...list
          ];
        }
        
        setConversations(list);

        // Auto-select the partner from query params
        if (partnerIdParam) {
          const matched = list.find((c) => c.partner._id === partnerIdParam);
          if (matched) {
            setSelectedConv(matched);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // 2. Setup socket connection
  useEffect(() => {
    const newSocket = io(API_SOCKET_URL, {
      transports: ['websocket', 'polling']
    });
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Register user mapping
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit('register_user', user._id);
    }
  }, [socket, user]);

  // 3. Join room and fetch messages when conversation is selected
  useEffect(() => {
    if (!socket || !selectedConv) return;

    const partnerId = selectedConv.partner._id;
    const currentUserId = user._id;
    // Room ID is sorted alphabetical combination of both IDs
    const roomId = [currentUserId, partnerId].sort().join('_');

    socket.emit('join_room', roomId);

    // Fetch message logs
    const fetchMessages = async () => {
      setLoadingMsgs(true);
      try {
        const { data } = await api.get(`/chat/${partnerId}`);
        if (data.success) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoadingMsgs(false);
      }
    };

    fetchMessages();

    // Listen for new messages
    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.partner._id === partnerId || c.partner._id === msg.sender
            ? { ...c, lastMessage: msg.message, lastMessageTime: msg.createdAt }
            : c
        )
      );
    });

    // Listen for typing events
    socket.on('typing', (data) => {
      if (data.sender === partnerId) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('typing');
    };
  }, [socket, selectedConv]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle typing alerts
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!socket || !selectedConv) return;

    const partnerId = selectedConv.partner._id;
    const currentUserId = user._id;
    const roomId = [currentUserId, partnerId].sort().join('_');

    socket.emit('typing', { room: roomId, isTyping: true, sender: currentUserId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { room: roomId, isTyping: false, sender: currentUserId });
    }, 1500);
  };

  // Send message
  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socket || !selectedConv) return;

    const partnerId = selectedConv.partner._id;
    const currentUserId = user._id;
    const roomId = [currentUserId, partnerId].sort().join('_');

    const msgData = {
      sender: currentUserId,
      receiver: partnerId,
      message: inputText.trim(),
      room: roomId
    };

    // Emit to socket
    socket.emit('send_message', msgData);

    // Optimistic local update (socket receive will trigger too, but this makes it instant)
    // Actually, backend socket handler emits receive_message to room, so we let the listener handle it to keep single-source-of-truth.
    
    setInputText('');
    socket.emit('typing', { room: roomId, isTyping: false, sender: currentUserId });
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-primary-900/40 border border-primary-800 rounded-3xl overflow-hidden shadow-luxury animate-fade-up">
      {/* Sidebar - Conversations */}
      <div className="w-full md:w-80 border-r border-primary-800 flex flex-col justify-between shrink-0">
        <div className="p-4 border-b border-primary-800 bg-primary-950/20">
          <h2 className="text-lg font-bold text-primary-100 flex items-center gap-2">
            <MessageSquare size={18} className="text-accent-gold" /> Chat Inbox
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {loadingConv ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Loader2 size={24} className="text-accent-gold animate-spin" />
              <span className="text-primary-500 text-xs">Loading inbox...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-20 text-primary-500 text-xs">
              <MessageSquare size={30} className="mx-auto mb-3 text-primary-600" />
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.partner._id}
                onClick={() => setSelectedConv(conv)}
                className={`w-full flex gap-3 p-3 rounded-xl transition-all duration-200 text-left ${
                  selectedConv?.partner._id === conv.partner._id
                    ? 'bg-accent-gold/10 border border-accent-gold/25'
                    : 'hover:bg-primary-800/40 border border-transparent'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center text-primary-200 font-bold shrink-0 relative">
                  {conv.partner.fullName[0]}
                  {/* Online dot logic based on lastActive within 15 mins */}
                  {new Date() - new Date(conv.partner.lastActive) < 15 * 60 * 1000 && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-primary-950" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-xs font-bold text-primary-100 truncate">{conv.partner.fullName}</span>
                    {conv.lastMessageTime && (
                      <span className="text-[9px] text-primary-500">
                        {new Date(conv.lastMessageTime).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-primary-400 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="min-w-[16px] h-4 rounded-full bg-accent-gold text-primary-950 text-[10px] font-black flex items-center justify-center shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Dialogue Panel */}
      <div className="hidden md:flex flex-col flex-grow bg-primary-950/20 justify-between">
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-primary-800 bg-primary-900/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-primary-100">{selectedConv.partner.fullName}</h3>
                <span className="text-[10px] text-primary-500 uppercase tracking-wider">
                  {selectedConv.partner.role} • {selectedConv.partner.mobile}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                {new Date() - new Date(selectedConv.partner.lastActive) < 15 * 60 * 1000 ? (
                  <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Now</>
                ) : (
                  <span className="text-primary-500">
                    Active {new Date(selectedConv.partner.lastActive).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {loadingMsgs ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                  <Loader2 size={30} className="text-accent-gold animate-spin" />
                  <span className="text-primary-500 text-xs">Loading dialogue history...</span>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender === user._id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md p-4 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-accent-gold text-primary-950 font-medium rounded-tr-none'
                            : 'bg-primary-900 text-primary-100 rounded-tl-none border border-primary-800'
                        }`}
                      >
                        <p className="break-words">{msg.message}</p>
                        <span className={`text-[9px] block text-right mt-1.5 ${isMe ? 'text-primary-950/70' : 'text-primary-500'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-primary-900 text-primary-400 p-3 rounded-2xl rounded-tl-none border border-primary-800 text-xs italic flex items-center gap-1.5">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce delay-200" />
                    </span>
                    Typing...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSend} className="p-4 border-t border-primary-800 bg-primary-900/40 flex gap-2">
              <input
                value={inputText}
                onChange={handleInputChange}
                className="input flex-1 h-11"
                placeholder="Type a message..."
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="btn-primary shrink-0 w-11 h-11 p-0 flex items-center justify-center disabled:opacity-50"
              >
                <Send size={15} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-primary-500 text-sm">
            <MessageSquare size={48} className="text-primary-800 mb-3" />
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
