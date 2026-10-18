const { existsSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');

// 독립 검사·이전 런타임의 변경이 메인 사이트 CSS 배포를 요구하지 않도록 경계를 유지한다.
const html = readFileSync(resolve(__dirname, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*\bsrc=["'](js\/[^"']+)["']/g)]
    .map(([, src]) => `./${src.split(/[?#]/, 1)[0]}`)
    .filter((path) => path.endsWith('.js') && existsSync(resolve(__dirname, path)));

module.exports = {
    content: {
        relative: true,
        files: ['./index.html', ...scripts],
    },
    // 유형 안내의 bg-*-50 → bg-*-400 런타임 치환은 정적 스캔으로 찾을 수 없다.
    safelist: [
        'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-purple-400',
        'bg-blue-400', 'bg-indigo-400', 'bg-green-400', 'bg-pink-400', 'bg-gray-400',
    ],
    theme: {
        extend: {
            colors: {
                er: {
                    /* Restoration Green 토큰 — DESIGN.md가 단일 기준 */
                    base: '#FBFAF5',      /* 페이지 배경: 웜 페이퍼 크림 */
                    surface: '#FFFDF8',   /* 카드·모달: 밝은 크림 */
                    sand: '#E2D8C8',      /* 보더·디바이더 */
                    ink: '#202219',       /* 최상위 제목·primary CTA */
                    inkSoft: '#30322D',   /* 섹션 제목 */
                    body: '#44473F',      /* 본문 */
                    muted: '#6F7068',     /* 보조·캡션 */
                    green: '#657453',     /* 브랜드 액센트: 세이지 그린 */
                    greenDark: '#566647', /* 액센트 hover */
                    greenDeep: '#30451F', /* 최고 강조 */
                    greenTint: '#F0EDE4', /* 태그·배지 배경 — 웜 크림 틴트 */
                    heart: '#B4434D',     /* 장학 후원 하트 전용 */
                    terra: '#B06149',     /* 웜 액센트: 검사 결과 하이라이트 전용 */
                    terraDark: '#8F4634',
                    /* 폐기 예정 별칭 — 구 브라운 토큰명을 그린 값으로 재매핑. 신규 코드 사용 금지 */
                    primary: '#44473F',
                    accent: '#657453',
                    accentDark: '#566647',
                    accentLight: '#F0EDE4',
                    dark: '#566647',      /* 별칭: er-greenDark — CTA·다크 밴드 (잉크 블랙 금지) */
                }
            },
            fontFamily: {
                sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
                display: ['SUIT', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 22px 44px -24px rgba(80, 90, 60, 0.16)',
                'card': '0 28px 54px -28px rgba(70, 85, 55, 0.20)',
                'glow': '0 0 30px rgba(101, 116, 83, 0.18)'
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'fade-in': 'fadeIn 1s ease-out forwards',
                'slide-down': 'slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        }
    }
};
