export type BusinessProgram = {
  id: string;
  code: string;
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
  output: string;
  suitableFor: string[];
  flow: string[];
  ethicsNote?: string;
};

export const programs: BusinessProgram[] = [
  {
    id: "communication-lab",
    code: "01 / TEAM",
    eyebrow: "팀 소통 · 협업",
    title: "Communication Lab",
    description:
      "서로 다른 업무 언어와 반응 패턴을 팀의 공통 언어로 바꿉니다.",
    features: [
      "개인별 동기·소통 스타일 진단",
      "팀 커뮤니케이션 맵",
      "갈등 상황별 대화 실습",
      "우리 팀 협업 원칙 도출",
    ],
    output: "팀 맵 + 소통 합의문",
    suitableFor: [
      "같은 피드백이 사람마다 다르게 전달될 때",
      "부서 간 오해와 방어적 반응이 반복될 때",
      "갈등을 피하거나 감정적으로만 다룰 때",
    ],
    flow: [
      "사전 설문과 리더 인터뷰",
      "팀 커뮤니케이션 워크숍",
      "실제 갈등 장면 대화 실습",
      "팀 협업 원칙 정리",
    ],
  },
  {
    id: "role-fit",
    code: "02 / TALENT",
    eyebrow: "강점 · 역할 배치",
    title: "Role Fit Consulting",
    description:
      "개인의 강점과 에너지 패턴을 업무 요구와 연결해 역할 적합도를 점검합니다.",
    features: [
      "개인 강점·동기 프로파일",
      "현재 역할 적합성 인터뷰",
      "업무·책임 재설계 제안",
      "리더 1:1 디브리핑",
    ],
    output: "역할 적합도 리포트",
    suitableFor: [
      "잘하는 일과 맡은 역할이 어긋날 때",
      "역할 경계와 책임이 불명확할 때",
      "핵심 구성원의 소진과 이탈 신호가 보일 때",
    ],
    flow: [
      "업무 요구와 현재 역할 확인",
      "개인 프로파일과 인터뷰",
      "역할·책임 재설계 제안",
      "리더 디브리핑",
    ],
    ethicsNote:
      "본 프로그램은 채용 합격·불합격을 결정하는 성격검사가 아닙니다. 진단은 업무 역량, 경험, 인터뷰, 조직 맥락과 함께 역할과 성장 가능성을 살펴보는 보조 자료로 사용합니다.",
  },
  {
    id: "leadership-sprint",
    code: "03 / LEADER",
    eyebrow: "리더십 · 조직 운영",
    title: "Leadership Sprint",
    description:
      "리더의 의사결정과 피드백 방식을 점검하고 팀이 움직이는 운영 규칙을 만듭니다.",
    features: [
      "리더십 커뮤니케이션 진단",
      "의사결정 병목 분석",
      "피드백·1on1 프레임",
      "30일 실행 체크인",
    ],
    output: "리더십 실행 플레이북",
    suitableFor: [
      "결정이 특정 리더에게 집중될 때",
      "회의는 길지만 책임과 다음 행동이 불분명할 때",
      "피드백과 1:1 미팅이 형식적으로 운영될 때",
    ],
    flow: [
      "리더십 커뮤니케이션 점검",
      "의사결정 병목 분석",
      "운영 프레임 설계와 실습",
      "실행 체크인",
    ],
  },
  {
    id: "people-insight",
    code: "04 / CLIENT",
    eyebrow: "고객 · 사람 중심 팀",
    title: "People Insight",
    description:
      "상대의 말 뒤에 있는 필요와 욕구를 읽고 관계의 질을 성과로 연결합니다.",
    features: [
      "욕구·동기 관찰 프레임",
      "유형별 질문과 제안 방식",
      "고객·구성원 사례 롤플레이",
      "현장 적용 스크립트",
    ],
    output: "상황별 대화 가이드",
    suitableFor: [
      "상담·교육·영업·의료·서비스처럼 사람을 깊이 이해해야 할 때",
      "고객의 표면적 요청과 실제 기대가 자주 어긋날 때",
      "구성원 또는 고객 상황별 대화 역량이 필요할 때",
    ],
    flow: [
      "반복되는 고객·구성원 장면 수집",
      "욕구·동기 관찰 프레임 학습",
      "실제 사례 롤플레이",
      "현장 적용 스크립트 정리",
    ],
  },
];

export const processSteps = [
  {
    step: "01",
    title: "Discover",
    korean: "현황을 듣습니다",
    body: "리더 인터뷰와 사전 설문으로 팀의 목표, 갈등 지점, 업무 구조를 파악합니다.",
  },
  {
    step: "02",
    title: "Decode",
    korean: "사람을 읽습니다",
    body: "개인의 동기·성향·강점을 해석하고 팀 전체의 상호작용 패턴을 시각화합니다.",
  },
  {
    step: "03",
    title: "Design",
    korean: "해결책을 설계합니다",
    body: "진단 결과를 바탕으로 교육, 워크숍, 리더 코칭의 조합을 제안합니다.",
  },
  {
    step: "04",
    title: "Deliver",
    korean: "현장에서 연습합니다",
    body: "실제 업무 장면을 다루는 참여형 세션으로 팀만의 소통·협업 규칙을 만듭니다.",
  },
  {
    step: "05",
    title: "Drive",
    korean: "실행을 정착시킵니다",
    body: "체크인과 리더 디브리핑으로 배운 언어가 일하는 방식이 되도록 돕습니다.",
  },
];
