import React from 'react';

interface PlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    name: string;
    plan: string | null;
    color: string;
    checkedItems: Set<number>;
    onCheckItem: (index: number) => void;
}

export const PlanModal: React.FC<PlanModalProps> = ({ 
    isOpen, 
    onClose, 
    icon: Icon, 
    name, 
    plan, 
    color, 
    checkedItems, 
    onCheckItem 
}) => {
    if (!isOpen) return null;

    const handleCheck = (index: number) => {
        onCheckItem(index);
    };

    const renderPlanContent = () => {
        if (!plan) {
            return <p className="text-gray-500 italic mt-4">Nenhum plano disponível.</p>;
        }
        const planLines = plan.split('\n').filter(line => line.trim() !== '');
        
        return planLines.map((line, index) => {
            const match = line.match(/^\s*[-*]\s*(.*)/) || line.match(/^\s*\d+\.\s*(.*)/);
            if (match) {
                const taskText = match[1];
                const isChecked = checkedItems.has(index);
                return (
                    <div key={index} className="flex items-start my-3">
                        <input
                            id={`modal-task-${name}-${index}`}
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCheck(index)}
                            className="mt-1 h-5 w-5 flex-shrink-0 rounded bg-gray-100 border-gray-300 text-[#FFCC33] focus:ring-[#FFCC33] cursor-pointer"
                        />
                        <label
                            htmlFor={`modal-task-${name}-${index}`}
                            className={`ml-3 text-gray-700 cursor-pointer transition-colors ${isChecked ? 'line-through text-gray-500' : ''}`}
                        >
                            {taskText}
                        </label>
                    </div>
                );
            }
            if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                return <h4 key={index} className="font-bold text-gray-900 mt-4 mb-2">{line.trim().replace(/\*\*/g, '')}</h4>
            }
            return <p key={index} className="my-2">{line}</p>;
        });
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`modal-title-${name}`}
        >
            <div 
                className="bg-white text-gray-900 rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <header className="flex items-center p-6 border-b border-gray-200">
                    <div className={`p-3 rounded-full mr-4 ${color}`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 id={`modal-title-${name}`} className="text-2xl font-bold text-gray-900 flex-grow">{name} - Plano Completo</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Fechar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </header>
                <div className="p-6 overflow-y-auto text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                    {renderPlanContent()}
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