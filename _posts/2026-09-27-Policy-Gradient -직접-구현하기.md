---
title: "Policy Gradient 직접 구현하기"
date: 2026-09-27 18:30:00 +0900
categories: [Reinforcement Learning]
tags: [reinforcement-learning, implementing]
math: true
---

## 1. 들어가며
최근 피지컬 AI 분야에 흥미가 생겨서 개인적으로 공부를 이어오고 있었습니다
여러 논문을 읽던 와중 강화학습에 대한 공부가 부족했음을 느꼈고 기초부터
다시 공부하로 결정하였습니다.

공부한 자료는 Open AI의 [Spinning up in deep rl](https://spinningup.openai.com/en/latest/)를 주로 참고하였습니다.

이번 포스팅은 Policy Gradient을 pytorch와 gym을 이용하여 구현하였습니다.

## 2. Policy Gradient
Policy Gradient는 누적 보상의 합을 최대화하는 정책의 파라미터 θ를 찾는 것을 목적으로 한다.

$$
J(\pi_\theta)=\mathop{\mathbb{E}}_{\tau\sim\theta}[R_t]
$$

gradient ascent를 이용하여 policy를 업데이트한다.

$$
theta_{k+1}=\theta_k+\alpha \nabla_\theta J(\pi_\theta)|_{\theta_k}
$$

$$\nabla_theta J(\pi_\theta)$$는 정책의 gradient로 위와 같은 방식으로 정책을 최적화는 것을
policy gradient algorithm 이라고 부른다. policy gradient algorithm의 대표적인 예시로
Vanilla Policy Gradient, TRPO, PPO 등이 있습니다. 수식은 다음과 같습니다.

$$
\begin{aligned}
\nabla_\theta J(\pi_\theta)
&= \nabla_\theta \mathbb{E}_{\tau \sim \pi_\theta}[R(\tau)] \\
&= \nabla_\theta \int_{\tau} P(\tau \mid \theta) R(\tau) \\
&= \int_{\tau} \nabla_\theta P(\tau \mid \theta) R(\tau) \\
&= \int_{\tau} P(\tau \mid \theta)
   \nabla_\theta \log P(\tau \mid \theta) R(\tau) \\
&= \mathbb{E}_{\tau \sim \pi_\theta}
   \left[
   \nabla_\theta \log P(\tau \mid \theta) R(\tau)
   \right]
\end{aligned}
$$

$$
\therefore\quad
\nabla_\theta J(\pi_\theta)
=
\mathbb{E}_{\tau \sim \pi_\theta}
\left[
\sum_{t=0}^{T}
\nabla_\theta \log \pi_\theta(a_t \mid s_t) R(\tau)
\right]
$$

$$R$$은 return, $$\tau$$는 trajectory입니다.
식을 살펴보면 gradient는 기댓값이기 때문에 정확한 값을 몰라도
$$\tau$$를 policy로부터 샘플링하면서 추정할 수 있습니다.

$$
\hat{g} = \frac{1}{|\mathcal{D}|} \sum_{\tau \in \mathcal{D}} \sum_{t=0}^{T} \nabla_{\theta} \log \pi_{\theta}(a_t |s_t) R(\tau),
$$
