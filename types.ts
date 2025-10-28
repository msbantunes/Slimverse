export enum Gender {
  Male = 'male',
  Female = 'female',
}

export enum SpecialistType {
  PhysicalEducator = 'physical_educator',
  Nutritionist = 'nutritionist',
  Psychologist = 'psychologist',
}

export interface User {
  name: string;
  dob: string; // Date of Birth
  gender: Gender;
  level: number;
  xp: number;
  initialWeight: number; // in kg
  weight: number; // in kg
  height: number; // in cm
  weightGoal: number; // in kg
  waist: number; // in cm
  history: {
    date: string;
    weight: number;
    waist: number;
  }[];
  isProfileLocked: boolean;
}

export interface Plan {
  title: string;
  content: string;
}

export interface Message {
  sender: 'user' | 'bot';
  specialist?: SpecialistType;
  text: string;
}

export interface WeeklyCheckinData {
  weight: string;
  waist: string;
  feedback: string;
}

export interface DailyCheckinData {
  feedback: string;
}