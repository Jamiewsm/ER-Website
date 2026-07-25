import Link from "next/link";

export function InquiryCta({
  title = "우리 팀에 맞는 시작점을 함께 찾습니다.",
  body = "현재 가장 반복되는 문제와 원하는 변화를 알려주세요. 필요한 범위만 정리해 제안드립니다.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="inquiry-band">
      <div>
        <p className="eyebrow">START THE CONVERSATION</p>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      <Link className="button button-dark" href="/contact">
        제안 요청하기 <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}
