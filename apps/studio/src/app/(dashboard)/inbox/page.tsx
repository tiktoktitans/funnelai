'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Send,
  Phone,
  Mail,
  Clock,
  Star,
  Archive,
  Trash2,
  CheckCheck,
  Check,
  Filter,
  MoreVertical,
  Paperclip,
  Smile,
  User,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  conversationId: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: Date;
  attachments?: string[];
}

interface Conversation {
  id: string;
  contactId: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  channel: 'sms' | 'email';
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  starred: boolean;
  archived: boolean;
  messages: Message[];
}

export default function InboxPage() {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChannel, setFilterChannel] = useState<'all' | 'sms' | 'email'>('all');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockConversations: Conversation[] = [
        {
          id: '1',
          contactId: 'c1',
          contactName: 'John Smith',
          contactEmail: 'john@example.com',
          contactPhone: '+1234567890',
          channel: 'sms',
          lastMessage: 'Thanks for the info! I\'ll review and get back to you.',
          lastMessageAt: new Date(Date.now() - 1000 * 60 * 5),
          unreadCount: 2,
          starred: true,
          archived: false,
          messages: [
            {
              id: 'm1',
              conversationId: '1',
              content: 'Hi! I\'m interested in your coaching program.',
              direction: 'inbound',
              status: 'read',
              createdAt: new Date(Date.now() - 1000 * 60 * 30),
            },
            {
              id: 'm2',
              conversationId: '1',
              content: 'Hello John! Thanks for reaching out. I\'d be happy to tell you more about our program.',
              direction: 'outbound',
              status: 'delivered',
              createdAt: new Date(Date.now() - 1000 * 60 * 25),
            },
            {
              id: 'm3',
              conversationId: '1',
              content: 'Thanks for the info! I\'ll review and get back to you.',
              direction: 'inbound',
              status: 'read',
              createdAt: new Date(Date.now() - 1000 * 60 * 5),
            },
          ]
        },
        {
          id: '2',
          contactId: 'c2',
          contactName: 'Sarah Johnson',
          contactEmail: 'sarah@example.com',
          channel: 'email',
          lastMessage: 'Looking forward to our call tomorrow at 2 PM EST.',
          lastMessageAt: new Date(Date.now() - 1000 * 60 * 60),
          unreadCount: 0,
          starred: false,
          archived: false,
          messages: [
            {
              id: 'm4',
              conversationId: '2',
              content: 'Hi! I saw your webinar and would love to learn more.',
              direction: 'inbound',
              status: 'read',
              createdAt: new Date(Date.now() - 1000 * 60 * 120),
            },
            {
              id: 'm5',
              conversationId: '2',
              content: 'Great to hear from you Sarah! Let\'s schedule a call to discuss.',
              direction: 'outbound',
              status: 'delivered',
              createdAt: new Date(Date.now() - 1000 * 60 * 90),
            },
            {
              id: 'm6',
              conversationId: '2',
              content: 'Looking forward to our call tomorrow at 2 PM EST.',
              direction: 'inbound',
              status: 'read',
              createdAt: new Date(Date.now() - 1000 * 60 * 60),
            },
          ]
        },
        {
          id: '3',
          contactId: 'c3',
          contactName: 'Mike Wilson',
          contactPhone: '+1987654321',
          channel: 'sms',
          lastMessage: 'Can you send me the pricing details?',
          lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          unreadCount: 1,
          starred: false,
          archived: false,
          messages: [
            {
              id: 'm7',
              conversationId: '3',
              content: 'Can you send me the pricing details?',
              direction: 'inbound',
              status: 'delivered',
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
            },
          ]
        },
      ];

      setConversations(mockConversations);
      if (mockConversations.length > 0) {
        setSelectedConversation(mockConversations[0]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const newMessage: Message = {
        id: `m${Date.now()}`,
        conversationId: selectedConversation.id,
        content: messageText,
        direction: 'outbound',
        status: 'sent',
        createdAt: new Date(),
      };

      // Update local state
      setSelectedConversation({
        ...selectedConversation,
        messages: [...selectedConversation.messages, newMessage],
        lastMessage: messageText,
        lastMessageAt: new Date(),
      });

      setConversations(prev =>
        prev.map(c =>
          c.id === selectedConversation.id
            ? {
                ...c,
                messages: [...c.messages, newMessage],
                lastMessage: messageText,
                lastMessageAt: new Date(),
              }
            : c
        )
      );

      setMessageText('');

      // Send to API
      const endpoint = selectedConversation.channel === 'sms'
        ? '/api/messages/sms'
        : '/api/messages/email';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          contactId: selectedConversation.contactId,
          content: messageText,
          to: selectedConversation.channel === 'sms'
            ? selectedConversation.contactPhone
            : selectedConversation.contactEmail,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      // Update message status to delivered
      setTimeout(() => {
        setSelectedConversation(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map(m =>
              m.id === newMessage.id ? { ...m, status: 'delivered' } : m
            ),
          };
        });
      }, 1000);

    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const toggleStar = (conversationId: string) => {
    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId ? { ...c, starred: !c.starred } : c
      )
    );
  };

  const archiveConversation = (conversationId: string) => {
    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId ? { ...c, archived: true } : c
      )
    );
    toast({
      title: "Conversation archived",
      description: "The conversation has been archived.",
    });
  };

  const filteredConversations = conversations.filter(c => {
    if (filterChannel !== 'all' && c.channel !== filterChannel) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        c.contactName.toLowerCase().includes(term) ||
        c.lastMessage.toLowerCase().includes(term) ||
        c.contactEmail?.toLowerCase().includes(term) ||
        c.contactPhone?.includes(term)
      );
    }
    return !c.archived;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Conversations List */}
      <div className="w-96 border-r border-gray-200 flex flex-col">
        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterChannel('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterChannel === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterChannel('sms')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterChannel === 'sms'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Phone className="w-4 h-4 inline mr-1" />
              SMS
            </button>
            <button
              onClick={() => setFilterChannel('email')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterChannel === 'email'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </button>
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                  {conversation.contactName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 truncate">
                      {conversation.contactName}
                    </h4>
                    <div className="flex items-center gap-1">
                      {conversation.starred && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(conversation.lastMessageAt, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {conversation.channel === 'sms' ? (
                      <Phone className="w-3 h-3 text-green-600" />
                    ) : (
                      <Mail className="w-3 h-3 text-cyan-600" />
                    )}
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mt-1">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation View */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Conversation Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                  {selectedConversation.contactName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedConversation.contactName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedConversation.channel === 'sms'
                      ? selectedConversation.contactPhone
                      : selectedConversation.contactEmail}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleStar(selectedConversation.id)}
                  className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                >
                  <Star
                    className={`w-5 h-5 ${
                      selectedConversation.starred
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
                <button
                  onClick={() => archiveConversation(selectedConversation.id)}
                  className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                >
                  <Archive className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-white/50 transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {selectedConversation.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-md px-4 py-2 rounded-2xl ${
                    message.direction === 'outbound'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className={`text-xs ${
                        message.direction === 'outbound'
                          ? 'text-blue-100'
                          : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {message.direction === 'outbound' && (
                      <>
                        {message.status === 'read' && (
                          <CheckCheck className="w-3 h-3 text-blue-200" />
                        )}
                        {message.status === 'delivered' && (
                          <CheckCheck className="w-3 h-3 text-blue-100" />
                        )}
                        {message.status === 'sent' && (
                          <Check className="w-3 h-3 text-blue-100" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-end gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Paperclip className="w-5 h-5 text-gray-400" />
              </button>
              <div className="flex-1 relative">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={`Type a ${selectedConversation.channel === 'sms' ? 'text message' : 'email'}...`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={1}
                />
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Smile className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={sendMessage}
                disabled={!messageText.trim() || sending}
                className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No conversation selected</h3>
            <p className="text-gray-600 mt-1">Choose a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}