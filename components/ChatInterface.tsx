import React, { useState, useRef, useEffect } from 'react';
import { User, Message, SpecialistType } from '../types';
import { getSpecialistChatResponse } from '../services/geminiService';
import { SPECIALIST_PROMPTS } from '../constants';

interface ChatInterfaceProps {
    user: User;
}

const SpecialistAvatar: React.FC<{ specialist: SpecialistType }> = ({ specialist }) => {
    const info = SPECIALIST_PROMPTS[specialist];
    const colorMap = {
        [SpecialistType.PhysicalEducator]: 'bg-red-600',
        [SpecialistType.Nutritionist]: 'bg-green-600',
        [SpecialistType.Psychologist]: 'bg-blue-600',
    };
    return (
        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${colorMap[specialist]}`}>
            <info.icon className="w-5 h-5 text-white" />
        </div>
    );
};

type ChatTarget = SpecialistType | 'all';

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user }) => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', specialist: SpecialistType.Psychologist, text: `Olá, ${user.name}! Sou sua equipe de especialistas. Como posso te ajudar hoje?` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentTarget, setCurrentTarget] = useState<ChatTarget>('all');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const { response, specialist } = await getSpecialistChatResponse(user, messages, input, currentTarget);
            const botMessage: Message = { sender: 'bot', text: response, specialist };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: Message = { sender: 'bot', specialist: SpecialistType.Psychologist, text: 'Desculpe, ocorreu um erro. Tente novamente.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const TABS: { id: ChatTarget, name: string }[] = [
        { id: 'all', name: 'Todos' },
        { id: SpecialistType.PhysicalEducator, name: SPECIALIST_PROMPTS[SpecialistType.PhysicalEducator].name },
        { id: SpecialistType.Nutritionist, name: SPECIALIST_PROMPTS[SpecialistType.Nutritionist].name },
        { id: SpecialistType.Psychologist, name: SPECIALIST_PROMPTS[SpecialistType.Psychologist].name },
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg flex flex-col h-[calc(100vh-24rem)] max-h-[500px]">
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Converse com seus Especialistas</h3>
            </div>
            <div className="flex border-b border-gray-200 px-1 sm:px-2 flex-wrap">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setCurrentTarget(tab.id)}
                        className={`py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium transition-colors duration-200 focus:outline-none whitespace-nowrap ${
                            currentTarget === tab.id
                                ? 'border-b-2 border-[#FFCC33] text-[#FFCC33]'
                                : 'text-gray-500 hover:text-gray-900 border-b-2 border-transparent'
                        }`}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 mb-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'bot' && msg.specialist && <SpecialistAvatar specialist={msg.specialist} />}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-[#FFCC33] text-black' : 'bg-gray-200 text-gray-800'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-300 animate-pulse"></div>
                        <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-gray-200">
                           <div className="h-2.5 bg-gray-400 rounded-full w-24 animate-pulse"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={currentTarget === 'all' ? 'Pergunte para a equipe...' : `Pergunte para ${TABS.find(t => t.id === currentTarget)?.name}...`}
                        className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FFCC33]"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading} className="bg-[#FFCC33] hover:bg-[#e6b82e] text-black p-2 rounded-lg disabled:bg-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};