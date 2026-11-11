# jihoai.github.io

개인 포트폴리오 겸 블로그입니다. `main`에 변경 사항이 올라가면 GitHub Actions가 자동으로 빌드해 <https://jihoai.github.io>에 배포합니다. GitHub 웹에서 파일을 고치고 커밋하기만 하면 됩니다.

## 글 쓰기

`_posts` 폴더에 `YYYY-MM-DD-제목.md` 형식의 파일을 추가합니다. 파일 맨 위에 아래 내용을 넣습니다.

```yaml
---
title: "PPO"
date: 2026-11-20 15:00:00 +0900
categories: [Reinforcement Learning]
tags: [reinforcement-learning, theory]
math: true
description: 첫 화면 글 목록에 보일 한 줄 요약 (없어도 됩니다)
---
```

- 글 주소는 `/posts/제목/`이 됩니다. 제목은 파일 이름의 날짜 뒷부분입니다.
- `date`가 미래 시각이면 그 시각이 지나기 전에는 글이 보이지 않습니다.
- `categories`는 첫 화면의 필터 버튼이 됩니다.
- 수식을 쓰려면 `math: true`를 넣습니다. 문장 안 수식은 `$...$`, 별도 줄 수식은 `$$...$$`입니다.
- 이미지는 `assets/img/글이름/`에 올리고 `![설명](/assets/img/글이름/파일.png)`로 넣습니다. 설명(대체 텍스트)을 비우지 마세요.
- 코드는 ```` ```python ```` 으로 감싸면 색이 입혀집니다.

## 첫 화면 고치기

| 바꿀 것 | 파일 |
|---|---|
| 소개 문구, 대표 그림, 프로필 항목, 이메일 | `_data/profile.yml` |
| 프로젝트 목록 | `_data/projects.yml` |
| 사이트 제목, 한 줄 설명 | `_config.yml` |
| 색, 글꼴 | `assets/css/style.css` 맨 위 `:root` |
| 화면 구조 | `_layouts/home.html`, `_layouts/post.html`, `_layouts/default.html` |

## 배포 확인과 되돌리기

- 커밋 후 저장소의 **Actions** 탭에서 빌드 결과를 볼 수 있습니다. 실패하면 이전 화면이 그대로 유지됩니다.
- 빌드 중에 깨진 내부 링크와 없는 이미지를 검사합니다. 실패 로그에 문제가 된 파일이 나옵니다.
- 잘못 올린 변경은 커밋 기록에서 해당 커밋을 **Revert** 하면 되돌아갑니다.
