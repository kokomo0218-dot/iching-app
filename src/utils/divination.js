import { BAGUA, HEX_MAP, HEX_YAO_DATA, HEX_MESSAGES, YAO_NAMES } from '../data/db';

/**
 * 3개의 동전을 무작위로 던져 하나의 효(爻) 결과를 반환합니다.
 * 사용자의 척전법 기준:
 * - 앞면 3개: 노음(老陰) - 변효 (0 -> 1)
 * - 뒷면 3개: 노양(老陽) - 변효 (1 -> 0)
 * - 앞면 2개, 뒷면 1개: 소양(少陽) - 불변 (1 -> 1)
 * - 뒷면 2개, 앞면 1개: 소음(少陰) - 불변 (0 -> 0)
 */
export function tossCoins() {
  const coins = [];
  let headCount = 0;
  for (let i = 0; i < 3; i++) {
    const isHead = Math.random() < 0.5;
    coins.push(isHead); // true=앞면, false=뒷면
    if (isHead) headCount++;
  }
  
  let sasang, orig, trans, moving;
  
  if (headCount === 3) {
    sasang = '노음'; orig = 0; trans = 1; moving = true;
  } else if (headCount === 0) {
    sasang = '노양'; orig = 1; trans = 0; moving = true;
  } else if (headCount === 2) {
    sasang = '소양'; orig = 1; trans = 1; moving = false;
  } else { // headCount === 1
    sasang = '소음'; orig = 0; trans = 0; moving = false;
  }
  
  return { coins, headCount, sasang, orig, trans, moving };
}

/**
 * 3개의 효(하괘 혹은 상괘)를 배열로 받아 BAGUA 인덱스를 반환합니다.
 */
function findBaguaIdx(lines3) {
  for (let i = 0; i < 8; i++) {
    const b = BAGUA[i].lines;
    if (b[0] === lines3[0] && b[1] === lines3[1] && b[2] === lines3[2]) return i;
  }
  return 0; // fallback
}

/**
 * 6번 던진 결과를 기반으로 본괘와 지괘 정보를 산출합니다.
 * @param {Array} history 6길이의 효 배열 (0이 초효, 5가 상효)
 */
export function resolveHexagrams(history) {
  // 사용자의 요청: 얻은 순서대로 아래(초효)부터 위(상효)를 향해 차례대로 그려 나감
  // 하괘(내괘): 0, 1, 2효 / 상괘(외괘): 3, 4, 5효
  const oLower = findBaguaIdx([history[0].orig, history[1].orig, history[2].orig]);
  const oUpper = findBaguaIdx([history[3].orig, history[4].orig, history[5].orig]);
  const oInfo  = { ...HEX_MAP[oUpper][oLower] }; // HEX_MAP[상][하] 구조
  oInfo.bagua = { upper: BAGUA[oUpper].name, lower: BAGUA[oLower].name };

  // 지괘 (변한 결과)
  const tLower = findBaguaIdx([history[0].trans, history[1].trans, history[2].trans]);
  const tUpper = findBaguaIdx([history[3].trans, history[4].trans, history[5].trans]);
  const tInfo  = { ...HEX_MAP[tUpper][tLower] };
  tInfo.bagua = { upper: BAGUA[tUpper].name, lower: BAGUA[tLower].name };

  return { originalHex: oInfo, transformedHex: tInfo };
}

/**
 * 주희(주자)의 점단 7단계 기준에 따라 핵심 해설을 결정합니다.
 */
export function analyzeZhuXi(history, originalHex, transformedHex) {
  // 방어 코드: 인자가 유효하지 않으면 기본값 반환
  if (!history || history.length < 6 || !originalHex || !transformedHex) {
    return { 
      numMovings: 0, 
      highlightTitle: "데이터 로딩 중...", 
      highlightMessage: "결과를 계산할 수 없습니다.", 
      targetIndices: [], 
      resultHex: '본괘' 
    };
  }

  const movings = history.map((h, i) => ({ ...h, index: i })).filter(h => h.moving);
  const unmovings = history.map((h, i) => ({ ...h, index: i })).filter(h => !h.moving);
  const numMovings = movings.length;

  let highlightMessage = "";
  let highlightTitle = "";
  let targetIndices = []; 
  let resultHex = '본괘';

  // db에서 안전하게 가져오기 위한 헬퍼
  const getMessage = (num) => HEX_MESSAGES[num] || "해당 괘의 설명이 없습니다.";
  const getYaoData = (num, idx) => (HEX_YAO_DATA[num] && HEX_YAO_DATA[num][idx]) || "해당 효의 설명이 없습니다.";
  const getYaoName = (idx) => YAO_NAMES[idx] || `${idx + 1}효`;

  switch (numMovings) {
    case 0:
      highlightTitle = `[변효 0개] 본괘(${originalHex.n})의 괘사로 판단합니다.`;
      highlightMessage = getMessage(originalHex.num);
      targetIndices = [0, 1, 2, 3, 4, 5];
      break;
    case 1:
      const m1 = movings[0];
      highlightTitle = `[변효 1개] 본괘(${originalHex.n})의 변효 ${getYaoName(m1.index)} 효사로 판단합니다.`;
      highlightMessage = getYaoData(originalHex.num, m1.index);
      targetIndices = [m1.index];
      break;
    case 2:
      const topMoving = movings[1] || movings[0]; 
      highlightTitle = `[변효 2개] 본괘(${originalHex.n})의 변효 중 위쪽(${getYaoName(topMoving.index)}) 효사가 주가 됩니다.`;
      highlightMessage = getYaoData(originalHex.num, topMoving.index);
      targetIndices = [topMoving.index];
      break;
    case 3:
      highlightTitle = `[변효 3개] 본괘(${originalHex.n})와 지괘(${transformedHex.n})의 괘사를 함께 봅니다.`;
      highlightMessage = `[본괘-전체] ${getMessage(originalHex.num)}\n\n[지괘-참고] ${getMessage(transformedHex.num)}`;
      targetIndices = [0, 1, 2, 3, 4, 5];
      break;
    case 4:
      const bottomUnmoving = unmovings[0];
      highlightTitle = `[변효 4개] 지괘(${transformedHex.n})의 불변효 중 아래쪽(${getYaoName(bottomUnmoving.index)}) 효사가 주가 됩니다.`;
      highlightMessage = getYaoData(transformedHex.num, bottomUnmoving.index);
      targetIndices = [bottomUnmoving.index];
      resultHex = '지괘';
      break;
    case 5:
      const soleUnmoving = unmovings[0];
      highlightTitle = `[변효 5개] 지괘(${transformedHex.n})의 유일한 불변효(${getYaoName(soleUnmoving.index)}) 효사로 판단합니다.`;
      highlightMessage = getYaoData(transformedHex.num, soleUnmoving.index);
      targetIndices = [soleUnmoving.index];
      resultHex = '지괘';
      break;
    case 6:
      highlightTitle = `[변효 6개] 지괘(${transformedHex.n})의 괘사로 판단합니다.`;
      highlightMessage = getMessage(transformedHex.num);
      targetIndices = [0, 1, 2, 3, 4, 5];
      resultHex = '지괘';
      break;
  }

  return { numMovings, highlightTitle, highlightMessage, targetIndices, resultHex };
}
