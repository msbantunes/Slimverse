import React, { useState, useEffect, useMemo } from 'react';
import { User, Gender } from '../types';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSave: (data: { name: string; dob: string; gender: Gender; height: number; weightGoal: number; initialWeight: number; }) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [name, setName] = useState(user.name);
    const [dob, setDob] = useState(user.dob);
    const [gender, setGender] = useState(user.gender);
    const [height, setHeight] = useState(user.height.toString());
    const [initialWeight, setInitialWeight] = useState(user.initialWeight.toString());
    const [weightGoal, setWeightGoal] = useState(user.weightGoal.toString());

    useEffect(() => {
        if (isOpen) {
            setName(user.name);
            setDob(user.dob);
            setGender(user.gender);
            setHeight(user.height.toString());
            setInitialWeight(user.initialWeight.toString());
            setWeightGoal(user.weightGoal.toString());
        }
    }, [isOpen, user]);

    const bmi = useMemo(() => {
        const h = parseInt(height, 10);
        const w = parseFloat(initialWeight);
        if (h > 0 && w > 0) {
            const heightInMeters = h / 100;
            const calculatedBmi = w / (heightInMeters * heightInMeters);
            return calculatedBmi.toFixed(1);
        }
        return '---';
    }, [height, initialWeight]);

    const weightGoalWarning = useMemo(() => {
        const h = parseInt(height, 10);
        const goal = parseFloat(weightGoal);

        if (h > 0 && goal > 0) {
            const heightInMeters = h / 100;
            const goalBmi = goal / (heightInMeters * heightInMeters);

            if (goalBmi < 18.5 || goalBmi > 24.9) {
                return `Atenção: Esta meta resulta em um IMC de ${goalBmi.toFixed(1)}, que está fora da faixa saudável (18.5 - 24.9). Converse com um profissional de saúde.`;
            }
        }
        return null;
    }, [height, weightGoal]);


    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Add explicit check to prevent saving if profile is already locked.
        if (user.isProfileLocked) {
            return;
        }
        const goal = parseFloat(weightGoal);
        const h = parseInt(height, 10);
        const iWeight = parseFloat(initialWeight);
        if (!isNaN(goal) && !isNaN(h) && !isNaN(iWeight)) {
            onSave({
                name,
                dob,
                gender,
                height: h,
                initialWeight: iWeight,
                weightGoal: goal,
                isProfileLocked: true //  adiciona o bloqueio aqui
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white text-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">{user.isProfileLocked ? 'Seu Perfil' : 'Editar Perfil'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Nome</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-[#FFCC33] disabled:bg-gray-200 disabled:cursor-not-allowed"
                            required
                            disabled={user.isProfileLocked}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="dob" className="block text-gray-700 text-sm font-bold mb-2">Data de Nascimento</label>
                        <input
                            type="date"
                            id="dob"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-[#FFCC33] disabled:bg-gray-200 disabled:cursor-not-allowed"
                            required
                            disabled={user.isProfileLocked}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="gender" className="block text-gray-700 text-sm font-bold mb-2">Gênero</label>
                        <select
                            id="gender"
                            value={gender}
                            onChange={(e) => setGender(e.target.value as Gender)}
                            className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-[#FFCC33] disabled:bg-gray-200 disabled:cursor-not-allowed"
                            required
                            disabled={user.isProfileLocked}
                        >
                            <option value={Gender.Male}>Masculino</option>
                            <option value={Gender.Female}>Feminino</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="height" className="block text-gray-700 text-sm font-bold mb-2">Altura (cm)</label>
                        <input
                            type="number"
                            id="height"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-[#FFCC33] disabled:bg-gray-200 disabled:cursor-not-allowed"
                            placeholder="Ex: 180"
                            required
                            disabled={user.isProfileLocked}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="initialWeight" className="block text-gray-700 text-sm font-bold mb-2">Peso Inicial (kg)</label>
                        <input
                            type="number"
                            id="initialWeight"
                            value={initialWeight}
                            onChange={(e) => setInitialWeight(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-[#FFCC33] disabled:bg-gray-200 disabled:cursor-not-allowed"
                            placeholder="Ex: 95"
                            required
                            step="0.1"
                            disabled={user.isProfileLocked}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="bmi" className="block text-gray-700 text-sm font-bold mb-2">IMC (Índice de Massa Corporal)</label>
                        <input
                            type="text"
                            id="bmi"
                            value={bmi}
                            className="w-full bg-gray-200 border border-gray-300 rounded-md py-2 px-3 text-gray-700 leading-tight focus:outline-none cursor-not-allowed"
                            disabled
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="weightGoal" className="block text-gray-700 text-sm font-bold mb-2">Meta de Peso (kg)</label>
                        <input
                            type="number"
                            id="weightGoal"
                            value={weightGoal}
                            onChange={(e) => setWeightGoal(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-[#FFCC33] disabled:bg-gray-200 disabled:cursor-not-allowed"
                            placeholder="Ex: 80"
                            required
                            step="0.1"
                            disabled={user.isProfileLocked}
                        />
                        {weightGoalWarning && (
                            <p className="text-xs text-yellow-700 mt-2">{weightGoalWarning}</p>
                        )}
                    </div>

                    {user.isProfileLocked && (
                        <div className="mb-6 mt-6 pt-4 border-t border-gray-200">
                            <label htmlFor="profileLocked" className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="profileLocked"
                                    checked={true}
                                    disabled
                                    className="h-5 w-5 rounded bg-gray-100 border-gray-300 text-[#FFCC33] focus:ring-[#FFCC33] cursor-not-allowed"
                                />
                                <span className="ml-3 text-gray-700 font-semibold">Perfil salvo e bloqueado para edições.</span>
                            </label>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-4">
                        <button type="button" onClick={onClose} className="text-gray-600 hover:text-gray-900 transition">
                            {user.isProfileLocked ? 'Fechar' : 'Cancelar'}
                        </button>
                        {!user.isProfileLocked && (
                            <button
                                type="submit"
                                className="bg-[#FFCC33] hover:bg-[#e6b82e] text-black font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out"
                            >
                                Salvar
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};