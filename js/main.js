
import { createBlocks } from "./experiment.js";
import {
  showScreen,
  showStimulus,
  updateCategory,
  showFixation,
  clearMessage
} from "./ui.js";

/* ==========================
   상태 변수
========================== */
let participantID = "";

let blocks = createBlocks();
let currentBlockIndex = 0;
let currentTrialIndex = 0;

let currentBlock = null;
let currentStimulus = null;

let stimulusVisible = false;
let startTime = 0;

let results = [];
let errorCount = 0;

/* ==========================
   시작 버튼
========================== */
/*
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("startBtn").addEventListener("click", function() {

    let participantID = document.getElementById("participantID").value.trim();

    if (!participantID) {
      alert("참가자 번호를 입력해주세요.");
      return;
    }

    showScreen("noticeScreen");
  });
});


document.getElementById("startBtn").addEventListener("click", function() {

  let participantID = document.getElementById("participantID").value;

    if (!participantID) {
      alert("참가자 번호를 입력해주세요.");
      return;
    }

  showScreen("noticeScreen");
});*/


document.getElementById("startBtn").onclick = () => {

  participantID = document.getElementById("participantID").value;
      if (!participantID) {
      alert("참가자 번호를 입력해주세요.");
      return;
    }

  showScreen("noticeScreen");
}


/* ==========================
   안내 다음
========================== */
document.getElementById("noticeBtn").onclick = showInstruction;

/* ==========================
   단계 설명
========================== */
function showInstruction() {

  currentBlock = blocks[currentBlockIndex];

  document.getElementById("instructionTitle").textContent =
    currentBlock.name;

  // 설명 텍스트
  let text = "";

  if (currentBlock.name === "연습") {
    text = "자음 → 왼쪽 / 모음 → 오른쪽\n+에서는 잠깐 기다려 주세요";
  } else if (currentBlock.name === "본실험 1") {
    text = "긍정 → 왼쪽 / 부정 → 오른쪽";
  } else {
    text = "부정 → 왼쪽 / 긍정 → 오른쪽";
  }

  document.getElementById("instructionText").innerHTML = text;

  showScreen("instructionScreen");
}

/* ==========================
   실험 시작
========================== */
document.getElementById("instructionBtn").onclick = () => {
  currentTrialIndex = 0;
  startTrial();
};

/* ==========================
   트라이얼 시작
========================== */
function startTrial() {

  if (currentTrialIndex >= currentBlock.trials.length) {
    finishBlock();
    return;
  }

  currentStimulus = currentBlock.trials[currentTrialIndex];

  showScreen("experimentScreen");

  // 카테고리 표시
  updateCategory(
    currentBlock.leftLabel,
    currentBlock.rightLabel
  );

  // 초기 상태
  document.getElementById("stimulusText").style.display = "none";
  document.getElementById("stimulusImage").style.display = "none";

  showFixation();
  clearMessage();

  stimulusVisible = false;

  const delay = 500 + Math.random() * 1000;

  setTimeout(presentStimulus, delay);
}

/* ==========================
   자극 표시
========================== */
function presentStimulus() {

  stimulusVisible = true;

  document.getElementById("fixation").style.display = "none";

  showStimulus(currentStimulus);

  if (currentStimulus.type === "image") {

    const img = document.getElementById("stimulusImage");

    img.onload = () => {
      startTime = performance.now();
    };

  } else {
    startTime = performance.now();
  }
}

/* ==========================
   응답 처리
========================== */
function handleResponse(response) {

  if (!stimulusVisible) return;

  const rt = performance.now() - startTime;
  const correct = response === currentStimulus.correct;

  if (!correct) {
    errorCount++;
    showMessage("틀렸습니다!");
  }
  
  console.log("저장 직전 ID:", participantID);
  results.push({
    participantID: participantID,
    block: currentBlock.name,
    stimulus: currentStimulus.content,
    type: currentStimulus.type,
    response,
    correct,
    reactionTime: Math.round(rt)
  });

  stimulusVisible = false;
  currentTrialIndex++;

  setTimeout(startTrial, 300);
}

/* ==========================
   버튼 입력
========================== */
document.getElementById("leftButton").onclick = () => {
  handleResponse("left");
};

document.getElementById("rightButton").onclick = () => {
  handleResponse("right");
};

/* ==========================
   키보드 입력
========================== */
document.addEventListener("keydown", (e) => {

  if (e.key === "f") handleResponse("left");
  if (e.key === "j") handleResponse("right");

});

/* ==========================
   블록 종료
========================== */
function finishBlock() {

  currentBlockIndex++;

  if (currentBlockIndex >= blocks.length) {
    showScreen("surveyScreen");
    return;
  }

  showInstruction();
}

/* ==========================
   설문 제출
========================== */
document.getElementById("surveySubmitBtn").onclick = () => {

  const personality = document.getElementById("personality").value;
  const currentEmotion = document.getElementById("currentEmotion").value;
  const recentMemory = document.getElementById("recentMemory").value;

  results.forEach(r => {
    r.personality = personality;
    r.currentEmotion = currentEmotion;
    r.recentMemory = recentMemory;
  });

  finishExperiment();
};

/* ==========================
   평균 계산
========================== */
function calculateAverage(blockName) {

  const filtered = results.filter(r =>
    r.block === blockName && r.correct
  );

  if (filtered.length === 0) return 0;

  const total = filtered.reduce((sum, r) => sum + r.reactionTime, 0);

  return Math.round(total / filtered.length);
}

/* ==========================
   실험 종료
========================== */
function finishExperiment() {

  const block1Mean = calculateAverage("본실험 1");
  const block2Mean = calculateAverage("본실험 2");

  const bias = block1Mean - block2Mean;
  

  saveResultsToGoogle(results);
  showScreen("resultScreen");
  document.getElementById("resultBox").innerHTML = `
    <h2>${participantID}</h2>
    <p>본실험1 평균: <b>${block1Mean} ms</b></p>
    <p>본실험2 평균: <b>${block2Mean} ms</b></p>
    <p>편향 점수: <b>${bias}</b></p>
    <p>오답 수: <b>${errorCount}</b></p>
    <p>총 시행 수: <b>${results.length}</b></p>
  `;

}

/* ==========================
   CSV 다운로드
========================== */
document.getElementById("downloadBtn").onclick = downloadCSV;

function downloadCSV() {

  let csv = "\uFEFFParticipantID,Block,Stimulus,Type,Response,Correct,ReactionTime,Personality,CurrentEmotion,RecentMemory\n";

  results.forEach(r => {
    csv += `${r.participantID},${r.block},${r.stimulus},${r.type},${r.response},${r.correct},${r.reactionTime},${r.personality},${r.currentEmotion},${r.recentMemory}\n`;
  });

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `EmotionExperiment_${participantID}.csv`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}


function saveResultsToGoogle(results){

  fetch("https://script.google.com/macros/s/AKfycbzcGfXywuZ89acMuTU2EfWMD85_qiw80xYbFDntoLAx9JxZhAvybnRCLULJHsIG45M/exec", {
    method: "POST",
    body: JSON.stringify(results)
  })
  .then(res => res.text())
  .then(data => console.log("저장 완료:", data))
  .catch(err => console.error("에러:", err));
}



