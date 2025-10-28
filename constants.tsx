import React from 'react';
import { SpecialistType, Gender } from './types';

export const DumbbellIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m6.5 6.5 11 11" />
        <path d="m21 21-1-1" />
        <path d="m3 3 1 1" />
        <path d="m18 22 4-4" />
        <path d="m6 2 4 4" />
        <path d="m3 10 7-7" />
        <path d="m14 21 7-7" />
    </svg>
);

export const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    // FIX: Corrected malformed viewBox attribute from '0 0 24" 24"' to '0 0 24 24'. This was causing numerous parsing errors.
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
        <path d="M10 2c1 .5 2 2 2 5" />
    </svg>
);

export const BrainIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 9.5 7" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v0A2.5 2.5 0 0 0 14.5 7" /><path d="M12 18a2.5 2.5 0 0 0 2.5-2.5v0A2.5 2.5 0 0 0 12 13" /><path d="M12 18a2.5 2.5 0 0 1-2.5-2.5v0A2.5 2.5 0 0 1 12 13" /><path d="M18 12a2.5 2.5 0 0 0-2.5-2.5v0A2.5 2.5 0 0 0 13 12" /><path d="M6 12a2.5 2.5 0 0 1 2.5-2.5v0A2.5 2.5 0 0 1 11 12" /><path d="M21.5 12a2.5 2.5 0 0 1-2.5 2.5v0a2.5 2.5 0 0 1-2.5-2.5" /><path d="M2.5 12a2.5 2.5 0 0 0 2.5 2.5v0a2.5 2.5 0 0 0 2.5-2.5" /><path d="M12 13a6 6 0 0 0-6-6" /><path d="M12 13a6 6 0 0 1 6-6" /><path d="M12 4.5a6 6 0 0 0 6 6" /><path d="M12 4.5a6 6 0 0 1-6 6" /><path d="M12 13a6 6 0 0 0-6 6" /><path d="M12 13a6 6 0 0 1 6 6" /><path d="M12 21.5a6 6 0 0 0 6-6" /><path d="M12 21.5a6 6 0 0 1-6-6" />
    </svg>
);

export const LEVELS: { [key: number]: { male: string; female: string } } = {
    1: { male: 'Escudeiro III', female: 'Escudeira III' }, 2: { male: 'Escudeiro II', female: 'Escudeira II' }, 3: { male: 'Escudeiro I', female: 'Escudeira I' },
    4: { male: 'Cavaleiro III', female: 'Cavaleira III' }, 5: { male: 'Cavaleiro II', female: 'Cavaleira II' }, 6: { male: 'Cavaleiro I', female: 'Cavaleira I' },
    7: { male: 'Paladino III', female: 'Paladina III' }, 8: { male: 'Paladino II', female: 'Paladina II' }, 9: { male: 'Paladino I', female: 'Paladina I' },
    10: { male: 'Lorde III', female: 'Lady III' }, 11: { male: 'Lorde II', female: 'Lady II' }, 12: { male: 'Lorde I', female: 'Lady I' },
    13: { male: 'Barão III', female: 'Baronesa III' }, 14: { male: 'Barão II', female: 'Baronesa II' }, 15: { male: 'Barão I', female: 'Baronesa I' },
    16: { male: 'Conde III', female: 'Condessa III' }, 17: { male: 'Conde II', female: 'Condessa II' }, 18: { male: 'Conde I', female: 'Condessa I' },
    19: { male: 'Duque III', female: 'Duquesa III' }, 20: { male: 'Duque II', female: 'Duquesa II' }, 21: { male: 'Duque I', female: 'Duquesa I' },
    22: { male: 'Príncipe III', female: 'Princesa III' }, 23: { male: 'Príncipe II', female: 'Princesa II' }, 24: { male: 'Príncipe I', female: 'Princesa I' },
    25: { male: 'Rei III', female: 'Rainha III' }, 26: { male: 'Rei II', female: 'Rainha II' }, 27: { male: 'Rei I', female: 'Rainha I' }
};

export const LEVEL_XP_THRESHOLDS: number[] = Array.from({ length: 27 }, (_, i) => i * 5);


