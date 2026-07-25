import Link from "next/link";
import { businessEmail, legalOperator } from "../site-config";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <span className="brand-mark">ER</span>
        <span className="brand-divider" aria-hidden="true" />
        <span className="brand-name">BUSINESS</span>
      </div>
      <p>
        사람을 이해하고, 역할을 맞추고,
        <br />
        팀의 성과를 설계합니다.
      </p>
      <nav className="footer-links" aria-label="하단 메뉴">
        <Link href="/programs">Programs</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <a href="https://er-coaching.com">ER Coaching</a>
      </nav>
      <div className="footer-bottom">
        <span>© 2026 ER Business</span>
        <span>
          {legalOperator.name} · 대표 {legalOperator.representative} ·
          사업자등록번호 {legalOperator.registrationNumber}
        </span>
        <a href={`mailto:${businessEmail}`}>{businessEmail}</a>
      </div>
    </footer>
  );
}
