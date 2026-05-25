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

## 배포

1. `git add parenting-workshop/mobile-brochure.pdf`
2. `git commit -m "add parenting mobile brochure PDF"`
3. `git push` → 사이트 배포 후 공지에서 PDF가 열립니다.

웹 URL: `https://er-coaching.com/parenting-workshop/mobile-brochure.pdf`
