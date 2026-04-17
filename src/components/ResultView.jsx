import { analyzeZhuXi } from '../utils/divination';

// 하나의 괘(6개 효)를 그려주는 작은 컴포넌트
function HexagramDrawing({ hexInfo, history, isTransformed }) {
  // history는 초효(0) ~ 상효(5) 순서로 들어옴
  // 그릴 때는 배열을 뒤집어 상효가 맨 위로 가게 렌더링
  const lines = [...history].reverse();
  
  return (
    <div className="hex-column">
      <div className="hex-name">{hexInfo.num}. {hexInfo.n}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
        상: {hexInfo.bagua.upper} / 하: {hexInfo.bagua.lower}
      </div>
      <div className="hex-lines">
        {lines.map((h, i) => {
          // i는 뒤집혀진 인덱스 (0이 상효, 5가 초효)
          const actualIndex = 5 - i; 
          const originalH = history[actualIndex];
          const isYang = isTransformed ? originalH.trans === 1 : originalH.orig === 1;
          const isMoving = originalH.moving;
          
          return (
            <div key={actualIndex} className="yao-line">
              {isYang ? (
                <div className={`yao-segment ${!isTransformed && isMoving ? 'yao-moving yao-yang' : ''}`} style={{ width: '100%' }}></div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div className={`yao-segment ${!isTransformed && isMoving ? 'yao-moving yao-yin' : ''}`} style={{ width: '45%' }}></div>
                  <div className={`yao-segment ${!isTransformed && isMoving ? 'yao-moving yao-yin' : ''}`} style={{ width: '45%' }}></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ResultView({ question, history, originalHex, transformedHex, onRestart }) {
  const result = analyzeZhuXi(history, originalHex, transformedHex);

  return (
    <div className="step-container">
      <header>
        <h1>점단 결과</h1>
        <p>당신의 소망에 대한 주역의 지혜입니다.</p>
      </header>
      <main>
        <div className="question-echo">
          " {question} "
        </div>

        <div className="hex-display">
          <HexagramDrawing hexInfo={originalHex} history={history} isTransformed={false} />
          
          <div className="hex-arrow">
            {result.numMovings > 0 ? '→' : ''}
          </div>
          
          {result.numMovings > 0 ? (
            <HexagramDrawing hexInfo={transformedHex} history={history} isTransformed={true} />
          ) : (
            <div className="hex-column">
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '40px' }}>
                변효가 없어<br/>지괘로 변하지 않습니다.
              </div>
            </div>
          )}
        </div>

        <div className="result-panel">
          <span style={{ display: 'inline-block', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            {result.highlightTitle}
          </span>
          <h3>핵심 해설</h3>
          <div className="message">{result.highlightMessage}</div>
        </div>

        <button onClick={onRestart} className="outline">다시 점치기</button>
      </main>
    </div>
  );
}