export const getLevelName = (level: number, gender: Gender): string => {
    const levelInfo = LEVELS[level];
    if (!levelInfo) return 'Iniciante';
    return gender === Gender.Male ? levelInfo.male : levelInfo.female;
};

const GENERAL_RULES = `
Tom: motivador, humano, positivo e seguro.
Fale em: Português do Brasil.
Evite: diagnósticos médicos, dietas extremas, medicamentos ou terapias clínicas.
Aja sempre com empatia: oriente a buscar ajuda profissional se houver dor intensa, sofrimento emocional ou sintomas preocupantes.
Meta principal: ajudar o usuário a manter constância e prazer no processo.
Use markdown para formatar a resposta com titulos, listas e negrito.
`;

export const SPECIALIST_PROMPTS: { [key in SpecialistType]: { systemInstruction: string; name: string, description: string, icon: React.FC<React.SVGProps<SVGSVGElement>> } } = {
    [SpecialistType.PhysicalEducator]: {
        name: 'Educador Físico',
        description: 'Planos de treino para sua evolução física.',
        icon: DumbbellIcon,
        systemInstruction: `
Você é um Educador Físico virtual do app Slimverse.
${GENERAL_RULES}
Sua função: criar e ajustar um plano de treino para o dia, conforme o tempo, local e limitações do usuário.
Inclua aquecimento, alongamento, segurança e substituições.
Foco em evolução gradual e consistência.
Evite sobrecarga e incentive pausas quando houver desconforto.
Seu estilo é técnico, direto e motivador. Use frases como “Constância vence intensidade.”
**Importante: O plano deve ser para um único dia. Formate-o como uma lista de tarefas claras e acionáveis usando marcadores ('-').** Cada item da lista deve ser uma atividade que o usuário pode marcar como concluída.
Finalize com um reforço positivo.
`
    },
    [SpecialistType.Nutritionist]: {
        name: 'Nutricionista',
        description: 'Orientações para uma alimentação equilibrada.',
        icon: AppleIcon,
        systemInstruction: `
Você é uma Nutricionista virtual do app Slimverse.
${GENERAL_RULES}
Sua função: montar um cardápio diário simples, equilibrado e personalizado conforme preferências, alergias e rotina do usuário.
Priorize proteína adequada, fibras, água e prazer ao comer.
Ofereça substituições e dicas práticas (“lanche rápido saudável”, “opção fora de casa”).
Evite dietas restritivas e tom clínico.
Seu estilo é educativo e gentil. Use frases como “Comer bem é cuidar do corpo com amor e consciência.”
**Importante: O plano alimentar deve ser para um único dia. Formate-o como uma lista de itens acionáveis usando marcadores ('-').** Cada item da lista deve ser uma tarefa que o usuário possa marcar como concluída.
Finalize com um reforço positivo.
`
    },
    [SpecialistType.Psychologist]: {
        name: 'Psicólogo',
        description: 'Estratégias para fortalecer sua mente e hábitos.',
        icon: BrainIcon,
        systemInstruction: `
Você é um(a) Psicólogo(a) virtual do app Slimverse.
${GENERAL_RULES}
Sua função: ajudar o usuário a manter hábitos, rotina e equilíbrio emocional.
Crie um plano de bem-estar mental para o dia (sono, foco, respiração, autocuidado).
Ajude a lidar com ansiedade, gatilhos e recaídas.
Se detectar sofrimento grave, oriente ajuda profissional imediata.
Seu estilo é acolhedor, reflexivo e inspirador. Use frases como “Cada pequeno hábito é um degrau na sua evolução.”
**Importante: Crie um plano de bem-estar mental para o dia. Formate as tarefas como uma lista de hábitos diários usando marcadores ('-').** Cada item da lista deve ser uma ação que o usuário pode marcar como concluída.
Finalize com um reforço positivo.
`
    }
};

export const INITIAL_USER: import('./types').User = {
  name: 'Alex',
  dob: '1990-01-01',
  gender: Gender.Male,
  level: 1,
  xp: 0,
  initialWeight: 90,
  weight: 90,
  height: 180,
  weightGoal: 80,
  waist: 100,
  history: [{ date: new Date().toISOString().split('T')[0], weight: 90, waist: 100 }],
  isProfileLocked: false,
};