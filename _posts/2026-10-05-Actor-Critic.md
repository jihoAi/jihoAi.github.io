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

Actor Critic은 말 그대로 Actor와 Critic으로 이루어져 있습니다.

Critic은 action-value function(또는 value function) 파라미터를 업데이트합니다.

Actor는 Critic이 제안하는 방향으로 파라미터를 업데이트합니다.

이제까지 공부한 순서로 보면 Policy Gradient with Baseline과 TD(0) 방식을 합치면
자연스럽게 Actor-Critic 알고리즘이 나오는 것 같습니다.

Actor의 목적함수는 다음과 같이 정의합니다.

$$
\nabla_\theta J(\pi_\theta)=\underset{\tau\sim\pi_\theta}{\mathbb{E}}\left[\sum\limits_{t=0}^{T}{\nabla_\theta 
\log\pi_\theta(a_t|s_t)}\delta_t\right].
$$

$$\delta_t$$는 TD error이고 Advantage의 추정값이 됩니다.

$$\delta_t = r_t + \gamma V_\phi(s_{t+1}) - V_\phi(s_t)$$

Critic의 목적함수는 $$r_t+\gamma V_\phi(s_{t+1})$$(TD target)과 $$V(s_t)$$의 MSE로 정의합니다.

## 구현

[코드는 여기서](https://github.com/jihoAi/RL_study/blob/main/TD0ActorCritic.ipynb) 확인할 수 있습니다.

이번에는 코딩하면서 학습이 잘 되지 않아서 어려움을 겪었습니다. 

초기 CartPole 환경에서 episode 길이가 약 15-20 step이었습니다. 그리고 5000개의 transition을 수집해 Actor와 Critic을 업데이트하였습니다. 따라서 대략 250-350개 정도의 episode가 진행된 이후에 신경망들이 업데이트되었기 때문에 개선속도가 느렸습니다. 그래서 업데이트 주기를 32개의 transition으로 줄였고 이후 학습 성능이 개선되는 것을 관찰하였습니다.

![학습결과그래프](/assets/img/TD0ActorCritic.png)

![Cartpole시각화](/assets/gif/TD0ActorCritic.gif)
