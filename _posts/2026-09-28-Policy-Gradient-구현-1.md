---
title: "Policy Gradient 구현 1"
date: 2026-09-28 14:00:00 +0900
categories: [Reinforcement Learning]
tags: [reinforcement-learning, implementing]
math: true
---

전체 코드는 저의 [깃허브](https://github.com/jihoAi/RL_study)에서 보실 수 있습니다.

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
3. action의 log probability 수집
4. 위 식을 참고하여 신경망의 loss 계산

### 3.1 Trajectory 수집

trajectory를 수집하는 일은 Policy로부터 action을 골라서 환경에서 수행하면서 계산되는 action의 log 확률과 reward를 수집하였습니다.

```python
reward_list = []
log_prob_list = []
#생략
  while not (terminated or truncated):
      obs = torch.tensor(obs, dtype=torch.float32, device=self.device)
      logits = self.model(obs)
      dist = torch.distributions.Categorical(logits=logits)
      action = dist.sample()
      log_prob = dist.log_prob(action)
      obs, reward, terminated, truncated, _ = self.env.step(action.item())

      reward_list.append(reward)
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

처음에는 $$G_t$$를 계산할때 $$t$$ 시점 이후의 reward list를 순회하며 구현하였기 때문에 $$O(n^2)$$의 시간복잡도를 갖는
코드로 구현하였습니다. 이후 $$G_t = r_t + \gamma G_{t+1}$$라는 재귀적 관계를 이용하여 뒤에서부터 Return을 계산하는 코드로 바꿔
$$O(n)$$의 시간복잡도를 갖는 코드로 개선할 수 있었습니다.

### 3.3 Policy Loss 계산

원래 Policy Gradient 방식은 Gradient Ascent 방식으로 파라미터를 업데이트 합니다.
그러나 Pytorch의 일반적인 optimizer는 loss를 최소화는 방향으로 파라미터를 업데이트 하기 때문에
목적함수에 -1을 곱하여 loss로 사용하였습니다.

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
코드에서는 episode가 끝난 뒤에 그 에피소드의 Return을 계산하고 수집한 log probability를 사용하여 loss를 계산하고 gradient를 계산합니다.
그리고 Policy 네트워크에 역전파합니다.

## 4. 결과

CartPole 환경에서 5000개의 에피소드를 이용해서 Policy를 학습시켰습니다.
그리고 학습률을 0.001 그리고 0.005 두 가지를 사용하여서 학습률에 따른 학습 양상을 비교해보겠습니다.

![학습률 0.001](/assets/img/RewardTrend(lr001).png)

위의 그래프는 각 에피소드에서 받은 리워드를 할인하지 않고 모두 더한 값을 5개씩 묶어 이동평균을 이용해서 나타낸 것입니다.
학습률이 0.001일 때는 에피소드별로 편차가 심하긴하지만 전반적으로 받는 리워드가 점점 상승하는 것을 알 수 있었습니다.

![에이전트시각화(0.001)](/assets/gif/cartpole_agent1(lr001).gif)

![학습률 0.005](/assets/img/RewardTrend(lr005).png)

그러나 학습률이 0.005일 때는 최대 리워드를 빨리 달성하였지만 이후 큰 변동이 나타났고 학습률 0.001의 경우보다
높은 리워드를 안정적으로 유지하지 못하였습니다.

이는 학습률이 너무 클 때 파라미터의 변화가 커서 학습이 불안정해질 수 있음을 보여줍니다.

![에이전트시각화(0.005)](/assets/gif/cartpole_agent1(lr005).gif)

## 5. 개선점

위에서 Policy Gradient를 설명한 수식에서는 여러 Trajectory를 수집한 후 각 Trajectory에서 계산한 gradient의 평균을 사용하고 있습니다.

그러나 제가 구현한 코드에서는 한 번에 하나의 Trajectory만 사용하여 Policy Network를 업데이트하고 있으며, loss를 계산할 때도 평균이 아닌 합을 사용하고 있습니다. 
따라서 Trajectory의 길이에 따라 gradient의 크기가 달라질 수 있고, 학습 과정의 안정성에도 영향을 줄 수 있습니다.

따라서 Rollout Buffer를 추가하여 한 번에 8개의 에피소드를 실행하고 해당 에피소드에서 나오는 log probability와 reward를 사용하여 정책을 학습시켰습니다.

```python
def update(self):
  total_loss = 0

  total_transitions = 0
  for i in range(self.env.num_envs):
    rewards = self.buffer.rewards[i]

    log_probs = self.buffer.log_probs[i]

    returns = self.get_return(rewards)
    returns = torch.tensor(returns,dtype=torch.float32,device=self.device)
    log_probs = torch.stack(log_probs)

    loss = -torch.sum(log_probs * returns)
    total_loss += loss
    total_transitions += len(rewards)

  total_loss /= total_transitions

  self.optimizer.zero_grad()
  total_loss.backward()
  self.optimizer.step()

  self.buffer.clear()
```

### 5.1 개선결과

학습률 0.,001 0.003, 0.005로 학습을 3번 진행하였습니다. 그 결과 0.003이 가장 잘 학습되는 학습률로 결정하였고

참고로 학습률이 0.001일 때는 리워드가 점점 개선되기는 하였지만 학습이 너무 느렸고 0.005일 때는 학습은 빨랐지만
파라미터 변화가 커서 학습이 불안정하였습니다.

결과는 아래와 같습니다.

![개선 학습률 0.003](/assets/img/imroved(0.003).png

![에이전트시각화](/assets/img/agent_improved.gif)
