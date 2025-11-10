import React, { useState } from 'react';
import { PrintablePageData, ActivityType, ConnectTheDotsData, CrosswordData, WordSearchData, CoverPageData, QuizData } from '../types';
import DownloadIcon from './icons/DownloadIcon';
import SpinnerIcon from './icons/SpinnerIcon';

// Declare global variables from CDN scripts
declare var jspdf: any;
declare var html2canvas: any;

// Helper function to get a random fun fact
const getFunFact = () => {
  const facts = [
    "Criando uma cruzadinha única...",
    "Ligando os pontos para revelar uma surpresa...",
    "Escondendo palavras para uma caça super divertida...",
    "Acordando os robôs criativos...",
    "Misturando cores que só existem na imaginação...",
    "Ensinando o computador a desenhar um unicórnio...",
    "Procurando as palavras mais bobas para esconder..."
  ];
  return facts[Math.floor(Math.random() * facts.length)];
};

// Page Wrapper for consistent header/footer on activity pages
const PageWrapper: React.FC<{ pageNumber: number, title: string, children: React.ReactNode }> = ({ pageNumber, title, children }) => {
    return (
        <div className="p-6 flex flex-col h-full bg-white relative">
            <header className="flex justify-between items-center pb-2 border-b-2 border-gray-200">
                <h3 className="text-xl font-bold">{title}</h3>
                <div className="text-sm font-semibold">Nome: <span className="inline-block border-b-2 border-gray-400 w-32"></span></div>
            </header>
            <main className="flex-grow flex flex-col">{children}</main>
            <footer className="text-center text-xs text-gray-400 pt-2 border-t-2 border-gray-200">
                Página {pageNumber}
            </footer>
        </div>
    );
};

// --- Activity Components ---

const ConnectTheDots: React.FC<{ data: ConnectTheDotsData, pageNumber: number }> = ({ data, pageNumber }) => {
  return (
    <PageWrapper title={data.title} pageNumber={pageNumber}>
        <div className="flex-grow flex items-center justify-center">
            <svg viewBox="0 0 105 105" className="w-full h-auto max-w-lg max-h-lg">
                {data.points.map((p, i) => (
                <React.Fragment key={i}>
                    <circle cx={p.x + 2.5} cy={p.y + 2.5} r="1.2" fill="black" />
                    <text x={p.x + 2.5} y={p.y + 2.5} dy="-5" textAnchor="middle" fontSize="5" fontWeight="bold">{i + 1}</text>
                </React.Fragment>
                ))}
            </svg>
        </div>
    </PageWrapper>
  );
};

const Crossword: React.FC<{ data: CrosswordData, pageNumber: number }> = ({ data, pageNumber }) => {
    const cellSize = 40;
    const gridSize = data.gridSize;
    const grid: (string|null)[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    
    data.clues.forEach(clue => {
        for(let i=0; i < clue.answer.length; i++) {
            if (clue.direction === 'across') {
                const r = clue.row;
                const c = clue.col + i;
                if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
                    grid[r][c] = '';
                }
            } else { // 'down'
                const r = clue.row + i;
                const c = clue.col;
                if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
                    grid[r][c] = '';
                }
            }
        }
    });

    return (
        <PageWrapper title={data.title} pageNumber={pageNumber}>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center justify-center">
                    <svg viewBox={`0 0 ${gridSize * cellSize} ${gridSize * cellSize}`} className="max-w-full max-h-full">
                    {grid.map((row, r) => row.map((cell, c) => (
                        cell !== null && <rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize} width={cellSize} height={cellSize} fill="white" stroke="black" strokeWidth="2" />
                    )))}
                    {data.clues.map((clue, i) => (
                        <text key={i} x={clue.col * cellSize + 3} y={clue.row * cellSize + 12} fontSize="10">{clue.num}</text>
                    ))}
                    </svg>
                </div>
                <div className="text-sm space-y-3 overflow-y-auto" style={{ maxHeight: '450px' }}>
                    <div>
                        <h4 className="font-bold text-lg">➡️ Horizontal</h4>
                        {data.clues.filter(c => c.direction === 'across').sort((a,b) => a.num - b.num).map(c => <p key={`across-${c.num}`} className="ml-2"><span className="font-bold">{c.num}.</span> {c.clue}</p>)}
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mt-2">⬇️ Vertical</h4>
                        {data.clues.filter(c => c.direction === 'down').sort((a,b) => a.num - b.num).map(c => <p key={`down-${c.num}`} className="ml-2"><span className="font-bold">{c.num}.</span> {c.clue}</p>)}
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};


