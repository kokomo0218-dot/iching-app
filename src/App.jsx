import { useState } from 'react';
import QuestionInput from './components/QuestionInput';
import CoinToss from './components/CoinToss';
import ResultView from './components/ResultView';
import { tossCoins, resolveHexagrams } from './utils/divination';

function App() {
  const [step, setStep] = useState(0); // 0: Question, 1: Toss, 2: Result
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]);
  const [hexagrams, setHexagrams] = useState({ originalHex: null, transformedHex: null });

  const handleStart = (q) => {
    setQuestion(q);
    setStep(1);
  };

  const handleToss = () => {
    const result = tossCoins();
    const newHistory = [...history, result];
    setHistory(newHistory);
    
    if (newHistory.length === 6) {
      // 결과 도출
      const resolved = resolveHexagrams(newHistory);
      setHexagrams(resolved);
      setTimeout(() => {
        setStep(2);
      }, 1000); // 1초 대기 후 결과 화면 전환
    }
    return result;
  };

  const handleRestart = () => {
    setStep(0);
    setQuestion('');
    setHistory([]);
    setHexagrams({ originalHex: null, transformedHex: null });
  };

  return (
    <>
      {step === 0 && <QuestionInput onStart={handleStart} />}
      {step === 1 && <CoinToss history={history} onToss={handleToss} />}
      {step === 2 && (
        <ResultView 
          question={question} 
          history={history} 
          originalHex={hexagrams.originalHex} 
          transformedHex={hexagrams.transformedHex}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}

export default App;
