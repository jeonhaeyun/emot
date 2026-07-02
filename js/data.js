export const positiveWords0 = [
"행복","기쁨"
];
export const positiveWords = [
"행복","기쁨","사랑","희망","성공",
"감사","웃음","만족","즐거움","평온",
"설렘","배려","응원","우정","행운",
"안정","성취","따뜻함","자신감","편안함"
];

export const negativeWords0 = [
"슬픔","분노"

];
export const negativeWords = [
"슬픔","분노","공포","불안","실패",
"좌절","스트레스","걱정","외로움","우울",
"후회","긴장","상실","절망","불신",
"혼란","고통","위협","짜증","두려움"
];


export const positiveImages= Array.from({length:10},(_,i)=>
  `./images/happy${i+1}.png`
);

export const negativeImages = Array.from({length:9},(_,i)=>
  `./images/sad${i+1}.png`
);
