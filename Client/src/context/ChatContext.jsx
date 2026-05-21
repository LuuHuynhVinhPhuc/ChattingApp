import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { chatService } from '../services/api';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  
  const [channels, setChannels] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTarget, setActiveTarget] = useState(null); // { type: 'channel' | 'user', id: string, name: string }
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({}); // { [userId]: { userName: string, isTyping: boolean, channelId?: string } }
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({}); // { [id]: number }

  const hubConnectionRef = useRef(null);
  const activeTargetRef = useRef(null);

  // Keep a ref of active target so SignalR event handlers always read the fresh value
  useEffect(() => {
    activeTargetRef.current = activeTarget;
  }, [activeTarget]);

  // Fetch initial channels and users list when logged in
  const loadInitialData = async () => {
    try {
      const channelsData = await chatService.getChannels();
      setChannels(channelsData);

      const usersData = await chatService.getUsers();
      setUsers(usersData);

      // Setup default active target (General channel)
      if (channelsData.length > 0 && !activeTargetRef.current) {
        const general = channelsData.find(c => c.name.toLowerCase() === 'general') || channelsData[0];
        setActiveTarget({ type: 'channel', id: general.id, name: general.name, description: general.description });
      }
    } catch (err) {
      console.error('Failed to load initial chat data:', err);
    }
  };

  useEffect(() => {
    if (!user || !token) {
      // Cleanup when logged out
      if (hubConnectionRef.current) {
        hubConnectionRef.current.stop();
        hubConnectionRef.current = null;
      }
      setChannels([]);
      setUsers([]);
      setActiveTarget(null);
      setMessages([]);
      setTypingUsers({});
      setConnectionStatus('Disconnected');
      setOnlineUserIds(new Set());
      return;
    }

    loadInitialData();

    // Configure SignalR Connection
    const connection = new HubConnectionBuilder()
      .withUrl('https://localhost:44342/signalr-hubs/chat', {
        accessTokenFactory: () => localStorage.getItem('token')
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    hubConnectionRef.current = connection;

    // Real-time Event Listeners
    connection.on('ReceiveMessage', (messageDto) => {
      const currentTarget = activeTargetRef.current;
      
      const isCurrentChannel = currentTarget && currentTarget.type === 'channel' && messageDto.channelId === currentTarget.id;
      const isCurrentPrivate = currentTarget && currentTarget.type === 'user' && 
        ((messageDto.senderId === currentTarget.id && messageDto.receiverId === user.id) ||
         (messageDto.senderId === user.id && messageDto.receiverId === currentTarget.id));

      if (isCurrentChannel || isCurrentPrivate) {
        setMessages(prev => {
          // Avoid duplicate messages
          if (prev.some(m => m.id === messageDto.id)) return prev;
          return [...prev, messageDto];
        });
      } else {
        // If message is from someone else, increment unread count for that channel or sender
        if (messageDto.senderId !== user.id) {
          const key = messageDto.channelId || messageDto.senderId;
          if (key) {
            setUnreadCounts(prev => ({
              ...prev,
              [key]: (prev[key] || 0) + 1
            }));
          }
        }
      }
    });

    connection.on('UserOnline', (userId) => {
      setOnlineUserIds(prev => {
        const next = new Set(prev);
        next.add(userId);
        return next;
      });
      // Set user's online state in list
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isOnline: true } : u));
    });

    connection.on('UserOffline', (userId) => {
      setOnlineUserIds(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isOnline: false } : u));
    });

    connection.on('UserTyping', (data) => {
      // data: { senderId: string, userName: string, isTyping: boolean, channelId?: string }
      const currentTarget = activeTargetRef.current;
      if (!currentTarget) return;

      const isTargetChannel = currentTarget.type === 'channel' && data.channelId === currentTarget.id;
      const isTargetPrivate = currentTarget.type === 'user' && !data.channelId && data.senderId === currentTarget.id;

      if (isTargetChannel || isTargetPrivate) {
        setTypingUsers(prev => {
          const next = { ...prev };
          if (data.isTyping) {
            next[data.senderId] = { userName: data.userName, ...data };
          } else {
            delete next[data.senderId];
          }
          return next;
        });
      }
    });

    connection.on('AddedToChannel', (channelDto) => {
      setChannels(prev => {
        if (prev.some(c => c.id === channelDto.id)) return prev;
        return [...prev, channelDto];
      });
      if (hubConnectionRef.current) {
        hubConnectionRef.current.invoke('JoinChannel', channelDto.id)
          .catch(err => console.error(`Failed to join channel group ${channelDto.id}:`, err));
      }
    });

    connection.on('KickedFromChannel', (channelId) => {
      setChannels(prev => prev.filter(c => c.id !== channelId));
      if (hubConnectionRef.current) {
        hubConnectionRef.current.invoke('LeaveChannel', channelId)
          .catch(err => console.error(`Failed to leave channel group ${channelId}:`, err));
      }

      const currentTarget = activeTargetRef.current;
      if (currentTarget && currentTarget.type === 'channel' && currentTarget.id === channelId) {
        setChannels(currentChannels => {
          const general = currentChannels.find(c => c.name.toLowerCase() === 'general') || currentChannels[0];
          if (general) {
            setActiveTarget({ type: 'channel', id: general.id, name: general.name, description: general.description });
          } else {
            setActiveTarget(null);
          }
          return currentChannels;
        });
        alert('You have been removed from this channel.');
      }
    });

    // Start Connection
    const startConnection = async () => {
      setConnectionStatus('Connecting');
      try {
        await connection.start();
        setConnectionStatus('Connected');
        console.log('SignalR Connected.');

        // Get initial online users from Hub
        const onlineUsers = await connection.invoke('GetOnlineUsersList');
        setOnlineUserIds(new Set(onlineUsers));
        setUsers(prev => prev.map(u => onlineUsers.includes(u.id) ? { ...u, isOnline: true } : u));
      } catch (err) {
        console.error('SignalR connection error:', err);
        setConnectionStatus('Failed');
        // Retry connection in 5 seconds
        setTimeout(startConnection, 5000);
      }
    };

    startConnection();

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [user, token]);

  // Load message history when active target changes
  useEffect(() => {
    if (!activeTarget || !user) return;
    
    const fetchHistory = async () => {
      setMessages([]);
      setTypingUsers({});
      try {
        if (activeTarget.type === 'channel') {
          const history = await chatService.getChannelMessages(activeTarget.id);
          setMessages(history);
        } else if (activeTarget.type === 'user') {
          const history = await chatService.getPrivateMessages(activeTarget.id);
          setMessages(history);
        }
      } catch (err) {
        console.error('Error fetching message history:', err);
      }
    };

    fetchHistory();
  }, [activeTarget]);

  // Join all channel SignalR groups when connection is established or channels are updated
  useEffect(() => {
    if (connectionStatus === 'Connected' && hubConnectionRef.current && channels.length > 0) {
      channels.forEach(chan => {
        hubConnectionRef.current.invoke('JoinChannel', chan.id)
          .catch(err => console.error(`Failed to join channel group ${chan.id}:`, err));
      });
    }
  }, [connectionStatus, channels]);

  // Send message API + update local list
  const sendMessage = async (messageText) => {
    if (!activeTarget) return;
    try {
      const receiverId = activeTarget.type === 'user' ? activeTarget.id : null;
      const channelId = activeTarget.type === 'channel' ? activeTarget.id : null;
      
      const sentDto = await chatService.sendMessage(messageText, receiverId, channelId);
      
      setMessages(prev => {
        if (prev.some(m => m.id === sentDto.id)) return prev;
        return [...prev, sentDto];
      });
      
      // Stop typing indicator on message sent
      sendTypingStatus(false);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Broadcast typing indicator over SignalR
  const sendTypingStatus = (isTyping) => {
    if (!hubConnectionRef.current || connectionStatus !== 'Connected' || !activeTarget) return;

    const receiverId = activeTarget.type === 'user' ? activeTarget.id : null;
    const channelId = activeTarget.type === 'channel' ? activeTarget.id : null;

    hubConnectionRef.current.invoke('SendTypingIndicator', receiverId, channelId, isTyping)
      .catch(err => console.error('Typing indicator error:', err));
  };

  // Create channel API
  const createChannel = async (name, description) => {
    try {
      const newChannel = await chatService.createChannel(name, description);
      setChannels(prev => [...prev, newChannel]);
      // Select the new channel
      setActiveTarget({ type: 'channel', id: newChannel.id, name: newChannel.name, description: newChannel.description });
      return newChannel;
    } catch (err) {
      console.error('Failed to create channel:', err);
      throw err;
    }
  };

  const selectTarget = (target) => {
    setActiveTarget(target);
    if (target) {
      setUnreadCounts(prev => {
        if (!prev[target.id]) return prev;
        const next = { ...prev };
        delete next[target.id];
        return next;
      });
    }
  };

  return (
    <ChatContext.Provider value={{
      channels,
      users,
      activeTarget,
      messages,
      typingUsers,
      connectionStatus,
      unreadCounts,
      sendMessage,
      sendTypingStatus,
      createChannel,
      selectTarget
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
