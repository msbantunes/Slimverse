import React, { useState } from 'react';
import { DailyCheckinData } from '../types';

interface DailyCheckinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: DailyCheckinData) => void;
    isLoading: boolean;
}

export const DailyCheckinModal: React.FC<DailyCheckinModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
    const [feedback, setFeedback] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ feedback });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white text-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Check-in Diário</h2>
                <p className="text-gray-600 mb-6">Como está o processo de emagrecimento e o que tem percebido? Seu feedback nos ajuda a criar o plano perfeito para hoje.</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="feedback" className="block text-gray-700 text-sm font-bold mb-2">Seu feedback de hoje</label>
                        <textarea
                            id="feedback"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-[#FFCC33] h-36 resize-none"
                            placeholder="Ex: Hoje acordei com mais disposição! Gostaria de um treino focado em cardio e uma ideia de almoço rápido."
                            required
                        ></textarea>
                    </div>
                    <div className="flex items-center justify-end gap-4">
                        <button type="button" onClick={onClose} className="text-gray-600 hover:text-gray-900 transition" disabled={isLoading}>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-[#FFCC33] hover:bg-[#e6b82e] text-black font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                 </svg>
                                 Gerando...
                                </>
                            ) : 'Gerar Plano do Dia'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
