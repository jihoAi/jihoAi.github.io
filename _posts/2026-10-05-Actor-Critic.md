---
title: "Actor Critic"
date: 2026-10-05 16:00:00 +0900
categories: [Reinforcement Learning]
tags: [reinforcement-learning, theory]
math: true
---

## Actor Critic

이번 포스팅도 [David Silver의 자료](https://davidstarsilver.wordpress.com/wp-content/uploads/2025/04/lecture-7-policy-gradient-methods.pdf)를 바탕으로 제작하였습니다.

Monte Carlo policy gradient는 높은 variance를 가지고 있습니다. variance를 줄이기 위해서 
Actor-Critic 알고리즘을 도입합니다.

Actor Critic은 말 그대로 Actor와 Critic으로 이루어져있습니다.

Critic은 action-value function(또는 value function) 파라미터를 업데이트합니다.

Actor는 Critic이 제안하는 방향으로 파라미터를 업데이트합니다.

이제까지 공부한 순서로 보면 Policy Gradient with Baseline과 TD(0) 방식을 합치면
자연스럽게 Actor-Critic 알고리즘이 나오는 것 같습니다.

Actor의 목적함수는 다음과 같이 정의합니다.

$$
\nabla_\theta J(\pi_\theta)=\underset{\tau\sim\pi_\theta}{\mathbb{E}}\sum\limits_{t=0}^{T}{\nabla_\theta 
\log\pi_\theta(a_t|s_t)}\delta_t.
$$

$$\delta_t$$는 td error입니다.

Critic은 td target과 $$V(s_t)$$의 MSE로 정의합니다
