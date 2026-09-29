---
title: "Policy Gradient 구현 1"
date: 2026-09-28 14:00:00 +0900
categories: [Reinforcement Learning]
tags: [reinforcement-learning, implementing]
math: true
---

전체 코드는 저의 [깃허브](https://github.com)에서 보실 수 있습니다.

## 1. 실험 환경

### 1.1 CartPole

학습에 사용한 환경은 gymnasium에 미리 만들어져 있는
[CartPole-v1](https://gymnasium.farama.org/environments/classic_control/cart_pole/)을 사용했습니다.

CartPole을 사용한 이유는 비교적 간단한 환경이기 때문에 기초적인 Policy Gradient 알고리즘으로도 에이전트를 학습시킬 수 있다고 생각했기 때문입니다.
또한 현재 사용할 수 있는 컴퓨팅 자원이 한정적이기 때문에 선택하게 되었습니다.

CartPole-v1의 observation, action space는 다음과 같습니다.

| Action space | Observation space |
|---|---|
| `Discrete(2)` | `Box([-4.8 -inf -0.41887903 -inf], [4.8 inf 0.41887903 inf], (4,), float32)` |

## 2. 모델 구축

### 2.1 Policy Network

```python
print("Hello World")
```
