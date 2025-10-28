import React, { useState } from 'react';
import { User, SpecialistType, WeeklyCheckinData, DailyCheckinData, Gender } from './types';
import { INITIAL_USER, SPECIALIST_PROMPTS, getLevelName, LEVEL_XP_THRESHOLDS } from './constants';
import { SpecialistCard } from './components/SpecialistCard';
import { CheckinModal } from './components/CheckinModal';
import { DailyCheckinModal } from './components/DailyCheckinModal';
import { LevelsModal } from './components/LevelsModal';
import { ProfileModal } from './components/ProfileModal';
import { ChatInterface } from './components/ChatInterface';
import { generateAllDailyPlans } from './services/geminiService';

const App: React.FC = () => {
    const [user, setUser] = useState<User>(INITIAL_USER);
    const [workoutPlan, setWorkoutPlan] = useState<string | null>(null);
    const [nutritionPlan, setNutritionPlan] = useState<string | null>(null);
    const [mentalPlan, setMentalPlan] = useState<string | null>(null);
    
    const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
    const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
    const [isLevelsModalOpen, setIsLevelsModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isGeneratingPlans, setIsGeneratingPlans] = useState(false);
    const [isUpdatingStats, setIsUpdatingStats] = useState(false);

    const handleDailyCheckinSubmit = async (data: DailyCheckinData) => {
        setIsGeneratingPlans(true);
        try {
            const plans = await generateAllDailyPlans(user, data.feedback);
            setWorkoutPlan(plans.workoutPlan);
            setNutritionPlan(plans.nutritionPlan);
            setMentalPlan(plans.mentalPlan);
            setIsDailyModalOpen(false);
        } catch (error) {
            console.error("Failed to process daily check-in:", error);
        } finally {
            setIsGeneratingPlans(false);
        }
    };
    
    const handleWeeklyCheckinSubmit = async (data: WeeklyCheckinData) => {
        setIsUpdatingStats(true);
        try {
            const newWeight = parseFloat(data.weight);
            const newWaist = parseFloat(data.waist);
            
            setUser(prevUser => {
                const updatedHistory = [
                    { date: new Date().toISOString().split('T')[0], weight: newWeight, waist: newWaist },
                    ...prevUser.history,
                ].slice(0, 10);

                const totalWeightLoss = prevUser.initialWeight - newWeight;

                const initialRecord = updatedHistory[updatedHistory.length - 1];
                const totalWaistLoss = initialRecord.waist - newWaist;

                const newXP = Math.max(0, Math.floor(totalWeightLoss) + Math.floor(totalWaistLoss / 2));
                
                const newLevelValue = LEVEL_XP_THRESHOLDS.filter(xp => newXP >= xp).length;
                const newLevel = Math.max(1, Math.min(newLevelValue, 27));

                return {
                    ...prevUser,
                    weight: newWeight,
                    waist: newWaist,
                    level: newLevel,
                    xp: newXP,
                    history: updatedHistory,
                };
            });
            
            setIsWeeklyModalOpen(false);
        } catch (error) {
            console.error("Failed to process weekly check-in:", error);
        } finally {
            setIsUpdatingStats(false);
        }
    };

    const handleProfileSave = (updatedData: { name: string; dob: string; gender: Gender; height: number; weightGoal: number; initialWeight: number; }) => {
        if (user.isProfileLocked) {
            setIsProfileModalOpen(false);
            return;
        }

        const confirmation = window.confirm(
            "Você tem certeza que deseja salvar estas informações? Após salvar pela primeira vez, seu perfil será bloqueado para edições futuras para garantir a consistência da sua jornada."
        );

        if (confirmation) {
            setUser(prevUser => {
                const totalWeightLoss = updatedData.initialWeight - prevUser.weight;
                
                const initialRecord = prevUser.history.length > 0 ? prevUser.history[prevUser.history.length - 1] : { waist: prevUser.waist };
                const totalWaistLoss = initialRecord.waist - prevUser.waist;

                const newXP = Math.max(0, Math.floor(totalWeightLoss) + Math.floor(totalWaistLoss / 2));
                const newLevelValue = LEVEL_XP_THRESHOLDS.filter(xp => newXP >= xp).length;
                const newLevel = Math.max(1, Math.min(newLevelValue, 27));

                return {
                    ...prevUser,
                    ...updatedData,
                    xp: newXP,
                    level: newLevel,
                    isProfileLocked: true, // Lock the profile
                };
            });
            setIsProfileModalOpen(false);
        }
    };

    const levelName = getLevelName(user.level, user.gender);
    const canViewLevels = user.history.length > 0;

    return (
        <div className="min-h-screen bg-[#f5e967] text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-black">Slimverse</h1>
                        <p className="text-gray-600 mt-1">Sua jornada de evolução pessoal gamificada.</p>
                    </div>
                    <div className="text-left sm:text-right mt-4 sm:mt-0">
                         <button
                            onClick={() => setIsProfileModalOpen(true)}
                            className={`text-lg font-semibold transition-colors ${user.isProfileLocked ? 'text-gray-500 cursor-not-allowed' : 'hover:text-yellow-700'}`}
                            title={user.isProfileLocked ? "Seu perfil foi bloqueado após a primeira edição." : "Editar seu perfil"}
                        >
                            {user.name}
                        </button>
                        <div>
                            <button
                                onClick={() => canViewLevels && setIsLevelsModalOpen(true)}
                                disabled={!canViewLevels}
                                className={`inline-block bg-[#FFCC33] text-black font-bold text-sm px-4 py-1 rounded-full shadow-md mt-1 transition-transform duration-200 ${canViewLevels ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}`}
                                title={canViewLevels ? "Ver sua jornada de níveis" : "Faça seu primeiro check-in semanal para ver os níveis"}
                            >
                                {levelName}
                            </button>
                        </div>
                    </div>
                </header>

                <main>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                         <h2 className="text-2xl font-semibold">Seu Painel Diário</h2>
                         <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                             <button
                                onClick={() => setIsDailyModalOpen(true)}
                                className="bg-white hover:bg-gray-100 text-black font-bold py-2 px-5 rounded-lg transition duration-300 ease-in-out shadow-lg w-full sm:w-auto border border-gray-300"
                             >
                                Fazer Check-in Diário
                             </button>
                             <button
                                onClick={() => setIsWeeklyModalOpen(true)}
                                className="bg-[#FFCC33] hover:bg-[#e6b82e] text-black font-bold py-2 px-5 rounded-lg transition duration-300 ease-in-out shadow-lg w-full sm:w-auto"
                             >
                                Check-in Semanal
                             </button>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <SpecialistCard
                            icon={SPECIALIST_PROMPTS[SpecialistType.PhysicalEducator].icon}
                            name={SPECIALIST_PROMPTS[SpecialistType.PhysicalEducator].name}
                            description={SPECIALIST_PROMPTS[SpecialistType.PhysicalEducator].description}
                            plan={workoutPlan}
                            color="bg-red-600"
                        />
                        <SpecialistCard
                            icon={SPECIALIST_PROMPTS[SpecialistType.Nutritionist].icon}
                            name={SPECIALIST_PROMPTS[SpecialistType.Nutritionist].name}
                            description={SPECIALIST_PROMPTS[SpecialistType.Nutritionist].description}
                            plan={nutritionPlan}
                            color="bg-green-600"
                        />
                        <SpecialistCard
                            icon={SPECIALIST_PROMPTS[SpecialistType.Psychologist].icon}
                            name={SPECIALIST_PROMPTS[SpecialistType.Psychologist].name}
                            description={SPECIALIST_PROMPTS[SpecialistType.Psychologist].description}
                            plan={mentalPlan}
                            color="bg-blue-600"
                        />
                    </div>
                    
                    <ChatInterface user={user} />
                </main>

                <footer className="text-center text-gray-500 mt-12 text-sm">
                    <p>&copy; {new Date().getFullYear()} Slimverse. Evolua um nível de cada vez.</p>
                </footer>
            </div>
            
            <DailyCheckinModal
                isOpen={isDailyModalOpen}
                onClose={() => setIsDailyModalOpen(false)}
                onSubmit={handleDailyCheckinSubmit}
                isLoading={isGeneratingPlans}
            />

            <CheckinModal
                isOpen={isWeeklyModalOpen}
                onClose={() => setIsWeeklyModalOpen(false)}
                onSubmit={handleWeeklyCheckinSubmit}
                isLoading={isUpdatingStats}
            />

            <LevelsModal
                isOpen={isLevelsModalOpen}
                onClose={() => setIsLevelsModalOpen(false)}
                user={user}
            />

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={user}
                onSave={handleProfileSave}
            />
        </div>
    );
};

export default App;