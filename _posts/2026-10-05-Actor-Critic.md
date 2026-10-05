---
title: "Actor Critic"
date: 2026-10-05 16:00:00 +0900
categories: [Reinforcement Learning]
tags: [reinforcement-learning, theory, implementing]
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

## 구현

[코드는 여기서](https://github.com)확인할 수 있습니다.

이번에는 코딩하면서 학습이 잘 되지 않아서 어려움을 겪었습니다. 학습이 잘 되지 않았던 이유는 Value 신경망이 처음에는 부정확한데 신경망 업데이트를 빠르게 하지 않다보니
학습이 잘 되지 않았던 것 같았습니다. 5000개의 transition이 모였을 때 value, policy network를 업데이트 했는데 cartpole 환경을 썼을 때 학습 초기에 에이전트가 
진행하는 episode의 길이는 대략 15-20개 정도였습니다. 따라서 대략 250~350개 정도의 에피소드가 모였을 때 업데이트를 하는 것이었는데 32개의 transition마다 업데이트
하는 것으로 바꾸자 학습 양상이 상당히 개선되었습니다.

![학습결과그래프](/assets/img/TD0ActorCritic.png)

![Cartpole시각화](assets/gif/TD0ActorCritic.gif)
