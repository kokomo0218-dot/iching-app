import { BAGUA, HEX_MAP, HEX_YAO_DATA, HEX_MESSAGES } from '../data/db';

/**
 * 3개의 동전을 무작위로 던져 하나의 효(爻) 결과를 반환합니다.
 * 앞면(흰색)=3, 뒷면(검정)=2
 * 
 * 6: 노음(Old Yin) - 변효 (0 -> 1)
 * 7: 소양(Young Yang) - 불변 (1 -> 1)
 * 8: 소음(Young Yin) - 불변 (0 -> 0)
 * 9: 노양(Old Yang) - 변효 (1 -> 0)
 */
export function tossCoins() {
  let sum = 0;
  const coins = [];
  for (let i = 0; i < 3; i++) {
    const isHead = Math.random() < 0.5;
    coins.push(isHead); // true=앞면(3), false=뒷면(2)
    sum += isHead ? 3 : 2;
  }
  
  let sasang, orig, trans, moving;
  switch (sum) {
    case 6:  sasang = '노음'; orig = 0; trans = 1; moving = true; break;
    case 7:  sasang = '소양'; orig = 1; trans = 1; moving = false; break;
    case 8:  sasang = '소음'; orig = 0; trans = 0; moving = false; break;
    case 9:  sasang = '노양'; orig = 1; trans = 0; moving = true; break;
    // fallback
    default: sasang = '소양'; orig = 1; trans = 1; moving = false; break;
  }
  
  return { coins, sum, sasang, orig, trans, moving };
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
 * @param {Array} history 6길이의 효 배열
 */
export function resolveHexagrams(history) {
  // 본괘 (상괘와 하괘가 바뀌었다는 요청에 따라 oUpper와 oLower의 원천 데이터를 교환하거나 조회 시 교정)
  // 기존: history[0..2]가 하괘, history[3..5]가 상괘
  // 수정: history[0..2]를 상괘로, history[3..5]를 하괘로 처리하여 위치 교정
  const oUpper = findBaguaIdx([history[0].orig, history[1].orig, history[2].orig]);
  const oLower = findBaguaIdx([history[3].orig, history[4].orig, history[5].orig]);
  const oInfo  = { ...HEX_MAP[oUpper][oLower] };
  oInfo.bagua = { upper: BAGUA[oUpper].name, lower: BAGUA[oLower].name };

  // 지괘
  const tUpper = findBaguaIdx([history[0].trans, history[1].trans, history[2].trans]);
  const tLower = findBaguaIdx([history[3].trans, history[4].trans, history[5].trans]);
  const tInfo  = { ...HEX_MAP[tUpper][tLower] };
  tInfo.bagua = { upper: BAGUA[tUpper].name, lower: BAGUA[tLower].name };

  return { originalHex: oInfo, transformedHex: tInfo };
}

/**
 * 주희(주자)의 점단 7단계 기준에 따라 핵심 해설을 결정합니다.
 */
export function analyzeZhuXi(history, originalHex, transformedHex) {
  const movings = history.map((h, i) => ({ ...h, index: i })).filter(h => h.moving);
  const unmovings = history.map((h, i) => ({ ...h, index: i })).filter(h => !h.moving);
  const numMovings = movings.length;

  let highlightMessage = "";
  let highlightTitle = "";
  let targetIndices = []; // 해석에 초점을 맞출 효의 인덱스 (0~5)

  switch (numMovings) {
    case 0:
      // 변효가 0개: 본괘의 괘사(메시지)를 주요 해석으로 삼는다.
      highlightTitle = `변효 0개: 본괘(${originalHex.n})의 괘사를 읽습니다.`;
      highlightMessage = HEX_MESSAGES[originalHex.num];
      // 괘 전체가 대상이므로 targetIndices는 비워둠 (혹은 0~5 전체)
      break;
    case 1:
      // 변효가 1개: 본괘의 그 변효 효사를 읽는다.
      highlightTitle = `변효 1개: 본괘(${originalHex.n})의 변효 효사를 읽습니다.`;
      highlightMessage = HEX_YAO_DATA[originalHex.num][movings[0].index];
      targetIndices = [movings[0].index];
      break;
    case 2:
      // 변효가 2개: 본괘의 변한 두 효 중 위에 있는 효를 위주로 읽는다.
      const topMoving2 = movings[1]; 
      highlightTitle = `변효 2개: 상위 변효인 본괘(${originalHex.n})의 효사를 위주로 읽습니다.`;
      highlightMessage = HEX_YAO_DATA[originalHex.num][topMoving2.index];
      targetIndices = [topMoving2.index];
      break;
    case 3:
      // 변효가 3개: 본괘와 지괘의 괘사를 같이 참고한다.
      highlightTitle = `변효 3개: 본괘(${originalHex.n})와 지괘(${transformedHex.n})의 괘사를 함께 읽습니다.`;
      highlightMessage = `[본괘] ${HEX_MESSAGES[originalHex.num]}\n\n[지괘] ${HEX_MESSAGES[transformedHex.num]}`;
      break;
    case 4:
      // 변효가 4개: 2개의 불변효 중 아래에 있는 효(하위 효)의 지괘 효사를 읽는다.
      const bottomUnmoving4 = unmovings[0];
      highlightTitle = `변효 4개: 지괘(${transformedHex.n})의 하위 불변효 효사를 위주로 읽습니다.`;
      highlightMessage = HEX_YAO_DATA[transformedHex.num][bottomUnmoving4.index];
      targetIndices = [bottomUnmoving4.index];
      break;
    case 5:
      // 변효가 5개: 1개의 불변효의 지괘 효사를 읽는다.
      const theOnlyUnmoving = unmovings[0];
      highlightTitle = `변효 5개: 지괘(${transformedHex.n})의 유일한 불변효 효사를 읽습니다.`;
      highlightMessage = HEX_YAO_DATA[transformedHex.num][theOnlyUnmoving.index];
      targetIndices = [theOnlyUnmoving.index];
      break;
    case 6:
      // 변효가 6개: 지괘의 괘사를 읽는다.
      highlightTitle = `변효 6개: 지괘(${transformedHex.n})의 괘사를 읽습니다.`;
      highlightMessage = HEX_MESSAGES[transformedHex.num];
      break;
  }

  return { numMovings, highlightTitle, highlightMessage, targetIndices };
}
