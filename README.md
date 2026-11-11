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

## 차트 넣기

실험 결과를 이미지 대신 데이터로 올리면 사이트 색과 글꼴에 맞춰 차트를 그립니다. 마우스를 올리면 그 지점의 값이 보입니다.

1. 데이터를 JSON 파일로 저장해 `assets/data/`에 올립니다.

   ```json
   {
     "title": "CartPole-v1",
     "xlabel": "Environment steps",
     "ylabel": "IQM evaluation return (95% CI)",
     "threshold": 475,
     "ymin": 0,
     "ymax": 500,
     "series": [
       { "name": "Base (n=10)", "x": [0, 5000, 10000], "y": [9.4, 9.6, 22.1], "lower": [9.1, 9.2, 15.0], "upper": [9.8, 10.3, 40.2] },
       { "name": "AdvNormalize (n=10)", "x": [0, 5000, 10000], "y": [9.3, 9.9, 30.5], "lower": [9.0, 9.4, 18.7], "upper": [9.7, 11.0, 52.8] }
     ]
   }
   ```

   - `series`의 `name`, `x`, `y`만 필수입니다. `x`와 `y`는 길이가 같아야 합니다.
   - `lower`, `upper`를 넣으면 신뢰구간 띠를 그립니다.
   - `threshold`는 점선 기준선, `ymin`·`ymax`는 세로축 범위입니다. 빼면 자동으로 정합니다.
   - 선은 최대 5개까지 색이 구분됩니다.

2. 글에서 차트를 넣을 자리에 아래 한 줄을 씁니다.

   ```liquid
   {% include chart.html src="/assets/data/a2c-advnorm.json" caption="A2C · advantage normalization 비교" %}
   ```

첫 화면의 대표 그림을 차트로 바꾸려면 `_data/profile.yml`의 `featured` 아래에 `chart: /assets/data/파일.json`을 넣습니다.

파이썬에서는 `json.dump({...}, open("파일.json", "w"))`로 위 형식의 딕셔너리를 저장하면 됩니다. numpy 배열은 `.tolist()`로 바꿔서 넣으세요.

## 첫 화면 고치기

| 바꿀 것 | 파일 |
|---|---|
| 소개 문구, 대표 그림, 프로필 항목, 이메일 | `_data/profile.yml` |
| 프로젝트 목록 | `_data/projects.yml` |
| 사이트 제목, 한 줄 설명 | `_config.yml` |
| 색, 글꼴, 차트 선 색 | `assets/css/style.css` 맨 위 `:root` |
| 화면 구조 | `_layouts/home.html`, `_layouts/post.html`, `_layouts/default.html` |

## 배포 확인과 되돌리기

- 커밋 후 저장소의 **Actions** 탭에서 빌드 결과를 볼 수 있습니다. 실패하면 이전 화면이 그대로 유지됩니다.
- 빌드 중에 깨진 내부 링크와 없는 이미지를 검사합니다. 실패 로그에 문제가 된 파일이 나옵니다.
- 잘못 올린 변경은 커밋 기록에서 해당 커밋을 **Revert** 하면 되돌아갑니다.
