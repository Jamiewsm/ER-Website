import Link from "next/link";

const navigation = [
  { href: "/#why", label: "왜 ER인가" },
  { href: "/programs", label: "프로그램" },
  { href: "/#method", label: "진행 방식" },
  { href: "/about", label: "ER의 관점" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="ER Business 홈">
        <span className="brand-mark">ER</span>
        <span className="brand-divider" aria-hidden="true" />
        <span className="brand-name">BUSINESS</span>
      </Link>

      <nav className="desktop-nav" aria-label="주요 메뉴">
        {navigation.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="header-actions">
        <Link className="header-cta" href="/contact">
          제안 요청 <span aria-hidden="true">↗</span>
        </Link>
        <details className="mobile-menu">
          <summary aria-label="메뉴">
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </summary>
          <nav aria-label="모바일 메뉴">
            {navigation.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href="/contact">제안 요청</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
