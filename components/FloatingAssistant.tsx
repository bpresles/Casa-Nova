import { Bot, MessageCircle, Send, X } from "lucide-react";
import React, { useState } from "react";
import { askAssistant } from "../services/geminiService";

interface FloatingAssistantProps {
  destinationContext: string;
}

const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ destinationContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: `Bonjour ! Je suis votre assistant personnel. Posez-moi vos questions sur l'expatriation ou ${destinationContext || "votre future destination"}.` },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setIsTyping(true);

    const aiResponse = await askAssistant(userMsg, `L'utilisateur s'intéresse à ${destinationContext || "une destination non spécifiée"}.`);

    setIsTyping(false);
    setChatMessages((prev) => [...prev, { sender: "ai", text: aiResponse }]);
  };

  return (
    <div className='fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none'>
      {/* Chat Window */}
      <div
        className={`bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-slate-200 mb-4 overflow-hidden transition-all duration-300 origin-bottom-right pointer-events-auto flex flex-col ${
          isOpen ? "opacity-100 scale-100 translate-y-0 h-[500px]" : "opacity-0 scale-95 translate-y-10 h-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className='bg-green-600 p-4 flex justify-between items-center text-white'>
          <div className='flex items-center gap-2'>
            <div className='bg-white/20 p-1.5 rounded-full'>
              <Bot className='h-5 w-5' />
            </div>
            <div>
              <h3 className='font-bold text-sm'>Assistant Casa Nova</h3>
              <p className='text-xs text-green-200'>Toujours là pour vous aider</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className='text-green-200 hover:text-white'>
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Messages */}
        <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50'>
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm shadow-sm ${
                  msg.sender === "user" ? "bg-green-600 text-white rounded-br-none" : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className='flex justify-start'>
              <div className='bg-white border border-slate-200 px-3 py-2 rounded-2xl rounded-bl-none shadow-sm flex gap-1'>
                <div className='w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce' style={{ animationDelay: "0ms" }} />
                <div className='w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce' style={{ animationDelay: "150ms" }} />
                <div className='w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce' style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className='p-3 bg-white border-t border-slate-100'>
          <div className='flex gap-2'>
            <input
              type='text'
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder='Posez votre question...'
              className='flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm'
            />
            <button onClick={handleSendMessage} disabled={!chatInput.trim() || isTyping} className='bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50'>
              <Send className='h-4 w-4' />
            </button>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 pointer-events-auto ${
          isOpen ? "bg-slate-700 rotate-90" : "bg-green-600 hover:bg-green-700 hover:scale-110"
        }`}
      >
        {isOpen ? <X className='h-6 w-6 text-white' /> : <MessageCircle className='h-6 w-6 text-white' />}
      </button>
    </div>
  );
};

export default FloatingAssistant;
