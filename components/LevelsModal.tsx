import React from 'react';
import { User } from '../types';
import { LEVELS, LEVEL_XP_THRESHOLDS, getLevelName } from '../constants';

interface LevelsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
}

const CrownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
);


export const LevelsModal: React.FC<LevelsModalProps> = ({ isOpen, onClose, user }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="levels-modal-title"
        >
            <div 
                className="bg-white text-gray-900 rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center p-6 border-b border-gray-200">
                    <div className="p-3 rounded-full mr-4 bg-[#FFCC33]">
                        <CrownIcon className="w-6 h-6 text-black" />
                    </div>
                    <h2 id="levels-modal-title" className="text-2xl font-bold text-gray-900 flex-grow">Sua Jornada de Níveis</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Fechar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </header>
                <div className="p-6 overflow-y-auto">
                    <div className="space-y-4">
                        {Object.entries(LEVELS).map(([levelStr]) => {
                            const level = parseInt(levelStr);
                            const levelName = getLevelName(level, user.gender);
                            const xpRequired = LEVEL_XP_THRESHOLDS[level - 1];
                            const isCurrentLevel = level === user.level;
                            const isUnlocked = level <= user.level;

                            const prevLevelXP = LEVEL_XP_THRESHOLDS[level - 2] || 0;
                            const xpForThisRank = xpRequired - prevLevelXP;
                            const userProgressInThisRank = user.xp - prevLevelXP;
                            const progressPercentage = xpForThisRank > 0 
                                ? Math.min(100, Math.max(0, Math.round((userProgressInThisRank / xpForThisRank) * 100))) 
                                : (isUnlocked ? 100 : 0);
                            
                            return (
                                <div key={level} className={`p-4 rounded-lg transition-all ${isCurrentLevel ? 'border-2 border-[#FFCC33] bg-yellow-50' : 'border border-gray-200'} ${!isUnlocked ? 'opacity-60' : ''}`}>
                                    <div className="flex justify-between items-center">
                                        <h3 className={`font-bold ${isCurrentLevel ? 'text-yellow-900' : 'text-gray-800'}`}>Nível {level}: {levelName}</h3>
                                        <span className={`text-sm font-semibold ${isCurrentLevel ? 'text-yellow-800' : 'text-gray-500'}`}>
                                            {xpRequired} XP
                                        </span>
                                    </div>
                                    {isCurrentLevel && (
                                        <div className="mt-3">
                                            <div className="flex justify-between text-sm text-yellow-800 mb-1">
                                                <span>Progresso</span>
                                                <span>{user.xp} / {LEVEL_XP_THRESHOLDS[level] || xpRequired + 5} XP</span>
                                            </div>
                                            <div className="w-full bg-yellow-200 rounded-full h-2.5">
                                                <div className="bg-[#FFCC33] h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <footer className="p-4 border-t border-gray-200 text-right">
                    <button 
                        onClick={onClose} 
                        className="bg-[#FFCC33] hover:bg-[#e6b82e] text-black font-bold py-2 px-6 rounded-lg transition"
                    >
                        Fechar
                    </button>
                </footer>
            </div>
        </div>
    );
};
