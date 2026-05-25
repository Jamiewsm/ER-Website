# 모바일 브로셔 PDF

공지사항 「모바일 브로셔」 버튼이 여는 파일입니다.

## 저장소에 넣을 경로 (필수)

```
ER-Website/parenting-workshop/mobile-brochure.pdf
```

## Mac에서 복사 예시

Canva/iCloud에 있는 파일:

`모바일 브로셔.pdf`  
(예: `…/Visual Studio Code/Parening Workshop/모바일 브로셔.pdf`)

터미널:

```bash
cp "/Users/jwoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/Parening Workshop/모바일 브로셔.pdf" \
  "/경로/ER-Website/parenting-workshop/mobile-brochure.pdf"
```

VS Code: `parenting-workshop` 폴더에 PDF를 넣고 이름을 **`mobile-brochure.pdf`** 로 맞추세요.

## 배포 (이걸 안 하면 웹에서 404)

로컬에만 `mobile-brochure.pdf` 가 있고 **GitHub에 없으면** 사이트에 절대 안 올라갑니다.

```bash
cd ER-Website
bash scripts/check-parenting-pdf.sh   # OK 나와야 함
git add parenting-workshop/mobile-brochure.pdf
git commit -m "add parenting mobile brochure PDF"
git push origin main
```

1. GitHub 웹 → `parenting-workshop/mobile-brochure.pdf` 파일이 보이는지 확인  
2. Cloudflare Pages → `main` 최신 배포 **Success**  
3. 브라우저: `https://er-coaching.com/parenting-workshop/mobile-brochure.pdf` → PDF가 열려야 함 (`404` = 아직 미배포)

공지 버튼·코드도 최신 `main` 배포가 필요합니다 (`notices.js`에 `mobile-brochure.pdf` 링크).

웹 URL: `https://er-coaching.com/parenting-workshop/mobile-brochure.pdf`
