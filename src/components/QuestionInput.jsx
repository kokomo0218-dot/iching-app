import { useState } from 'react';

export default function QuestionInput({ onStart }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('질문을 입력해주세요.');
      return;
    }
    onStart(text);
  };

  return (
    <div className="step-container">
      <header>
        <h1>동전 주역점</h1>
        <p>세 개의 동전을 던져 괘를 얻는 척전법</p>
      </header>
      <main style={{ justifyContent: 'center' }}>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <h2>무엇이 궁금하신가요?</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            점치고자 하는 소망이나 묻고 싶은 질문을 구체적으로 적어주세요.
          </p>
          <input 
            type="text" 
            placeholder="예: 이번 프로젝트가 성공적으로 끝날까요?" 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
          />
          <button type="submit">점치기 시작</button>
        </form>
      </main>
    </div>
  );
}
