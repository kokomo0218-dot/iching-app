import { useState, useEffect } from 'react';

export default function CoinToss({ history, onToss }) {
  const [isTossing, setIsTossing] = useState(false);
  const [currentCoins, setCurrentCoins] = useState(['?', '?', '?']);

  const handleTossClick = () => {
    if (isTossing) return;
    setIsTossing(true);
    
    // 단순한 애니메이션 효과 시뮬레이션
    setTimeout(() => {
      const result = onToss();
      setCurrentCoins(result.coins.map(c => c ? '○' : '●'));
      setIsTossing(false);
    }, 600);
  };

  const currentYaoName = ['초효(初爻)', '이효(二爻)', '삼효(三爻)', '사효(四爻)', '오효(五爻)', '상효(上爻)'];
  const nextTarget = history.length;

  return (
    <div className="step-container">
      <header>
        <h1>주역점 뽑기</h1>
        <p>진지한 마음으로 동전을 던져주세요.</p>
      </header>
      <main>
        <div className="coin-stage">
          <div style={{ marginBottom: '20px', fontWeight: '600' }}>
            {nextTarget < 6 ? `${currentYaoName[nextTarget]}를 뽑을 차례입니다.` : '괘가 모두 완성되었습니다.'}
          </div>
          
          <div className="coins">
            {[0, 1, 2].map(i => (
              <div key={i} className={`coin ${isTossing ? 'tossing' : ''}`}>
                {isTossing ? '?' : currentCoins[i]}
              </div>
            ))}
          </div>
          
          {nextTarget < 6 && (
            <button onClick={handleTossClick} disabled={isTossing}>
              {isTossing ? '동전 던지는 중...' : '동전 던지기'}
            </button>
          )}
        </div>

        <div className="toss-history">
          <h3 style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-muted)' }}>누적 결과 (아래부터 위로 쌓임)</h3>
          {[...history].reverse().map((h, i) => {
            const actualIndex = history.length - 1 - i;
            return (
              <div key={actualIndex} className={`history-item ${h.moving ? 'moving' : ''}`}>
                <div>
                  <span style={{ fontWeight: '600', marginRight: '10px' }}>{actualIndex + 1}회차</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentYaoName[actualIndex]}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ letterSpacing: '2px' }}>{h.coins.map(c => c ? '○' : '●').join('')}</div>
                  <div style={{ fontSize: '0.8rem', color: h.moving ? 'var(--gold-color)' : 'var(--text-muted)' }}>
                    {h.sasang} {h.moving && '(변효)'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
