---
title: "TD0 & Actor Critic"
date: 2026-10-04 13:00:00 +0900
categories: [Reinforcement Learning]
tags: [reinforcement-learning, theory, implementing]
math: true
---

## MC, TD

해당 내용은 [David Silver의 자료](https://davidstarsilver.wordpress.com/wp-content/uploads/2025/04/lecture-4-model-free-prediction-.pdf)를 바탕으로 만들었습니다.

### Monte Carlo Reinforcement Learning

몬테 카를로 방식(MC)은 환경의 transition이나 reward에 관한 지식이 필요없는 model-free 방식으로 value = mean return 이라는 아이디어에 기반을 두고 있습니다.
MC는 return을 계산해야하기 때문에 episode가 반드시 종료되는 경우에만 사용할 수 있습니다. 이전 포스팅에서 구현한 방식은 모두 MC를 기반으로 하였습니다.

### Temporal Difference

Temporal Difference(TD)는 model-free방식으로 Return을 사용하는 MC와는 다르게 추정치를 사용합니다.
이런 방식을 bootstrapping이라고 부르고 같은 종류의 추정값에 대해서 업데이트를 할 때, 한 개 혹은 그 이상의 추정값을 사용하는 것을 의미합니다.

예를 들어서 만약 어떤 정책 하에서의 가치함수를 계산하고 싶다면 MC는 

$$V(s_t) \leftarrow V(s_t) + \alpha(G_t-V(s_t)$$

를 사용하지만

간단한 TD알고리즘인 TD(0)를 사용하면 

$$V(s_t) \leftarrow V(s_t) + \alpha(R_{t+1}+\gamma V(s_{t+1})-V(s_t)$$ 

라는 식으로 가치함수를 계산할 수 있습니다.

$$R_{t+1}+\gamma V(s_{t+1})$$ 는 TD target
$$\delta_t = R_{t+1}+\gamma V(s_{t+1})-V(s_t)$$는 TD error 라고 부릅니다.

### MC vs TD

Return $$G_t$$는 unbiased estimate of $$V_\pi(S_t)$$, TD target은 biased estimate of $$V_\pi(S_t)$$
그리고 Return은 많은 무작위 액션, 리워드, transition에 의존하기 때문에 variance가 높습니다.
하지만 TD traget은 딱 하나의 액션, 리워드, transition에 의존하기 때문에 variance가 낮습니다.

## TD(λ)

### n-step Return

위에서는 살펴본 TD target은 바로 다음 스텝의 가치를 예측했습니다. 그러나 여러 스텝 후의 가치를 예측하는 것도 가능할 것 입니다.
이를 위해 n-step Return을 살펴보겠습니다.

$$
\begin{aligned}
&G_{t}^{(1)} = R_{t+1} + \gamma V(S_{t+1}\\
&G_{t}^{(2)} = R_{t+1} + \gamma R_{t+2} + \gamma^2 V(S_{t+1})\\
&\vdots \\
&G_{t}^{(\infty)}= R_{t+1} + \gamma R_{t+2} + \cdots + \gamma^{T-1} R_T\\
&\therefore G_t^{(n)} = R_{t+1} + \gamma R_{t+2} + \cdots + \gamma^{n-1} V(S_{t+n})\\
\end{aligned}
$$

첫 번째 식은 TD(0)와 세 번째 식은 MC방식과 같은 것을 알 수 있습니다.

n step TD learning은 다음과 같습니다.

$$V(s_t) \leftarrow V(S_t) + \alpha(G_t^{(n)}-V(S_t))$$

### λ Return

위에서 공부한 n-step Return을 적절히 섞을 수는 없을까? 라는 생각을 바탕으로 λ Return이 나왔습니다.
n-step return을 $$(1-\lambda)\lambda^{n-1}$$로 weighting 합니다.

$$G_t^\lambda = (l-\lambda)\sum\limits_{n=1}^{\infty}{\lambda^{n-1}G_t^{(n)}}$$

### Forward-view TD(λ)

$$V(S_t) \leftarrow V(S_t) + \alpha(G_t^\lambda - V(S_t))$$

MC와 같이 에피소드가 끝나야 계산할 수 있습니다.
Forward view는 에이전트에게 미래에 관한 이론을 제공해줍니다.


### Backward-vew TD(λ)

#### Eligibility Traces

credit assignment problem : 🔔 🔔 🔔 💡 -> ⚡
종이 세 번 울리고 불이 켜졌습니다. 그리고 전기충격이 일어났으면 종이 원인일 수도 있고 불이 원인일 수도 있습니다.
Frequency heuristic: 더 자주 나온 상태에 더 큰 책임을 부여합니다. (종이 원인이다)
Recency euristic: 최근에 나온 상태에 더 큰 책임을 부여합니다. (불이 켜진게 원인이다)

$$
\begin{aligned}
&E_0(s) = 0\\
&E_t(s) = \gamma\lambda E_{t-1}(s) +1 (S_t = s)\\
\end{aligned}
$$

***

Backward-view TD(λ)는 모든 상태에 대해서 V(s)를 업데이트하고 eligibility trace를 시행합니다.

$$
\begin{aligned}
&\delta_t = R_{t+1}+\gamma V(S_{t+1}) - V(S_t)\\
&V(s) \leftarrow V(s) + \alpha\delta_t E_t(s)\\
\end{aligned}
$$

λ=0 이라면 TD(0)와 같습니다.
