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


## 2. Policy Network

```python
class PNetwork(nn.Module):
  def __init__(self):
    super().__init__()
    self.fc1 = nn.Linear(4,8)
    self.fc2 = nn.Linear(8,4)
    self.fc3 = nn.Linear(4,2)

  def forward(self,a):
    a = self.fc1(a)
    a = torch.relu(a)
    a = self.fc2(a)
    a = torch.relu(a)
    a = self.fc3(a)
    return a
```

CartPole 자체가 비교적 간단한 문제이기 때문에 3개의 레이어를 사용하였고 활성화 함수로 ReLU를 사용하였습니다.
Observation space 4개, action space가 2개이기 때문에 입력층의 노드 개수는 4개 출력층은 2개로 하였습니다.

## 3. Policy Gradient

$$
\hat{g} = \frac{1}{|\mathcal{D}|} \sum_{\tau \in \mathcal{D}} \sum_{t=0}^{T} \nabla_{\theta} \log \pi_{\theta}(a_t |s_t) R(\tau),
$$

그래디언트를 추정하기 위해서 trajectory의 Return과 정책 네트워크의 로그 확률의 그래디언트가 필요하다는 것을 알 수 있습니다.
따라서 알고리즘에서 구현할 것은 아래와 같습니다.
1. trajectory 수집
2. trajectory의 Return 계산
3. action의 log probablity 수집
4. 위 식을 참고하여 신경망의 loss 계산

### 3.1 Trajectory 수집

trajectory를 수집하는 일은 Policy로부터 action을 골라서 환경에서 수행하면서 계산되는 action의 log 확률과 reward를 수집하였습니다.
observation, action 등은 코드에서는 수집하긴 했지만 gradient를 계산하는데 직접적으로 사용되지는 않았습니다.

```python
state_list = []
reward_list = []
action_list = []
log_prob_list = []
#생략
  while not (terminated or truncated):
      state_list.append(obs)
      obs = torch.tensor(obs, dtype=torch.float32, device=self.device)
      logits = self.model(obs)
      dist = torch.distributions.Categorical(logits=logits)
      action = dist.sample()
      log_prob = dist.log_prob(action)
      obs, reward, terminated, truncated, _ = self.env.step(action.item())

      reward_list.append(reward)
      action_list.append(action)
      log_prob_list.append(log_prob)
```
### 3.2 Return 계산

```python
def get_return(self, rewards):
  G = [0] * len(rewards)
  return_ = 0

  for i in reversed(range(len(rewards))):
    return_ = rewards[i] + self.gamma * return_
    G[i] = return_

  return G
```

$$
G_t = r_t + \gamma r_{t+1} + \gamma^2 r_{t+2} + \cdots
$$

라는 식을 그대로 이용하여서 return을 계산하여서 $$O(n^2)$$의 시간복잡도를 가진 코드를 만들었습니다. 하지만

$$
G_t = r_t + \gamma G_{t+1}
$$
이라는 식으로 Return을 재귀적으로 표현할 수 있다는 것을 알고 현재의 코드로 수정하여 $$O(n)$$의 시간복잡도를 갖도록 개선하였습니다.

### 3.3 Policy Loss 계산

원래 Policy Gradient 방식은 Gradient Ascent 방식으로 파라미터를 업데이트 합니다.
그러나 Pytorc의 일반적인 옵티마이저들은 loss를 최소화는 방식으로 설계되어있기 때문에
목적함수에 -1을 곱하여 사용하였습니다.

```python
G = self.get_return(reward_list)

loss = 0

G_tensor = torch.tensor(G, dtype=torch.float32,device=self.device)
log_prob_tensor = torch.stack(log_prob_list)

loss = -torch.sum(log_prob_tensor*G_tensor)

self.optimizer.zero_grad()
loss.backward()
self.optimizer.step()
```
코드에서는 episode가 끝난 뒤에 그 에피소드의 Return을 계산하고 수집한 log probablity를 사용하여 loss를 계산하고 gradient를 계산합니다.
그리고 Policy 네트워크에 역전파합니다.
