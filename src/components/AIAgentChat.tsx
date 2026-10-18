import React, { useState, useEffect, useRef } from 'react';
import { 
  ChatMessage, 
  AgentAction, 
  CartItem, 
  Order 
} from '../types/pizza';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  ShoppingBag, 
  Flame, 
  Tag, 
  MapPin, 
  RotateCcw,
  Bot
} from 'lucide-react';

interface AIAgentChatProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  activeOrder: Order | null;
  onExecuteAction: (action: AgentAction) => void;
  onOpenTracker: () => void;
  onOpenCheckout: () => void;
}

export const AIAgentChat: React.FC<AIAgentChatProps> = ({
  isOpen,
  onClose,
  cart,
  activeOrder,
  onExecuteAction,
  onOpenTracker,
  onOpenCheckout,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: `Ciao! I am Nonna Gina, your master woodfire pizzaiolo AI concierge! 🍕🔥 Tell me what you're craving, order with your voice, ask for deals, or have me build your custom pie!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Web Speech API Voice Synthesis (Agent speaking)
  const speakText = (text: string) => {
    if (!isSpeakingEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    try {
      window.speechSynthesis.cancel();
      // Clean markdown or emojis for smoother TTS
      const cleanText = text.replace(/[*_#~`]/g, '').replace(/[^\x20-\x7E\u00A0-\u00FF]/g, ' ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // Web Speech API Recognition (User speaking)
  const toggleVoiceRecognition = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice speech recognition is not supported in this browser. Please type your message instead.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSendMessage(transcript, true);
        }
        setIsListening(false);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Could not start speech recognition:', err);
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string, wasVoice = false) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoiceInput: wasVoice,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          cart,
          activeOrder,
          history: messages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            text: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const agentReply = data.text || "Perfetto! Your woodfire order is coming right up!";
      const agentActions: AgentAction[] = data.actions || [];

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: agentReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: agentActions,
      };

      setMessages((prev) => [...prev, agentMessage]);

      // Speak response aloud if TTS is enabled
      speakText(agentReply);

      // Execute each action in client app state
      agentActions.forEach((act) => {
        onExecuteAction(act);
      });
    } catch (error: any) {
      console.error('Failed to communicate with AI Pizza Agent:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: `Mamma Mia! I had a quick hiccup with the connection, but Nonna is still right here! Try asking again or tap one of our quick order buttons below!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Feed 4 people under $40',
    'Add a Large Diablo Pepperoni with Hot Honey',
    'Add 6 Truffle Garlic Knots',
    'What vegan and gluten-free choices are there?',
    'Apply coupon PIZZA20',
    'Where is my pizza delivery?',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-6 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full sm:max-w-md h-[92vh] sm:h-[680px] bg-stone-900 border border-stone-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-stone-100">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/60 border-b border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <Flame className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-stone-900" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-white text-base">Nonna Gina AI</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Concierge
                </span>
              </div>
              <p className="text-stone-400 text-xs">Voice & Order Assistant · Ready</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSpeakingEnabled(!isSpeakingEnabled)}
              className={`p-2 rounded-xl transition-colors ${
                isSpeakingEnabled 
                  ? 'text-amber-400 hover:bg-stone-800' 
                  : 'text-stone-500 hover:bg-stone-800'
              }`}
              title={isSpeakingEnabled ? 'Voice output on' : 'Voice output muted'}
            >
              {isSpeakingEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm bg-stone-950/50">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-md ${
                    isUser
                      ? 'bg-amber-600 text-white rounded-br-xs'
                      : 'bg-stone-800/90 text-stone-200 border border-stone-700/60 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                  {/* Render Action Cards */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-stone-700/60 space-y-2">
                      {msg.actions.map((act, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-stone-900/80 border border-stone-700/70 text-xs text-stone-300"
                        >
                          <div className="flex items-center gap-2 truncate">
                            {act.type === 'ADD_TO_CART' && <ShoppingBag className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                            {act.type === 'APPLY_PROMO' && <Tag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                            {act.type === 'TRACK_ORDER' && <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                            {act.type === 'CUSTOMIZE_PIZZA' && <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />}
                            <span className="truncate">{act.displayText || act.type}</span>
                          </div>

                          {act.type === 'TRACK_ORDER' && (
                            <button
                              onClick={onOpenTracker}
                              className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-[11px] font-semibold transition-colors shrink-0"
                            >
                              View Tracker
                            </button>
                          )}
                          {act.type === 'OPEN_CHECKOUT' && (
                            <button
                              onClick={onOpenCheckout}
                              className="px-2 py-1 rounded bg-amber-500 text-stone-950 font-bold hover:bg-amber-400 text-[11px] transition-colors shrink-0"
                            >
                              Checkout Now
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-stone-500 mt-1 px-1">
                  {msg.timestamp}
                  {msg.isVoiceInput && ' · 🎙️ Voice'}
                </span>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-stone-800/80 border border-stone-700/50 text-stone-400 text-xs w-max animate-pulse">
              <Bot className="w-4 h-4 text-amber-400" />
              <span>Nonna is thinking & preparing your request...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Carousel */}
        <div className="px-3 py-2 bg-stone-900 border-t border-stone-800/80 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 shrink-0">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs px-3 py-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700/60 transition-all shrink-0 hover:border-amber-500/50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Voice Equalizer Indicator */}
        {isListening && (
          <div className="px-4 py-2 bg-red-950/60 border-t border-red-800 flex items-center justify-between text-xs text-red-200 shrink-0 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>Listening... Speak your order naturally!</span>
            </div>
            <button
              onClick={() => setIsListening(false)}
              className="text-[11px] underline text-red-400"
            >
              Stop
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-stone-900 border-t border-stone-800 flex items-center gap-2 shrink-0"
        >
          <button
            type="button"
            onClick={toggleVoiceRecognition}
            className={`p-2.5 rounded-xl transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
            }`}
            title="Speak your order"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell Nonna what you crave or want to order..."
            className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold transition-all disabled:cursor-not-allowed shadow-md shadow-amber-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
