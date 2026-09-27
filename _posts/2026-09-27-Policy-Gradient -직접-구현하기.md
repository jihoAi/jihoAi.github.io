---
title: "Policy Gradient 직접 구현하기"
date: 2026-09-27 18:30:00 +0900
categories: [Reinforcement Learning]
tags: [reinforcement-learning, policy-gradient, pytorch]
---

## 1. 들어가며
최근 피지컬 AI 분야에 흥미가 생겨서 개인적으로 공부를 이어오고 있었습니다
여러 논문을 읽던 와중 강화학습에 대한 공부가 부족했음을 느꼈고 기초부터
다시 공부하로 결정하였습니다.

공부한 자료는 Open AI의 [Spinning up in deep rl](https://spinningup.openai.com/en/latest/)를 주로 참고하였습니다.

이번 포스팅은 Policy Gradient을 pytorch와 gym을 이용하여 구현하였습니다.

## 2. Policy Gradient
Policy Gradient는 누적 보상의 합을 최대화하는 정책의 파라미터 θ를 찾는 것을 목적으로 한다. 수식으로는 다음과 같다
$$
J(\pi_\theta)=\mathop{\mathbb{E}}_{\tau\sim\theta}[R_t]
$$
즉 J를 최대화 하는 것이 Policy Gradient의 목적이 된다.