const WordSearch: React.FC<{ data: WordSearchData, pageNumber: number }> = ({ data, pageNumber }) => {
  const cellSize = 30;
  return (
    <PageWrapper title={data.title} pageNumber={pageNumber}>
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="col-span-2 flex items-center justify-center">
                 <svg viewBox={`0 0 ${data.gridSize * cellSize} ${data.gridSize * cellSize}`} className="max-w-full max-h-full">
                    {data.grid.map((row, r) => row.map((letter, c) => (
                        <text key={`${r}-${c}`} x={c * cellSize + cellSize/2} y={r * cellSize + cellSize/2} dy=".3em" textAnchor="middle" fontSize="16" fontFamily="monospace" className="font-bold">
                            {letter}
                        </text>
                    )))}
                </svg>
            </div>
            <div className="flex flex-col justify-center">
                <h4 className="font-bold mb-3 text-center text-lg">Encontre estas palavras:</h4>
                <ul className="flex flex-wrap justify-center gap-2">
                    {data.words.map(word => 
                        <li key={word} className="font-semibold bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-base">
                            {word}
                        </li>
                    )}
                </ul>
            </div>
        </div>
    </PageWrapper>
  );
};

const Quiz: React.FC<{ data: QuizData, pageNumber: number }> = ({ data, pageNumber }) => {
    return (
        <PageWrapper title={data.title} pageNumber={pageNumber}>
            <div className="flex-grow flex flex-col p-4 space-y-4 text-left">
                {data.questions.map((q, index) => (
                    <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                        <p className="font-bold text-md md:text-lg mb-2">
                           {index + 1}. {q.question}
                        </p>
                        <ul className="space-y-1 pl-4">
                            {q.options.map((option, optionIndex) => (
                                <li key={optionIndex} className="flex items-center text-sm md:text-base">
                                    <div className="border border-gray-400 rounded-full h-5 w-5 mr-3 flex-shrink-0"></div>
                                    <span>{option}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </PageWrapper>
    );
};

// Cover Page Component
const CoverPage: React.FC<{ data: CoverPageData }> = ({ data }) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-yellow-50 text-center">
            <div className="border-4 border-slate-700 p-4 w-full h-full flex flex-col items-center justify-around border-double">
                 <div>
                    <h1 className="text-5xl font-bold text-slate-800">Meu Livrinho de Atividades</h1>
                    <p className="text-2xl mt-4 text-gray-600">Tema: <span className="font-semibold">{data.theme}</span></p>
                </div>
                
                <p className="text-3xl font-semibold text-slate-800">{data.className}</p>
            </div>
        </div>
    );
};


interface ActivityDisplayProps {
  pages: PrintablePageData[];
  onReset: () => void;
  isLoading: boolean;
}

const ActivityDisplay: React.FC<ActivityDisplayProps> = ({ pages, onReset, isLoading }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    const { jsPDF } = jspdf;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4',
    });

    const pageElements = document.querySelectorAll('.printable-page');
    const a4Width = pdf.internal.pageSize.getWidth();
    
    for (let i = 0; i < pageElements.length; i++) {
        const element = pageElements[i] as HTMLElement;
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const a4Height = (canvas.height * a4Width) / canvas.width;
        
        if (i > 0) {
            pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, 0, a4Width, a4Height);
    }
    
    pdf.save('livrinho-de-atividades.pdf');
    setIsDownloading(false);
  };
  
  if (isLoading) {
    return (
        <div className="text-center p-8">
            <SpinnerIcon className="animate-spin h-12 w-12 mx-auto text-yellow-600" />
            <p className="mt-4 text-xl font-semibold text-gray-700">{getFunFact()}</p>
        </div>
    );
  }

  if (pages.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex justify-center items-center gap-4 my-8 sticky top-4 z-10">
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-gray-400 flex items-center gap-2 transition-colors"
        >
          {isDownloading ? <SpinnerIcon className="animate-spin h-5 w-5" /> : <DownloadIcon className="h-6 w-6" />}
          {isDownloading ? 'Preparando PDF...' : 'Baixar PDF'}
        </button>
        <button
          onClick={onReset}
          className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
        >
          Começar de Novo
        </button>
      </div>

      <div id="pdf-content" className="max-w-4xl mx-auto space-y-8 p-4">
        {pages.map((pageData, index) => (
          <div key={index} className="printable-page bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden" style={{ aspectRatio: '1 / 1.414' /* A4 ratio */ }}>
            {pageData.type === 'COVER' && <CoverPage data={pageData} />}
            {pageData.type === ActivityType.CONNECT_THE_DOTS && <ConnectTheDots data={pageData} pageNumber={index} />}
            {pageData.type === ActivityType.CROSSWORD && <Crossword data={pageData} pageNumber={index} />}
            {pageData.type === ActivityType.WORD_SEARCH && <WordSearch data={pageData} pageNumber={index} />}
            {pageData.type === ActivityType.QUIZ && <Quiz data={pageData} pageNumber={index} />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityDisplay;