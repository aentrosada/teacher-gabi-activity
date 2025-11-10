import React from 'react';
import { UserInputs, ActivityType } from '../types';
import { LANGUAGES, AGE_RANGES, ACTIVITY_TYPES } from '../constants';

interface UserInputFormProps {
  userInputs: UserInputs;
  setUserInputs: React.Dispatch<React.SetStateAction<UserInputs>>;
  onSubmit: () => void;
  isLoading: boolean;
}

const UserInputForm: React.FC<UserInputFormProps> = ({ userInputs, setUserInputs, onSubmit, isLoading }) => {
  const handleInputChange = <K extends keyof UserInputs,>(
    field: K,
    value: UserInputs[K]
  ) => {
    setUserInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Gerador de Atividades</h2>
      <p className="text-center text-gray-500 mb-8">Crie atividades divertidas para seus pequenos!</p>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
        <div>
          <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">Nome da Criança/Turma</label>
          <input
            type="text"
            id="className"
            value={userInputs.className}
            onChange={(e) => handleInputChange('className', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
            placeholder="Ex: Turma da Professora Ana"
            required
          />
        </div>
        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
          <input
            type="text"
            id="theme"
            value={userInputs.theme}
            onChange={(e) => handleInputChange('theme', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
            placeholder="Ex: Animais da Fazenda, Exploração Espacial"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
            <select
              id="language"
              value={userInputs.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition bg-white"
            >
              {LANGUAGES.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Faixa Etária</label>
            <select
              id="age"
              value={userInputs.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition bg-white"
            >
              {AGE_RANGES.map((age) => <option key={age} value={age}>{age}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Atividade</label>
          <div className="grid grid-cols-2 gap-3">
            {ACTIVITY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleInputChange('activityType', type)}
                className={`text-center py-3 px-2 rounded-lg border-2 transition-transform duration-150 transform hover:scale-105 ${
                  userInputs.activityType === type
                    ? 'bg-yellow-500 text-white border-yellow-500 font-semibold shadow-md scale-105'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-yellow-400'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-yellow-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-300"
        >
          {isLoading ? 'Gerando...' : 'Criar Atividades'}
        </button>
      </form>
    </div>
  );
};

export default UserInputForm;