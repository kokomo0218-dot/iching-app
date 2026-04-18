import { analyzeZhuXi } from '../utils/divination';

function HexagramDrawing({ hexInfo, history, isTransformed, targetIndices = [], showTarget = false }) {
  // history: [0..5] (초효..상효)
  // 화면에 그릴 때는 상효(5)가 맨 위로 가야 하므로 배열을 뒤집음
  const drawOrder = [5, 4, 3, 2, 1, 0];
  
  return (
    <div className="hex-column">
      <div className="hex-name">{hexInfo.num}. {hexInfo.n}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
        {hexInfo.bagua.upper} / {hexInfo.bagua.lower}
      </div>
      <div className="hex-lines">
        {drawOrder.map((actualIndex) => {
          const h = history[actualIndex];
          const isYang = isTransformed ? h.trans === 1 : h.orig === 1;
          const isMoving = h.moving;
          const isTarget = showTarget && targetIndices.includes(actualIndex);
          
          // 지괘에서 변한 효인지 여부
          const isChangedLine = isTransformed && isMoving;
          
          return (
            <div key={actualIndex} className="yao-line-wrapper">
              <div className={`yao-line ${isYang ? 'yao-yang' : 'yao-yin'} ${isMoving && !isTransformed ? 'yao-moving' : ''} ${isChangedLine ? 'yao-changed' : ''} ${isTarget ? 'yao-target-glow' : ''}`}>
                {isYang ? (
                  <div className="yao-segment"></div>
                ) : (
                  <>
                    <div className="yao-segment"></div>
                    <div className="yao-segment"></div>
                  </>
                )}
              </div>
              {isTarget && (
                <div className="target-arrow" style={{ position: 'absolute', right: '-25px' }}>
                  ◀
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
  const hasTransformed = result.numMovings > 0;

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
          <HexagramDrawing 
            hexInfo={originalHex} 
            history={history} 
            isTransformed={false} 
            targetIndices={result.targetIndices} 
            showTarget={result.resultHex === '본괘'}
          />
          
          <div className="hex-arrow" style={{ fontSize: '2rem', opacity: 0.3 }}>
            {hasTransformed ? '→' : ''}
          </div>
          
          {hasTransformed ? (
            <HexagramDrawing 
              hexInfo={transformedHex} 
              history={history} 
              isTransformed={true} 
              targetIndices={result.targetIndices} 
              showTarget={result.resultHex === '지괘'}
            />
          ) : (
            <div className="hex-column">
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '60px' }}>
                변효가 없어<br/>지괘로 변하지 않습니다.
              </div>
            </div>
          )}
        </div>

        <div className="result-panel">
          <div style={{ marginBottom: '12px' }}>
            <span style={{ 
              backgroundColor: 'var(--primary)', 
              color: 'white', 
              padding: '4px 10px', 
              borderRadius: '20px', 
              fontSize: '0.75rem', 
              fontWeight: '600' 
            }}>
              {result.highlightTitle.split(']')[0] + ']'}
            </span>
            <span style={{ marginLeft: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {result.highlightTitle.split(']')[1]}
            </span>
          </div>
          <h3>핵심 해설</h3>
          <div className="message">{result.highlightMessage}</div>
        </div>

        <button onClick={onRestart} className="outline">다시 점치기</button>
      </main>
    </div>
  );
}
