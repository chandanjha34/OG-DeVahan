import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

type Message = {
  id: number;
  text: string;
  isUser: boolean;
};  

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  console.log('fs');
  const faqMap: Record<string, string> = {};
  // Map FAQ questions to their keys for lookup
  for (let i = 1; i <= 20; i++) {
    const questionKey = `faq.q${i}`;
    const answerKey = `faq.a${i}`;
    faqMap[t(questionKey).toLowerCase()] = answerKey;
  }

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message when chat opens for the first time
      setMessages([{ id: 1, text: t('chatbot.welcome'), isUser: false }]);
    }
  }, [isOpen, messages.length, t]);

  useEffect(() => {
    // Scroll to bottom of messages
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Process user question and respond
    setTimeout(() => {
      const userQuestion = input.toLowerCase();
      let answerKey = '';
      
      // Attempt direct match
      if (faqMap[userQuestion]) {
        answerKey = faqMap[userQuestion];
      } else {
        // Check if question contains any of our FAQ keywords
        for (const [question, answer] of Object.entries(faqMap)) {
          const questionWords = question.split(' ');
          const matchCount = questionWords.filter(word => 
            word.length > 3 && userQuestion.includes(word)
          ).length;
          
          if (matchCount >= 2 || (questionWords.length <= 3 && matchCount >= 1)) {
            answerKey = answer;
            break;
          }
        }
      }

      const responseText = answerKey 
        ? t(answerKey)
        : t('chatbot.noMatch') || "I'm sorry, I don't have information on that topic yet. Please try asking about vehicle NFTs, transfers, or ownership.";
      
      const botMessage = { id: Date.now(), text: responseText, isUser: false };
      setMessages((prev) => [...prev, botMessage]);
    }, 600);
  };

  const suggestedQuestions = [1, 2, 3, 17, 19].map(num => t(`faq.q${num}`));

  return (
    <>
      {/* Chatbot toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-gold text-primary shadow-lg flex items-center justify-center transition-transform hover:scale-105 ${
          isOpen ? 'rotate-90' : ''
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chatbot window */}
      <div
        className={`fixed bottom-20 right-4 z-40 w-80 sm:w-96 bg-primary-light border border-metallic/20 rounded-lg shadow-lg transition-all duration-300 transform ${
          isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'
        }`}
      >
        {/* Chatbot header */}
        <div className="bg-gradient-to-r from-neon-blue to-neon-green text-primary p-3 rounded-t-lg">
          <h3 className="font-bold">{t('chatbot.title')}</h3>
        </div>

        {/* Messages area */}
        <div className="h-80 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${
                message.isUser
                  ? 'bg-neon-blue/10 ml-auto'
                  : 'bg-primary border border-metallic/20'
              } p-3 rounded-lg max-w-[85%]`}
            >
              {message.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <p className="text-sm text-metallic mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(question);
                    // Immediately submit after selecting a question
                    setMessages((prev) => [...prev, { id: Date.now(), text: question, isUser: true }]);
                    setTimeout(() => {
                      const answerKey = `faq.a${index + 1}`;
                      setMessages((prev) => [
                        ...prev,
                        { id: Date.now(), text: t(answerKey), isUser: false }
                      ]);
                    }, 600);
                  }}
                  className="text-xs bg-primary px-2 py-1 rounded-full text-metallic hover:text-white hover:bg-primary-light transition-colors"
                >
                  {question.length > 25 ? question.substring(0, 25) + '...' : question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-metallic/20 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chatbot.placeholder')}
            className="flex-1 bg-primary border border-metallic/20 rounded-lg px-3 py-2 focus:outline-none focus:border-gold text-white"
          />
          <button
            type="submit"
            className="bg-gold text-primary p-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </>
  );
};

export default Chatbot;