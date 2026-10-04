---
title: "TD0 & Actor Critic"
date: 2026-10-04 13:00:00 +0900
categories: [Reinforcement Learning]
tags: [reinforcement-learning, theory, implementing]
math: true
mermaid: true
---

## MC, TD

해당 내용은 [David Silver의 자료](https://davidstarsilver.wordpress.com/wp-content/uploads/2025/04/lecture-4-model-free-prediction-.pdf)를 바탕으로 만들었습니다.

### Monte Carlo Reinforcement Learning

몬테 카를로 방식(MC)은 환경의 transition이나 reward에 관한 지식이 필요없는 model-free 방식으로 value = mean return 이라는 아이디어에 기반을 두고 있습니다.
MC는 return을 계산해야하기 때문에 episode가 반드시 종료되는 경우에만 사용할 수 있습니다. 이전 포스팅에서 구현한 방식은 모두 MC를 기반으로 하였습니다.

### Temporal Difference

Temporal Difference(TD)는 model-free방식으로 Return을 사용하는 MC와는 다르게 추정치를 사용합니다.
이런 방식을 bootstrapping이라고 부르고 같은 종류의 추정값에 대해서 업데이트를 할 때, 한 개 혹은 그 이상의 추정값을 사용하는 것을 의미합니다.

예를 들어서 만약 어떤 정책 하에서의 가치함수를 계산하고 싶다면 MC는 $$V(s_t) \leftarrow V(s_t) + \alpha(G_t-V(s_t)$$를 사용하지만

간단한 TD알고리즘인 TD(0)를 사용하면 $$V(s_t) \leftarrow V(s_t) + \alpha(R_{t+1}+\gamma V(s_{t+1})-V(s_t)$$ 라는 식으로 가치함수를 계산할 수 있습니다.

$$R_{t+1}+\gamma V(s_{t+1})$$ 는 TD target
$$\delta_t = R_{t+1}+\gamma V(s_{t+1})-V(s_t)$$는 TD error 라고 부릅니다.

### MC vs TD

Return $$G_t$$는 unbiased estimate of $$V_\pi(S_t)$$, TD target은 biased estimate of $$V_\pi(S_t)$$
그리고 Return은 많은 무작위 액션, 리워드, transition에 의존하기 때문에 variance가 높습니다.
하지만 TD traget은 딱 하나의 액션, 리워드, transition에 의존하기 때문에 variance가 낮습니다.
