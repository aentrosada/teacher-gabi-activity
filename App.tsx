import React, { useState, useCallback } from 'react';
import { UserInputs, PrintablePageData, GenerationResult } from './types';
import { AGE_RANGES, LANGUAGES, ACTIVITY_TYPES } from './constants';
import { generateActivities } from './services/geminiService';
import UserInputForm from './components/UserInputForm';
import ActivityDisplay from './components/ActivityDisplay';

const App: React.FC = () => {
  const [userInputs, setUserInputs] = useState<UserInputs>({
    theme: '',
    language: LANGUAGES[0], // Default to Portuguese
    age: AGE_RANGES[1],
    activityType: ACTIVITY_TYPES[0],
    className: '',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [printablePages, setPrintablePages] = useState<PrintablePageData[]>([]);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setPrintablePages([]);

    try {
      const result: GenerationResult = await generateActivities(userInputs);
      const coverPage: PrintablePageData = {
        type: 'COVER',
        className: userInputs.className,
        theme: userInputs.theme,
      };
      setPrintablePages([coverPage, ...result.activities]);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  }, [userInputs]);

  const handleReset = () => {
      setPrintablePages([]);
      setError(null);
      setUserInputs(prev => ({...prev, theme: '', className: ''}));
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-yellow-600">🎨 Estúdio de Atividades Infantis</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 md:py-12">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 max-w-lg mx-auto" role="alert">
            <strong className="font-bold">Ah, não! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {printablePages.length === 0 ? (
          <UserInputForm
            userInputs={userInputs}
            setUserInputs={setUserInputs}
            onSubmit={handleGenerate}
            isLoading={isLoading}
          />
        ) : null}

        {(isLoading || printablePages.length > 0) &&
          <ActivityDisplay 
            pages={printablePages}
            onReset={handleReset}
            isLoading={isLoading}
          />
        }
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Desenvolvido com IA Generativa por Thainá Cecília..</p>
      </footer>
    </div>
  );
};

export default App;
