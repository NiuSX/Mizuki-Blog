---
title: "SVM学习笔记：从几何直觉到核函数与实战"
date: 2026-06-21
categories:
  - AI
tags:
  - 机器学习
  - SVM
  - 分类算法
  - 核方法
excerpt: "系统梳理支持向量机 SVM 的几何直觉、最大间隔思想、硬间隔与软间隔优化、拉格朗日对偶、核函数、多分类策略、参数调优、工程实战与常见面试问题。"
---

# SVM 学习笔记：从几何直觉到核函数与实战

## 1. SVM 是什么

SVM，全称 Support Vector Machine，中文通常翻译为支持向量机。它是一类经典的监督学习算法，既可以用于分类，也可以用于回归，还可以扩展到异常检测等任务。日常学习机器学习时，SVM 常常被放在逻辑回归、决策树、朴素贝叶斯、KNN 之后学习，因为它把线性代数、凸优化、几何直觉和泛化能力这些概念结合得比较紧密。

如果只用一句话概括 SVM：

> SVM 要找一个分类边界，使得不同类别的样本不仅被分开，而且离分类边界尽可能远。

这句话里有两个重点：

1. 分类边界要能分开样本。
2. 分类边界要尽量“稳”，也就是最大化间隔。

很多分类算法都会学习一个决策边界。例如逻辑回归学习的是一个线性决策边界，神经网络可以学习非常复杂的非线性边界，决策树用一系列规则切分空间。SVM 的特别之处在于：它不是仅仅追求训练集上分类正确，而是追求一个具有最大几何间隔的边界。

这种思想非常朴素。假设二维平面上有两类点，一类是圆点，一类是叉号。可以画很多条直线把它们分开，但有些直线离样本点非常近，只要新样本稍微扰动一下就可能分错；而另一条直线位于两类点的中间，离两边最近的点都比较远，看起来更“安全”。SVM 选择后者。

SVM 的核心关键词包括：

- 超平面：分类边界，在二维空间中是直线，在三维空间中是平面，在更高维空间中称为超平面。
- 间隔：样本点到分类边界的距离，SVM 追求最大间隔。
- 支持向量：距离分类边界最近、真正决定边界位置的训练样本。
- 软间隔：允许少量样本违反间隔甚至被分错，用来处理噪声和不可完全线性可分的数据。
- 核函数：在不显式计算高维映射的情况下，让线性 SVM 获得非线性分类能力。

## 2. SVM 适合解决什么问题

SVM 最经典的应用场景是中小规模数据集上的分类任务，尤其是特征维度较高、样本数量不是特别大的问题。早期机器学习实践中，SVM 在文本分类、图像识别、生物信息学、手写数字识别等任务上表现非常强。

典型适用场景：

- 二分类任务，例如垃圾邮件识别、疾病阳性/阴性判断、用户是否流失。
- 高维稀疏特征，例如文本 TF-IDF 特征。
- 样本数量中等，但特征表达比较明确的问题。
- 数据边界较清晰，或者通过核函数可以变得清晰的问题。
- 对泛化能力要求高，不希望模型过度依赖全部样本的问题。

不太适合的场景：

- 超大规模数据集，尤其是样本量达到百万级以上且使用非线性核时。
- 需要天然概率输出的任务。SVM 输出的是间隔分数，不是概率，概率需要额外校准。
- 数据噪声极大、类别高度重叠时，SVM 的边界可能很难解释。
- 对模型可解释性要求极强的业务场景。线性 SVM 还能解释权重，非线性核 SVM 解释性较弱。
- 特征工程很差、原始数据复杂且需要端到端表示学习的场景，这类任务现在更多使用深度学习。

从现代视角看，SVM 不再是所有分类任务的默认首选，但它仍然是理解机器学习理论的一块重要基石。最大间隔、正则化、对偶问题、核技巧等概念，在很多模型中都反复出现。

## 3. 基础符号约定

为了后面推导清晰，先统一符号。

训练集记为：

```text
D = {(x_1, y_1), (x_2, y_2), ..., (x_m, y_m)}
```

其中：

- `m` 表示样本数量。
- `x_i` 是第 `i` 个样本的特征向量。
- `y_i` 是第 `i` 个样本的标签。
- SVM 二分类通常使用 `y_i in {-1, +1}`，而不是 `{0, 1}`。

线性分类器的决策函数写作：

```text
f(x) = w^T x + b
```

其中：

- `w` 是权重向量，决定超平面的方向。
- `b` 是偏置项，决定超平面的位置。
- `w^T x + b = 0` 是分类超平面。

分类规则为：

```text
预测类别 = sign(w^T x + b)
```

也就是：

- 如果 `w^T x + b > 0`，预测为 `+1`。
- 如果 `w^T x + b < 0`，预测为 `-1`。
- 如果 `w^T x + b = 0`，样本刚好落在分类边界上。

## 4. 超平面的几何意义

在线性代数中，超平面可以表示为：

```text
w^T x + b = 0
```

在二维中，`x = (x_1, x_2)`，超平面就是一条直线：

```text
w_1 x_1 + w_2 x_2 + b = 0
```

在三维中，`x = (x_1, x_2, x_3)`，超平面就是一个平面：

```text
w_1 x_1 + w_2 x_2 + w_3 x_3 + b = 0
```

在更高维空间中，我们无法直接画出来，但数学形式完全一样。

权重向量 `w` 有一个非常重要的几何意义：它是超平面的法向量。也就是说，`w` 垂直于超平面。

为什么 `w` 垂直于超平面？假设有两个点 `x_a` 和 `x_b` 都在超平面上，那么：

```text
w^T x_a + b = 0
w^T x_b + b = 0
```

两式相减：

```text
w^T (x_a - x_b) = 0
```

`x_a - x_b` 是超平面内的一条方向向量。它和 `w` 的内积为 0，说明它们垂直。因此 `w` 垂直于超平面。

这个结论后面非常重要，因为点到超平面的距离公式会用到 `||w||`。

## 5. 点到超平面的距离

对于任意点 `x`，它到超平面 `w^T x + b = 0` 的距离为：

```text
distance(x, H) = |w^T x + b| / ||w||
```

如果带上样本标签 `y_i in {-1, +1}`，并且样本被正确分类，那么：

```text
y_i (w^T x_i + b) > 0
```

因为：

- 正类样本 `y_i = +1`，正确分类要求 `w^T x_i + b > 0`。
- 负类样本 `y_i = -1`，正确分类要求 `w^T x_i + b < 0`。
- 二者合并就是 `y_i (w^T x_i + b) > 0`。

于是可以把带符号的函数间隔定义为：

```text
gamma_hat_i = y_i (w^T x_i + b)
```

几何间隔定义为：

```text
gamma_i = y_i (w^T x_i + b) / ||w||
```

函数间隔和几何间隔的区别在于是否除以 `||w||`。

这个区别很关键。因为如果把 `w` 和 `b` 同时乘以一个正数 `c`，分类边界并不会变：

```text
w^T x + b = 0
```

变成：

```text
(cw)^T x + cb = 0
```

两者是同一个超平面。但函数间隔会被放大 `c` 倍，而几何间隔不会变。所以真正有几何意义的是几何间隔，而不是函数间隔。

## 6. 最大间隔思想

SVM 的目标是找到一个超平面，使所有样本中最小的几何间隔最大。

形式化写为：

```text
max_{w,b} gamma
s.t. y_i (w^T x_i + b) / ||w|| >= gamma, i = 1,2,...,m
```

这表示每个样本到超平面的几何间隔都至少为 `gamma`，然后让 `gamma` 尽可能大。

直接优化这个式子不方便。由于超平面不随 `w` 和 `b` 的同比例缩放改变，可以固定函数间隔的最小值为 1：

```text
y_i (w^T x_i + b) >= 1
```

此时几何间隔为：

```text
gamma = 1 / ||w||
```

最大化 `1 / ||w||` 等价于最小化 `||w||`，通常为了计算方便，写成最小化：

```text
1/2 ||w||^2
```

于是硬间隔 SVM 的优化问题变成：

```text
min_{w,b} 1/2 ||w||^2
s.t. y_i (w^T x_i + b) >= 1, i = 1,2,...,m
```

这就是 SVM 最经典的原始问题。

直观解释：

- `1/2 ||w||^2` 越小，间隔越大。
- 约束条件保证每个训练样本都被正确分类，并且至少在间隔边界之外。
- 距离超平面最近且满足等号的点，就是支持向量。

## 7. 支持向量是什么

支持向量是那些位于间隔边界上的样本点。对于硬间隔 SVM，它们满足：

```text
y_i (w^T x_i + b) = 1
```

分类超平面是：

```text
w^T x + b = 0
```

两侧的间隔边界是：

```text
w^T x + b = 1
w^T x + b = -1
```

支持向量就是落在这两条间隔边界上的样本点。

为什么叫“支持”向量？因为它们支撑、决定了最优分类超平面。移动非支持向量，只要它们不越过间隔边界，分类超平面通常不会改变；但移动支持向量，边界可能立刻发生变化。

这是 SVM 的一个重要特性：模型最终主要由少量关键样本决定，而不是由全部样本平均决定。

在对偶形式中，这一点更加明显。最终的权重向量可以写成：

```text
w = sum_i alpha_i y_i x_i
```

只有 `alpha_i > 0` 的样本会参与求和，而这些样本正是支持向量。非支持向量的 `alpha_i = 0`，对最终模型没有直接贡献。

## 8. 硬间隔 SVM

硬间隔 SVM 假设数据是线性可分的。所谓线性可分，就是存在一个超平面可以把不同类别的训练样本完全分开。

硬间隔原始优化问题：

```text
min_{w,b} 1/2 ||w||^2
s.t. y_i (w^T x_i + b) >= 1
```

这是一个凸二次规划问题：

- 目标函数 `1/2 ||w||^2` 是凸函数。
- 约束条件是线性不等式。
- 因此局部最优就是全局最优。

硬间隔 SVM 的优点：

- 理论简洁。
- 几何含义清楚。
- 当数据线性可分且无噪声时，效果很好。

硬间隔 SVM 的问题：

- 对异常点非常敏感。
- 现实数据很少完全线性可分。
- 一个噪声点就可能导致间隔大幅缩小，甚至无解。

例如大多数正类点和负类点可以很好分开，但有一个正类样本由于标注错误落在负类区域。硬间隔 SVM 会被迫找到一个能把这个错误点也分开的边界，结果可能导致分类边界非常扭曲，泛化能力下降。

因此实际应用中更常用软间隔 SVM。

## 9. 软间隔 SVM

软间隔 SVM 允许部分样本违反间隔约束，甚至被错误分类。它通过引入松弛变量 `xi_i` 来表示每个样本违反约束的程度。

软间隔约束写为：

```text
y_i (w^T x_i + b) >= 1 - xi_i
xi_i >= 0
```

其中 `xi_i` 表示第 `i` 个样本的松弛量：

- `xi_i = 0`：样本在正确一侧，并且位于间隔边界之外。
- `0 < xi_i < 1`：样本分类正确，但落在间隔内部。
- `xi_i = 1`：样本刚好落在分类超平面上。
- `xi_i > 1`：样本被错误分类。

为了不让模型随意违反约束，需要在目标函数中惩罚松弛变量：

```text
min_{w,b,xi} 1/2 ||w||^2 + C sum_i xi_i
s.t. y_i (w^T x_i + b) >= 1 - xi_i
     xi_i >= 0
```

这里 `C` 是惩罚系数，也是 SVM 最重要的超参数之一。

`C` 的含义：

- `C` 越大，对错误和间隔违反惩罚越重，模型越倾向于把训练样本分对，间隔可能变窄，过拟合风险增加。
- `C` 越小，对错误容忍度越高，模型更追求大间隔，可能欠拟合。

可以把 `C` 理解为“严格程度”：

- 大 `C`：严格，训练错误不可接受。
- 小 `C`：宽松，允许犯一些错来换取更平滑的边界。

软间隔 SVM 比硬间隔更实用，因为它承认真实数据有噪声、有异常点、有重叠。

## 10. Hinge Loss 与正则化视角

软间隔 SVM 还可以从损失函数角度理解。

约束：

```text
y_i (w^T x_i + b) >= 1 - xi_i
```

等价于：

```text
xi_i >= 1 - y_i (w^T x_i + b)
xi_i >= 0
```

因此最小的 `xi_i` 就是：

```text
xi_i = max(0, 1 - y_i (w^T x_i + b))
```

这就是 hinge loss，中文常叫合页损失：

```text
L(y, f(x)) = max(0, 1 - y f(x))
```

于是软间隔 SVM 可以写为：

```text
min_{w,b} 1/2 ||w||^2 + C sum_i max(0, 1 - y_i (w^T x_i + b))
```

从这个角度看，SVM 的目标由两部分组成：

- `1/2 ||w||^2`：正则化项，控制模型复杂度，鼓励大间隔。
- `sum hinge loss`：经验损失，惩罚分类错误和间隔不足。

这和现代机器学习中常见的结构完全一致：

```text
目标函数 = 正则化项 + 经验损失
```

Hinge loss 的特点：

- 如果样本不仅分类正确，而且距离边界足够远，即 `y f(x) >= 1`，损失为 0。
- 如果样本分类正确但离边界太近，即 `0 < y f(x) < 1`，仍然有损失。
- 如果样本被分错，即 `y f(x) < 0`，损失更大。

这也是 SVM 和逻辑回归的重要区别之一。逻辑回归即使样本分得很对，也仍然会有很小的 log loss；而 SVM 对于已经满足间隔要求的样本不再继续奖励。

## 11. 为什么要推对偶问题

SVM 的原始问题已经可以表达目标，为什么还要推导对偶问题？

主要有三个原因：

1. 对偶形式能自然显示支持向量的作用。
2. 对偶形式只依赖样本之间的内积，方便引入核函数。
3. 对某些问题，对偶形式更容易求解。

对偶问题来自拉格朗日乘子法和 KKT 条件。完整推导并不复杂，但需要一步一步看。

以硬间隔 SVM 为例，原始问题是：

```text
min_{w,b} 1/2 ||w||^2
s.t. y_i (w^T x_i + b) >= 1
```

把约束改写为：

```text
1 - y_i (w^T x_i + b) <= 0
```

引入拉格朗日乘子 `alpha_i >= 0`，构造拉格朗日函数：

```text
L(w,b,alpha) = 1/2 ||w||^2 + sum_i alpha_i [1 - y_i (w^T x_i + b)]
```

对原始变量 `w` 和 `b` 求偏导，并令其为 0。

对 `w` 求导：

```text
partial L / partial w = w - sum_i alpha_i y_i x_i = 0
```

得到：

```text
w = sum_i alpha_i y_i x_i
```

对 `b` 求导：

```text
partial L / partial b = - sum_i alpha_i y_i = 0
```

得到：

```text
sum_i alpha_i y_i = 0
```

把这些结果代回拉格朗日函数，可得到硬间隔 SVM 的对偶问题：

```text
max_alpha sum_i alpha_i - 1/2 sum_i sum_j alpha_i alpha_j y_i y_j x_i^T x_j
s.t. alpha_i >= 0
     sum_i alpha_i y_i = 0
```

通常也写成最小化形式，但最大化形式更直观。

求出 `alpha_i` 后，权重向量为：

```text
w = sum_i alpha_i y_i x_i
```

预测函数为：

```text
f(x) = w^T x + b
     = sum_i alpha_i y_i x_i^T x + b
```

这里已经出现了关键点：预测时只需要计算训练样本 `x_i` 和新样本 `x` 的内积。

## 12. KKT 条件与支持向量

KKT 条件是理解支持向量的关键。对硬间隔 SVM，有互补松弛条件：

```text
alpha_i [1 - y_i (w^T x_i + b)] = 0
```

这意味着对每个样本，要么：

1. `alpha_i = 0`
2. `1 - y_i (w^T x_i + b) = 0`

如果某个样本不是支持向量，那么它在间隔边界之外：

```text
y_i (w^T x_i + b) > 1
```

此时：

```text
1 - y_i (w^T x_i + b) < 0
```

为了满足互补松弛，只能有：

```text
alpha_i = 0
```

如果某个样本是支持向量，那么：

```text
y_i (w^T x_i + b) = 1
```

此时 `alpha_i` 可以大于 0。

所以：

- `alpha_i = 0` 的样本通常不是支持向量。
- `alpha_i > 0` 的样本是支持向量。
- 最终模型只由支持向量决定。

对于软间隔 SVM，对偶问题会多出上界约束：

```text
0 <= alpha_i <= C
```

软间隔下可以根据 `alpha_i` 大小理解样本状态：

- `alpha_i = 0`：样本位于间隔之外，对模型无直接影响。
- `0 < alpha_i < C`：样本通常在间隔边界上，是标准支持向量。
- `alpha_i = C`：样本位于间隔内部或被误分类，通常是违反间隔的样本。

## 13. 核函数：让线性模型处理非线性问题

很多数据在原始空间不是线性可分的。例如二维平面中，正类点围成一个圆，负类点在圆外。无论怎么画直线，都无法把它们分开。

一种思路是把数据映射到更高维空间。比如把二维特征：

```text
x = (x_1, x_2)
```

映射为：

```text
phi(x) = (x_1, x_2, x_1^2 + x_2^2)
```

在原始二维空间中无法线性分开的数据，到了三维空间里可能可以用一个平面分开。这个思想叫特征映射。

如果直接显式计算高维映射，可能会非常昂贵。核函数的作用就是：

> 不显式计算高维特征 `phi(x)`，直接计算高维空间中的内积。

核函数定义为：

```text
K(x_i, x_j) = phi(x_i)^T phi(x_j)
```

回忆 SVM 对偶形式和预测函数都只依赖内积：

```text
x_i^T x_j
x_i^T x
```

因此只要把内积替换为核函数：

```text
K(x_i, x_j)
K(x_i, x)
```

就可以在不显式构造高维特征的情况下，得到非线性分类器。

预测函数变为：

```text
f(x) = sum_i alpha_i y_i K(x_i, x) + b
```

这就是核技巧。

## 14. 常见核函数

### 14.1 线性核

线性核：

```text
K(x, z) = x^T z
```

线性核等价于普通线性 SVM。它适合：

- 特征维度很高。
- 数据量较大。
- 数据近似线性可分。
- 文本分类、稀疏特征分类。

线性核参数少、速度快、解释性相对较好，是实践中经常首先尝试的核。

### 14.2 多项式核

多项式核：

```text
K(x, z) = (gamma x^T z + r)^d
```

其中：

- `d` 是多项式次数。
- `gamma` 控制内积缩放。
- `r` 是常数项。

多项式核可以表达特征之间的交互。例如二次多项式核能表达类似 `x_1 x_2`、`x_1^2` 这样的组合特征。

它适合存在明确特征交互的问题，但参数选择不当时容易过拟合。次数 `d` 越高，模型复杂度越强。

### 14.3 RBF 核

RBF 核，也叫高斯核：

```text
K(x, z) = exp(-gamma ||x - z||^2)
```

RBF 是 SVM 中最常用的非线性核。它衡量两个样本之间的相似度：

- 如果 `x` 和 `z` 很接近，`||x - z||^2` 很小，`K(x,z)` 接近 1。
- 如果 `x` 和 `z` 距离很远，`K(x,z)` 接近 0。

`gamma` 是 RBF 核最重要的参数：

- `gamma` 越大，单个样本影响范围越小，决策边界更复杂，容易过拟合。
- `gamma` 越小，单个样本影响范围越大，决策边界更平滑，容易欠拟合。

可以把 `gamma` 理解为“局部影响半径”的反向控制：

- 大 `gamma`：只关注很近的邻居，边界容易弯曲。
- 小 `gamma`：很多点都互相影响，边界更平滑。

RBF 核的优势是通用性强，不需要手工设计高阶特征。很多数据集上，如果不确定用什么核，可以先试线性核，再试 RBF 核。

### 14.4 Sigmoid 核

Sigmoid 核：

```text
K(x, z) = tanh(gamma x^T z + r)
```

它和神经网络中的激活函数有一定关系，但在实际 SVM 中不如线性核和 RBF 核常用。Sigmoid 核在某些参数下可能不满足有效核条件，使用时需要谨慎。

## 15. 如何理解 C 和 gamma

在 RBF SVM 中，最关键的两个超参数是 `C` 和 `gamma`。

### 15.1 C 控制错误惩罚

`C` 控制对训练错误和间隔违反的惩罚。

小 `C`：

- 更容忍训练错误。
- 间隔更宽。
- 边界更平滑。
- 偏差可能较大。
- 可能欠拟合。

大 `C`：

- 更不容忍训练错误。
- 间隔更窄。
- 边界更贴合训练集。
- 方差可能较大。
- 可能过拟合。

### 15.2 gamma 控制样本影响范围

对于 RBF 核：

```text
K(x, z) = exp(-gamma ||x - z||^2)
```

小 `gamma`：

- 样本影响范围大。
- 决策边界平滑。
- 模型复杂度低。
- 容易欠拟合。

大 `gamma`：

- 样本影响范围小。
- 决策边界复杂。
- 模型复杂度高。
- 容易过拟合。

### 15.3 C 和 gamma 的组合影响

`C` 和 `gamma` 不是孤立影响模型的。它们共同决定边界形状。

常见组合：

- 小 `C` + 小 `gamma`：模型很平滑，容易欠拟合。
- 大 `C` + 大 `gamma`：模型非常复杂，容易过拟合。
- 大 `C` + 小 `gamma`：边界整体平滑，但尽量减少训练错误。
- 小 `C` + 大 `gamma`：局部形状复杂，但允许不少错误，效果不一定稳定。

实践中通常使用交叉验证搜索：

```text
C:     0.01, 0.1, 1, 10, 100
gamma: 0.001, 0.01, 0.1, 1, 10
```

注意使用对数尺度搜索，因为这些参数的有效范围通常跨越多个数量级。

## 16. 特征缩放为什么非常重要

SVM 对特征尺度非常敏感，尤其是 RBF 核。

假设有两个特征：

- `年龄`：范围大约 0 到 100。
- `收入`：范围可能是 0 到 100000。

RBF 核依赖欧氏距离：

```text
||x - z||^2
```

如果不做缩放，收入特征会主导距离计算，年龄几乎不起作用。线性 SVM 中，特征尺度也会影响 `w` 的学习和正则化效果。

因此训练 SVM 前通常要做标准化：

```text
x' = (x - mean) / std
```

在 scikit-learn 中推荐使用 Pipeline：

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

model = Pipeline([
    ("scaler", StandardScaler()),
    ("svc", SVC(kernel="rbf", C=1.0, gamma="scale"))
])
```

使用 Pipeline 的好处是可以避免数据泄漏。标准化参数只从训练集学习，然后应用到验证集和测试集。

错误做法是先对全部数据标准化，再划分训练集和测试集。这样测试集的信息会泄漏到训练过程，导致评估结果虚高。

## 17. SVM 与逻辑回归的区别

SVM 和逻辑回归都可以学习线性分类边界，但它们的优化目标不同。

逻辑回归：

```text
min sum log(1 + exp(-y_i f(x_i))) + regularization
```

SVM：

```text
min sum max(0, 1 - y_i f(x_i)) + regularization
```

主要区别：

- 逻辑回归使用 log loss，直接建模概率。
- SVM 使用 hinge loss，强调最大间隔。
- 逻辑回归通常所有样本都会对损失产生影响。
- SVM 中满足间隔的样本损失为 0，主要由支持向量决定。
- 逻辑回归输出概率较自然。
- SVM 原始输出是决策分数，概率需要额外校准。
- 线性逻辑回归和线性 SVM 在很多任务上表现接近。

如果任务需要概率解释，例如风控中的违约概率、医疗中的风险概率，逻辑回归可能更方便。如果任务更关注分类边界和高维稀疏特征，线性 SVM 可能很强。

## 18. SVM 与 KNN、决策树的区别

### 18.1 SVM 与 KNN

KNN 是基于实例的懒惰学习方法，训练阶段几乎不做学习，预测时计算新样本和训练样本的距离。

SVM 则在训练阶段学习决策边界，预测时主要依赖支持向量。

区别：

- KNN 没有显式训练模型，SVM 有明确优化目标。
- KNN 预测成本通常较高，SVM 预测成本取决于支持向量数量。
- KNN 对局部数据分布敏感，SVM 强调最大间隔。
- KNN 和 RBF SVM 都和距离有关，但 SVM 是通过优化边界来分类。

### 18.2 SVM 与决策树

决策树通过规则切分特征空间，SVM 通过超平面或核函数形成边界。

区别：

- 决策树对特征缩放不敏感，SVM 对缩放敏感。
- 决策树可解释性较强，SVM 尤其是非线性核解释性较弱。
- 决策树容易过拟合，需要剪枝或集成方法。
- SVM 在高维空间中通常表现不错。
- 决策树能自然处理非线性和特征交互，SVM 需要核函数或特征工程。

## 19. 多分类 SVM

SVM 本质上是二分类算法，但可以扩展到多分类。

常见策略有两种：

### 19.1 One-vs-Rest

One-vs-Rest，简称 OvR，也叫 One-vs-All。

假设有 `K` 个类别，就训练 `K` 个二分类器。第 `k` 个分类器把第 `k` 类当作正类，其余所有类当作负类。

预测时，把样本输入所有分类器，选择决策分数最高的类别。

优点：

- 训练分类器数量少，只需要 `K` 个。
- 实现简单。
- 适合类别较多时使用。

缺点：

- 每个分类器的正负样本可能严重不平衡。
- 不同分类器的分数可比性可能受影响。

### 19.2 One-vs-One

One-vs-One，简称 OvO。

假设有 `K` 个类别，就为每两个类别训练一个分类器，总数为：

```text
K(K - 1) / 2
```

预测时，每个分类器投票，票数最多的类别作为最终结果。

优点：

- 每个分类器只处理两个类别，任务更简单。
- 对 SVM 来说常常效果不错。

缺点：

- 分类器数量较多。
- 类别很多时训练和预测成本增加。

scikit-learn 中的 `SVC` 默认使用 One-vs-One 策略处理多分类，而 `LinearSVC` 默认使用 One-vs-Rest。

## 20. SVM 回归：SVR 简介

SVM 也可以用于回归，称为 Support Vector Regression，简称 SVR。

普通回归通常希望预测值尽量接近真实值，而 SVR 引入了一个 `epsilon` 不敏感区间。只要预测误差在 `epsilon` 范围内，就不惩罚。

SVR 的直觉是：

> 找一个尽可能平坦的函数，同时允许预测值和真实值之间有一个可接受误差带。

对于线性 SVR：

```text
f(x) = w^T x + b
```

目标仍然包含控制平坦性的正则项：

```text
1/2 ||w||^2
```

误差只有超过 `epsilon` 才计入损失：

```text
max(0, |y - f(x)| - epsilon)
```

SVR 的重要参数：

- `C`：控制误差惩罚。
- `epsilon`：控制不敏感区间宽度。
- `kernel`：核函数。
- `gamma`：RBF 等核函数参数。

`epsilon` 越大，模型越不关心小误差，支持向量可能越少，模型更平滑；`epsilon` 越小，模型越努力贴近训练数据，可能更复杂。

## 21. scikit-learn 中的 SVM 模型

scikit-learn 提供了多种 SVM 相关模型。

常用分类模型：

- `sklearn.svm.SVC`：支持核函数的分类 SVM，适合中小规模数据。
- `sklearn.svm.LinearSVC`：线性 SVM，基于 liblinear，适合大规模线性分类。
- `sklearn.linear_model.SGDClassifier(loss="hinge")`：用随机梯度下降训练线性 SVM，适合超大规模数据。
- `sklearn.svm.NuSVC`：用 `nu` 参数控制支持向量比例和错误比例的变体。

常用回归模型：

- `sklearn.svm.SVR`：支持核函数的回归 SVM。
- `sklearn.svm.LinearSVR`：线性 SVR。
- `sklearn.svm.NuSVR`：SVR 变体。

### 21.1 SVC 示例

```python
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import classification_report

X, y = load_breast_cancer(return_X_y=True)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

model = Pipeline([
    ("scaler", StandardScaler()),
    ("svc", SVC(kernel="rbf", C=1.0, gamma="scale"))
])

model.fit(X_train, y_train)
y_pred = model.predict(X_test)

print(classification_report(y_test, y_pred))
```

重点：

- 使用 `stratify=y` 保持训练集和测试集类别比例一致。
- 使用 `Pipeline` 防止数据泄漏。
- 使用 `StandardScaler` 进行特征标准化。
- `gamma="scale"` 是 scikit-learn 常用默认值。

### 21.2 网格搜索调参

```python
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

X, y = load_breast_cancer(return_X_y=True)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("svc", SVC())
])

param_grid = {
    "svc__kernel": ["linear", "rbf"],
    "svc__C": [0.1, 1, 10, 100],
    "svc__gamma": ["scale", 0.01, 0.1, 1]
}

grid = GridSearchCV(
    pipe,
    param_grid=param_grid,
    cv=5,
    scoring="accuracy",
    n_jobs=-1
)

grid.fit(X_train, y_train)

print("best params:", grid.best_params_)
print("best cv score:", grid.best_score_)
print("test score:", grid.score(X_test, y_test))
```

注意：

- 参数名前面要加 Pipeline 步骤名，例如 `svc__C`。
- `cv=5` 表示 5 折交叉验证。
- 数据量较大时，网格搜索可能很慢，可以改用 `RandomizedSearchCV`。

### 21.3 线性 SVM 示例

当数据维度高、样本量大时，优先考虑 `LinearSVC` 或 `SGDClassifier`。

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import LinearSVC

model = Pipeline([
    ("scaler", StandardScaler()),
    ("linear_svc", LinearSVC(C=1.0, max_iter=5000))
])

model.fit(X_train, y_train)
print(model.score(X_test, y_test))
```

对于稀疏文本特征，如果使用 TF-IDF，很多时候不需要 `StandardScaler`，因为 TF-IDF 本身已经是归一化后的稀疏表示。此时常见写法是：

```python
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC

model = Pipeline([
    ("tfidf", TfidfVectorizer(max_features=50000, ngram_range=(1, 2))),
    ("clf", LinearSVC(C=1.0))
])

model.fit(text_train, y_train)
print(model.score(text_test, y_test))
```

## 22. SVM 实战流程

一个比较稳妥的 SVM 建模流程如下。

### 22.1 明确任务类型

先判断是分类、回归还是异常检测。

- 分类：`SVC`、`LinearSVC`、`SGDClassifier(loss="hinge")`
- 回归：`SVR`、`LinearSVR`
- 异常检测：`OneClassSVM`

### 22.2 划分数据集

常规划分：

```text
训练集 / 验证集 / 测试集
```

或者使用交叉验证。

分类任务中，如果类别不平衡，划分时使用分层抽样。

### 22.3 特征预处理

常见预处理：

- 数值特征标准化。
- 类别特征 one-hot 编码。
- 文本特征 TF-IDF。
- 缺失值填补。
- 异常值处理。

SVM 对特征尺度敏感，所以数值特征标准化通常是必要步骤。

### 22.4 选择初始模型

建议顺序：

1. 先试线性模型，作为 baseline。
2. 如果线性模型欠拟合，再试 RBF 核。
3. 如果数据量非常大，避免直接使用 RBF SVC。
4. 如果类别不平衡，使用 `class_weight="balanced"` 或调整评价指标。

### 22.5 调参

线性 SVM 重点调：

- `C`

RBF SVM 重点调：

- `C`
- `gamma`

SVR 重点调：

- `C`
- `gamma`
- `epsilon`

### 22.6 评估

分类任务不要只看 accuracy。根据业务目标选择：

- Accuracy：类别均衡时可用。
- Precision：关心预测为正的样本有多少是真的。
- Recall：关心真实正类有多少被找出来。
- F1-score：Precision 和 Recall 的折中。
- ROC-AUC：关注排序能力。
- PR-AUC：正负样本极不平衡时更有参考价值。

回归任务常用：

- MAE
- MSE
- RMSE
- R2

### 22.7 分析错误样本

调参之后要看错分样本：

- 是否存在标注错误。
- 是否某些类别容易混淆。
- 是否某些特征缺失或噪声过大。
- 是否类别不平衡导致少数类召回率低。
- 是否需要新特征。

很多时候，错误分析比盲目调参更有效。

## 23. 类别不平衡问题

类别不平衡是分类任务中常见问题。例如欺诈检测中，欺诈样本可能只占 1%。

如果直接训练 SVM，模型可能倾向于预测多数类，从而获得很高 accuracy，但少数类召回率很差。

解决思路：

### 23.1 调整 class_weight

scikit-learn 中可以设置：

```python
SVC(class_weight="balanced")
```

它会根据类别频率自动调整不同类别的惩罚权重。少数类样本被分错时惩罚更重。

也可以手动指定：

```python
SVC(class_weight={0: 1, 1: 5})
```

### 23.2 使用合适指标

类别不平衡时，accuracy 可能具有误导性。更应关注：

- 少数类 recall。
- 少数类 precision。
- F1-score。
- PR-AUC。
- 混淆矩阵。

### 23.3 重采样

可以尝试：

- 欠采样多数类。
- 过采样少数类。
- SMOTE 等合成样本方法。

但重采样要只在训练集内部进行，不能把测试集信息混入训练过程。

## 24. One-Class SVM 异常检测

One-Class SVM 是 SVM 在异常检测中的扩展。它只使用“正常样本”训练，学习正常样本所在区域，然后判断新样本是否偏离这个区域。

典型应用：

- 设备故障检测。
- 网络入侵检测。
- 异常交易识别。
- 传感器异常识别。

使用示例：

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import OneClassSVM

model = Pipeline([
    ("scaler", StandardScaler()),
    ("ocsvm", OneClassSVM(kernel="rbf", gamma="scale", nu=0.05))
])

model.fit(X_normal_train)

y_pred = model.predict(X_test)
```

输出结果：

- `+1` 表示正常。
- `-1` 表示异常。

`nu` 是 One-Class SVM 中的重要参数。它大致控制异常比例上界和支持向量比例下界。`nu=0.05` 可以理解为预计异常比例大约在 5% 附近，但实际结果还会受数据分布和核参数影响。

## 25. SVM 的优点

SVM 的主要优点：

- 最大间隔思想带来较好的泛化能力。
- 对高维特征表现好，尤其是文本分类等任务。
- 通过核函数可以处理非线性问题。
- 只依赖支持向量，模型具有稀疏性。
- 优化问题是凸的，不像神经网络那样容易陷入不同局部最优。
- 理论基础扎实，适合理解机器学习中的优化和正则化。

线性 SVM 在文本分类中尤其常见。文本经过 TF-IDF 表示后，维度很高但非常稀疏，线性边界往往已经足够有效。

## 26. SVM 的缺点

SVM 的主要缺点：

- 对特征缩放敏感。
- 非线性核 SVM 在大样本数据上训练慢、内存开销大。
- 核函数和参数选择对效果影响大。
- 模型输出不是天然概率。
- 非线性核模型可解释性较弱。
- 多分类需要额外策略。
- 对噪声和重叠数据仍然需要小心调参。

复杂度方面，核 SVM 通常需要计算样本之间的核矩阵，样本量大时开销明显。对于几万甚至更多样本的任务，RBF SVC 可能就变得很慢。此时应该考虑：

- 线性 SVM。
- SGD 训练。
- 近似核方法。
- 随机傅里叶特征。
- 其他更适合大规模数据的模型。

## 27. 常见参数详解

以 scikit-learn 的 `SVC` 为例，常见参数如下。

### 27.1 C

错误惩罚系数。

```python
SVC(C=1.0)
```

调参建议：

```text
[0.01, 0.1, 1, 10, 100, 1000]
```

### 27.2 kernel

核函数类型。

```python
SVC(kernel="rbf")
```

常见取值：

- `"linear"`
- `"poly"`
- `"rbf"`
- `"sigmoid"`
- 自定义 callable

实践建议：

- 高维稀疏文本：优先线性核或 `LinearSVC`。
- 中小规模结构化数据：可试 RBF。
- 明确存在多项式交互：可试 poly。

### 27.3 gamma

核函数系数，影响 RBF、poly、sigmoid。

```python
SVC(gamma="scale")
```

常见取值：

- `"scale"`：默认值，计算方式为 `1 / (n_features * X.var())`。
- `"auto"`：计算方式为 `1 / n_features`。
- 浮点数：手动指定。

调参建议：

```text
[0.0001, 0.001, 0.01, 0.1, 1, 10]
```

### 27.4 degree

多项式核次数。

```python
SVC(kernel="poly", degree=3)
```

次数越高，模型越复杂。常试：

```text
[2, 3, 4]
```

### 27.5 class_weight

类别权重。

```python
SVC(class_weight="balanced")
```

适合类别不平衡任务。

### 27.6 probability

是否启用概率输出。

```python
SVC(probability=True)
```

注意：启用后训练会更慢，因为需要额外概率校准。如果只是需要分类标签或决策分数，不建议打开。

可以使用：

```python
model.decision_function(X)
```

获取决策分数。

## 28. 常见问题与排查

### 28.1 训练很慢怎么办

可能原因：

- 样本量太大。
- 使用了 RBF 或多项式核。
- 网格搜索范围太大。
- 特征维度高且数据未稀疏优化。

解决方法：

- 先使用 `LinearSVC`。
- 使用 `SGDClassifier(loss="hinge")`。
- 减少训练样本做初步调参。
- 缩小参数搜索范围。
- 使用 `RandomizedSearchCV`。
- 做特征选择或降维。

### 28.2 效果很差怎么办

排查顺序：

1. 是否做了正确的特征缩放。
2. 标签是否正确。
3. 训练集和测试集分布是否一致。
4. 类别是否严重不平衡。
5. 线性核是否欠拟合。
6. RBF 的 `C` 和 `gamma` 是否合适。
7. 是否有大量噪声或异常值。
8. 评价指标是否和业务目标一致。

### 28.3 训练集效果好，测试集效果差怎么办

典型过拟合。

可以尝试：

- 降低 `C`。
- 降低 `gamma`。
- 减少多项式核 `degree`。
- 增加训练数据。
- 清洗异常样本。
- 使用更简单的线性模型。
- 用交叉验证重新评估。

### 28.4 训练集和测试集效果都差怎么办

典型欠拟合。

可以尝试：

- 增大 `C`。
- 增大 `gamma`。
- 从线性核换到 RBF 核。
- 增加有用特征。
- 减少过强正则化。
- 检查标签是否噪声过大。

## 29. 数学推导：软间隔对偶形式

软间隔原始问题：

```text
min_{w,b,xi} 1/2 ||w||^2 + C sum_i xi_i
s.t. 1 - xi_i - y_i(w^T x_i + b) <= 0
     -xi_i <= 0
```

引入拉格朗日乘子：

- `alpha_i >= 0` 对应第一个约束。
- `mu_i >= 0` 对应 `-xi_i <= 0`。

拉格朗日函数：

```text
L = 1/2 ||w||^2 + C sum_i xi_i
    + sum_i alpha_i [1 - xi_i - y_i(w^T x_i + b)]
    + sum_i mu_i (-xi_i)
```

对 `w` 求导：

```text
partial L / partial w = w - sum_i alpha_i y_i x_i = 0
```

得到：

```text
w = sum_i alpha_i y_i x_i
```

对 `b` 求导：

```text
partial L / partial b = -sum_i alpha_i y_i = 0
```

得到：

```text
sum_i alpha_i y_i = 0
```

对 `xi_i` 求导：

```text
partial L / partial xi_i = C - alpha_i - mu_i = 0
```

得到：

```text
alpha_i + mu_i = C
```

由于 `mu_i >= 0`，所以：

```text
0 <= alpha_i <= C
```

最终软间隔对偶问题：

```text
max_alpha sum_i alpha_i - 1/2 sum_i sum_j alpha_i alpha_j y_i y_j x_i^T x_j
s.t. 0 <= alpha_i <= C
     sum_i alpha_i y_i = 0
```

加入核函数后：

```text
max_alpha sum_i alpha_i - 1/2 sum_i sum_j alpha_i alpha_j y_i y_j K(x_i, x_j)
s.t. 0 <= alpha_i <= C
     sum_i alpha_i y_i = 0
```

预测函数：

```text
f(x) = sum_i alpha_i y_i K(x_i, x) + b
```

这就是实际核 SVM 的核心形式。

## 30. 如何计算偏置 b

求出 `alpha_i` 后，还需要计算 `b`。

对于满足 `0 < alpha_i < C` 的支持向量，它通常位于间隔边界上：

```text
y_i f(x_i) = 1
```

也就是：

```text
y_i [sum_j alpha_j y_j K(x_j, x_i) + b] = 1
```

因为 `y_i` 只可能是 `+1` 或 `-1`，可以得到：

```text
b = y_i - sum_j alpha_j y_j K(x_j, x_i)
```

实际计算中，通常对所有满足 `0 < alpha_i < C` 的支持向量求出的 `b` 取平均，以增强数值稳定性。

如果没有满足 `0 < alpha_i < C` 的样本，计算会更复杂，库内部会采用更稳健的处理方式。

## 31. SVM 的几何图像总结

可以把 SVM 的几何图像想成三条平行线或三个平行超平面：

```text
w^T x + b = 1      正类间隔边界
w^T x + b = 0      分类边界
w^T x + b = -1     负类间隔边界
```

两条间隔边界之间的距离为：

```text
2 / ||w||
```

SVM 最大化这个距离。

支持向量落在或靠近间隔边界。软间隔下，有些支持向量可能进入间隔内部甚至被分错。

最终分类由：

```text
sign(w^T x + b)
```

或者核形式：

```text
sign(sum_i alpha_i y_i K(x_i, x) + b)
```

决定。

## 32. 手写一个线性 SVM 的训练直觉

真正工业级 SVM 求解通常使用 SMO、坐标下降、libsvm、liblinear 等成熟优化器。学习时也可以从 hinge loss 的梯度下降角度理解线性 SVM。

目标：

```text
J(w,b) = 1/2 ||w||^2 + C sum_i max(0, 1 - y_i(w^T x_i + b))
```

对一个样本，如果：

```text
y_i(w^T x_i + b) >= 1
```

说明样本已经满足间隔要求，hinge loss 为 0，只需要更新正则项：

```text
w <- w - lr * w
```

如果：

```text
y_i(w^T x_i + b) < 1
```

说明样本违反间隔，需要同时考虑分类损失：

```text
w <- w - lr * (w - C y_i x_i)
b <- b + lr * C y_i
```

这只是帮助理解的简化写法，实际实现要考虑批量、学习率、正则化系数缩放、收敛条件等问题。

一个简化示例：

```python
import numpy as np

class SimpleLinearSVM:
    def __init__(self, lr=0.001, C=1.0, epochs=1000):
        self.lr = lr
        self.C = C
        self.epochs = epochs
        self.w = None
        self.b = 0.0

    def fit(self, X, y):
        n_samples, n_features = X.shape
        self.w = np.zeros(n_features)
        self.b = 0.0

        for _ in range(self.epochs):
            for x_i, y_i in zip(X, y):
                margin = y_i * (np.dot(self.w, x_i) + self.b)

                if margin >= 1:
                    grad_w = self.w
                    grad_b = 0.0
                else:
                    grad_w = self.w - self.C * y_i * x_i
                    grad_b = -self.C * y_i

                self.w -= self.lr * grad_w
                self.b -= self.lr * grad_b

    def decision_function(self, X):
        return np.dot(X, self.w) + self.b

    def predict(self, X):
        return np.where(self.decision_function(X) >= 0, 1, -1)
```

这个例子不追求高性能，只用于理解 hinge loss 和最大间隔之间的关系。实际项目中应使用 scikit-learn 或成熟优化库。

## 33. SMO 算法直觉

SMO，全称 Sequential Minimal Optimization，是训练 SVM 的经典算法之一，libsvm 就基于 SMO 类方法。

SVM 对偶问题需要优化很多 `alpha_i`，同时满足约束：

```text
sum_i alpha_i y_i = 0
0 <= alpha_i <= C
```

这些变量不是完全独立的，因为有等式约束。SMO 的核心思想是：

> 每次选择两个变量 `alpha_i` 和 `alpha_j` 进行优化，固定其他变量。

为什么至少选两个？因为如果只改变一个 `alpha_i`，等式约束 `sum_i alpha_i y_i = 0` 通常会被破坏。选两个变量，就可以一个增加、一个减少，从而维持约束。

SMO 的过程大致是：

1. 初始化所有 `alpha_i = 0`。
2. 选择一对违反 KKT 条件的变量。
3. 在约束范围内解析更新这两个变量。
4. 更新阈值 `b`。
5. 重复直到所有变量基本满足 KKT 条件。

SMO 的优点是每次只处理两个变量，子问题可以解析求解，不需要大型二次规划求解器，因此在中小规模 SVM 上很实用。

## 34. SVM 的概率输出

SVM 原生输出的是决策函数分数：

```text
f(x) = w^T x + b
```

或者：

```text
f(x) = sum_i alpha_i y_i K(x_i, x) + b
```

这个分数可以表示样本离分类边界的方向和远近，但不是概率。

如果需要概率，可以使用概率校准。scikit-learn 中：

```python
SVC(probability=True)
```

内部会进行类似 Platt scaling 的校准，把决策分数映射到概率。

也可以使用：

```python
from sklearn.calibration import CalibratedClassifierCV
from sklearn.svm import LinearSVC

base_model = LinearSVC(C=1.0)
model = CalibratedClassifierCV(base_model, method="sigmoid", cv=5)
model.fit(X_train, y_train)
proba = model.predict_proba(X_test)
```

注意：

- 概率校准会增加训练成本。
- 校准需要验证数据或交叉验证。
- 如果业务强依赖概率质量，要检查校准曲线、Brier score 等指标。

## 35. SVM 与正则化

SVM 的最大间隔本质上就是一种正则化思想。

目标函数：

```text
1/2 ||w||^2 + C sum hinge_loss
```

其中 `1/2 ||w||^2` 是 L2 正则化。它限制权重不要过大，从而控制模型复杂度。

有些资料会把目标写成：

```text
1/2 ||w||^2 + C sum loss
```

也有些机器学习库或论文写成：

```text
lambda ||w||^2 + sum loss
```

二者本质类似，只是参数表达方式不同：

- `C` 越大，损失项越重要，正则化相对越弱。
- `lambda` 越大，正则化越强。

可以粗略理解为：

```text
C 和 lambda 方向相反
```

因此调大 `C` 往往会让模型更复杂，调小 `C` 往往会让模型更简单。

## 36. SVM 的泛化能力直觉

为什么最大间隔通常有较好泛化能力？

直观来说，如果分类边界离训练样本都比较远，那么新样本只要和训练样本分布接近，即使存在一些扰动，也不容易跨过边界被分错。

从学习理论角度，间隔越大，模型对输入扰动越不敏感，容量控制越好。SVM 不只是找一个能分开训练集的边界，而是从所有可分边界中选择间隔最大的那个。

但要注意，最大间隔不是万能的。泛化能力仍然依赖：

- 数据是否有代表性。
- 特征是否表达了任务关键信息。
- 核函数是否合适。
- 超参数是否合理。
- 训练集和测试集分布是否一致。

如果数据本身有严重噪声或训练测试分布不同，再漂亮的最大间隔也无法保证好结果。

## 37. 实战案例：鸢尾花分类

下面用鸢尾花数据集演示一个完整流程。

```python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix

X, y = load_iris(return_X_y=True)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("svc", SVC())
])

param_grid = {
    "svc__kernel": ["linear", "rbf"],
    "svc__C": [0.1, 1, 10, 100],
    "svc__gamma": ["scale", 0.01, 0.1, 1]
}

grid = GridSearchCV(
    pipe,
    param_grid=param_grid,
    cv=5,
    scoring="accuracy",
    n_jobs=-1
)

grid.fit(X_train, y_train)

y_pred = grid.predict(X_test)

print("best params:", grid.best_params_)
print("confusion matrix:")
print(confusion_matrix(y_test, y_pred))
print("classification report:")
print(classification_report(y_test, y_pred))
```

这段代码体现了 SVM 项目的常规写法：

- 先划分数据。
- 用 Pipeline 管理预处理和模型。
- 用 GridSearchCV 做交叉验证调参。
- 用测试集做最终评估。

## 38. 实战案例：文本分类

文本分类是线性 SVM 的经典应用。

```python
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC
from sklearn.metrics import classification_report

categories = [
    "comp.graphics",
    "sci.med",
    "rec.sport.baseball",
    "talk.politics.misc"
]

train_data = fetch_20newsgroups(
    subset="train",
    categories=categories,
    remove=("headers", "footers", "quotes")
)

test_data = fetch_20newsgroups(
    subset="test",
    categories=categories,
    remove=("headers", "footers", "quotes")
)

model = Pipeline([
    ("tfidf", TfidfVectorizer(
        lowercase=True,
        stop_words="english",
        max_features=50000,
        ngram_range=(1, 2)
    )),
    ("clf", LinearSVC(C=1.0))
])

model.fit(train_data.data, train_data.target)
y_pred = model.predict(test_data.data)

print(classification_report(test_data.target, y_pred, target_names=train_data.target_names))
```

为什么文本分类常用线性 SVM？

- TF-IDF 特征维度很高。
- 文本特征通常稀疏。
- 高维空间中线性边界已经很强。
- 线性模型训练和预测速度更快。
- 权重可以用于分析关键词贡献。

如果想看某个类别中权重最高的词，可以读取 `LinearSVC.coef_` 和 `TfidfVectorizer.get_feature_names_out()`，做简单排序。

## 39. 面试常考问题

### 39.1 SVM 的核心思想是什么

SVM 的核心思想是寻找最大间隔分类超平面。它不仅要求训练样本被正确分类，还希望分类边界到最近样本的距离尽可能大，从而提升泛化能力。

### 39.2 什么是支持向量

支持向量是距离分类边界最近、决定最大间隔超平面的样本。在对偶形式中，支持向量对应 `alpha_i > 0` 的样本。非支持向量的 `alpha_i = 0`，对最终分类函数没有直接贡献。

### 39.3 为什么最大化间隔等价于最小化 `1/2 ||w||^2`

在固定函数间隔最小值为 1 后，几何间隔为：

```text
1 / ||w||
```

最大化几何间隔等价于最小化 `||w||`。为了方便求导和优化，通常最小化：

```text
1/2 ||w||^2
```

### 39.4 硬间隔和软间隔有什么区别

硬间隔要求所有训练样本都被正确分类，并且满足间隔约束，适合完全线性可分且无噪声的数据。

软间隔允许部分样本违反间隔约束，甚至允许少量误分类，通过松弛变量和惩罚系数 `C` 平衡间隔大小和训练错误，更适合真实数据。

### 39.5 C 参数有什么作用

`C` 是软间隔 SVM 中对错误和间隔违反的惩罚系数。

- `C` 大：更重视训练集分类正确，模型更复杂，可能过拟合。
- `C` 小：更容忍错误，更重视大间隔，模型更简单，可能欠拟合。

### 39.6 gamma 参数有什么作用

在 RBF 核中：

```text
K(x,z) = exp(-gamma ||x-z||^2)
```

`gamma` 控制单个样本的影响范围。

- `gamma` 大：影响范围小，边界复杂，容易过拟合。
- `gamma` 小：影响范围大，边界平滑，容易欠拟合。

### 39.7 什么是核技巧

核技巧是在不显式计算高维映射 `phi(x)` 的情况下，通过核函数直接计算高维空间中的内积：

```text
K(x,z) = phi(x)^T phi(z)
```

由于 SVM 对偶形式只依赖样本内积，可以把内积替换为核函数，从而让线性 SVM 获得非线性分类能力。

### 39.8 为什么 SVM 对特征缩放敏感

SVM 的间隔、正则化和 RBF 核中的距离计算都依赖特征尺度。如果某个特征数值范围特别大，它会主导距离或内积，导致模型忽略其他特征。因此通常需要标准化或归一化。

### 39.9 SVM 能输出概率吗

SVM 原生输出决策分数，不是概率。可以通过 Platt scaling、isotonic regression 等方法进行概率校准。在 scikit-learn 中可以设置 `SVC(probability=True)`，但训练会更慢。

### 39.10 SVM 适合大规模数据吗

线性 SVM 可以用于大规模数据，尤其是使用 `LinearSVC` 或 `SGDClassifier`。但非线性核 SVM 在样本量很大时通常训练较慢、内存消耗较高，不适合直接用于超大规模数据。

## 40. 学习路线建议

学习 SVM 可以按下面顺序：

1. 先理解线性分类器和超平面。
2. 掌握点到超平面的距离公式。
3. 理解函数间隔和几何间隔。
4. 推出硬间隔优化目标。
5. 理解支持向量。
6. 学习软间隔和 hinge loss。
7. 学习拉格朗日对偶和 KKT 条件。
8. 理解核函数和 RBF 核。
9. 用 scikit-learn 完成分类任务。
10. 学会调 `C`、`gamma` 和 `kernel`。
11. 结合交叉验证和错误分析优化模型。

如果数学基础较弱，可以先跳过完整对偶推导，先用几何图像和代码跑通 SVM。等有直观认识后，再回头看拉格朗日乘子和 KKT 条件会容易很多。

## 41. 重点公式汇总

线性决策函数：

```text
f(x) = w^T x + b
```

分类规则：

```text
y = sign(f(x))
```

点到超平面距离：

```text
distance = |w^T x + b| / ||w||
```

几何间隔：

```text
gamma_i = y_i(w^T x_i + b) / ||w||
```

硬间隔 SVM：

```text
min 1/2 ||w||^2
s.t. y_i(w^T x_i + b) >= 1
```

软间隔 SVM：

```text
min 1/2 ||w||^2 + C sum_i xi_i
s.t. y_i(w^T x_i + b) >= 1 - xi_i
     xi_i >= 0
```

Hinge loss：

```text
max(0, 1 - y_i f(x_i))
```

硬间隔对偶：

```text
max sum_i alpha_i - 1/2 sum_i sum_j alpha_i alpha_j y_i y_j x_i^T x_j
s.t. alpha_i >= 0
     sum_i alpha_i y_i = 0
```

软间隔对偶：

```text
max sum_i alpha_i - 1/2 sum_i sum_j alpha_i alpha_j y_i y_j K(x_i, x_j)
s.t. 0 <= alpha_i <= C
     sum_i alpha_i y_i = 0
```

核 SVM 预测函数：

```text
f(x) = sum_i alpha_i y_i K(x_i, x) + b
```

RBF 核：

```text
K(x,z) = exp(-gamma ||x-z||^2)
```

间隔宽度：

```text
2 / ||w||
```

## 42. 易错点总结

1. 把函数间隔当成几何间隔。函数间隔会随 `w,b` 缩放改变，几何间隔才是真正距离。
2. 忘记 SVM 标签通常用 `-1` 和 `+1`，不是 `0` 和 `1`。
3. 使用 RBF 核前不做特征标准化。
4. 在划分训练集和测试集之前对全部数据做标准化，造成数据泄漏。
5. 只调 `C`，不调 `gamma`。
6. 类别不平衡时仍只看 accuracy。
7. 误以为所有训练样本都决定 SVM 边界，实际上主要是支持向量决定。
8. 误以为核函数一定显式升维，实际核技巧避免了显式计算高维特征。
9. 在大样本数据上盲目使用 RBF SVC，导致训练非常慢。
10. 把 SVM 的 decision score 当成概率使用。

## 43. 一句话总结

SVM 是一种以最大间隔为核心思想的监督学习算法。线性 SVM 通过寻找最优超平面实现分类，软间隔 SVM 通过松弛变量处理噪声，核 SVM 通过核函数处理非线性问题。它的关键在于理解“间隔、支持向量、正则化、对偶、核函数”这五件事；实践中则要重点做好特征缩放、核函数选择、`C/gamma` 调参和交叉验证。

<!-- AUTO_EXPANDED_TO_REFERENCE_LENGTH_2026_06_23 -->

## 万字精讲扩展：SVM学习笔记

> 本节为按参考笔记篇幅补充的系统化扩展内容，目标是把原有笔记从“知识点记录”扩展为“概念、原理、流程、工程实践、常见误区和复盘清单”完整学习材料。

### 精讲扩展 1：SVM学习笔记 的数据分布、特征工程 与工程化理解

学习 $topic 时，不能只把它当成一个孤立知识点来背诵，而要把它放到 $category 的完整问题链条里理解。一个知识点通常同时包含概念定义、适用边界、输入输出、运行过程、常见异常和工程取舍。真正掌握它，意味着看到一个具体场景时，能够判断它解决什么问题、依赖哪些前提、失败时会出现什么现象，以及应该用什么手段验证自己的判断。

从 $a 的角度看，最重要的是先建立清晰的对象模型。也就是明确系统里有哪些参与者、它们之间如何连接、数据或控制信号如何流动、哪些环节是同步的、哪些环节是异步的、哪些状态是临时状态、哪些状态需要长期保存。很多初学问题并不是公式不会、API 不熟，而是对象边界不清：把配置当成状态，把结果当成过程，把局部现象当成全局规律。写笔记时建议始终追问：这个概念的主体是谁，输入是什么，输出是什么，中间约束是什么，错误会在哪里暴露。

从 $b 的角度看，流程比单点知识更关键。一个成熟方案通常不是单个技巧，而是一组步骤：先确定目标，再拆分约束，然后选择工具，最后通过测试和复盘确认效果。比如在实际项目中，不能只问“怎么实现”，还要问“为什么要这样实现”“有没有更简单的替代方案”“边界条件是什么”“数据量、并发量、实时性、可靠性变化后还能不能工作”。这种流程意识能够避免把学习停留在教程层面，也能让后续排错有明确路线。

$topic 的 $c 往往决定它在真实项目中的稳定性。理论上可行的方案，到了工程环境中会受到数据质量、硬件条件、依赖版本、网络环境、团队协作、部署方式和维护成本影响。写代码或做设计时，应该把正常路径和异常路径同时考虑：正常情况下如何运行，输入为空怎么办，超时怎么办，重复执行怎么办，部分成功怎么办，版本升级后兼容性怎么办，日志和指标如何证明系统确实按预期工作。

进一步看 $d，它通常对应性能、可靠性或可维护性的核心矛盾。很多技术选择并没有绝对正确答案，只有是否适合当前约束。例如追求极致性能可能牺牲可读性，追求高度抽象可能增加调试成本，追求快速交付可能留下技术债，追求完全通用可能让简单场景变复杂。高质量笔记应该把这些取舍写出来，而不是只给一个“推荐方案”。推荐方案背后的条件越清楚，迁移到新场景时越不容易误用。

最后从 $e 的角度进行复盘，可以把知识从“看懂”推进到“会用”。建议为 $topic 建立三个层次的检查：第一层是概念检查，确认术语、流程和边界没有混淆；第二层是实践检查，确认能够独立完成一个最小案例；第三层是工程检查，确认这个案例在异常、规模、性能和维护方面经得起追问。每次学习完一个章节，都可以用这三层检查反向补齐笔记。

#### 典型场景拆解

在真实场景中，$topic 通常会经历“需求出现、方案选择、实现落地、问题暴露、持续优化”几个阶段。需求出现时，要先判断这个需求属于基础能力、性能优化、体验改进、可靠性建设还是长期架构演进。不同类型的需求对方案的评价标准不同：基础能力看正确性，性能优化看指标，体验改进看路径是否顺滑，可靠性建设看故障时能否降级和恢复，架构演进看未来变化是否容易吸收。

方案选择阶段，最容易犯的错误是直接套用熟悉工具。更稳妥的方式是列出约束：数据规模、时延要求、资源预算、团队熟悉度、运维能力、安全要求、可测试性和长期维护成本。只有把约束列清楚，才能解释为什么选择当前方案。否则方案看似高级，实际可能只是增加了复杂度。

实现落地阶段，要把 $a 和 $b 拆成可验证的小步骤。每一步都应该有明确的输入、输出和检查方式。对学习笔记而言，这意味着不能只有大段概念，还应该补充流程图式的文字描述、伪代码、命令示例、参数解释、错误现象和排查路径。这样以后复习时，笔记不仅能帮助理解，也能直接指导实践。

问题暴露阶段，要优先区分“理解错误、实现错误、环境错误、数据错误、依赖错误、边界条件错误”。很多复杂问题之所以难排，是因为一开始就把问题归因到错误层级。例如把配置问题当成算法问题，把权限问题当成代码问题，把数据分布变化当成模型失效，把硬件噪声当成软件逻辑错误。好的排查顺序应该从可观测事实开始，而不是从猜测开始。

持续优化阶段，不应只追求把当前问题压下去，还要沉淀成规则。比如记录触发条件、影响范围、定位方法、最终修复、预防措施和可监控指标。这样下一次出现类似问题时，团队可以复用经验，而不是重新从零排查。

#### 常见误区与纠偏

第一个误区是只记结论，不记前提。$topic 中很多结论都是有条件的：适用于小规模，不一定适用于大规模；适用于离线处理，不一定适用于实时系统；适用于单机环境，不一定适用于分布式环境；适用于教学案例，不一定适用于生产项目。纠偏方法是在每个重要结论后面补一句“适用条件”和“不适用情况”。

第二个误区是只关注工具，不关注模型。工具会变化，模型更稳定。无论工具名称如何变化，底层仍然要解决输入建模、状态管理、资源调度、错误恢复、性能约束和质量验证这些问题。学习 $topic 时，应该把工具用法和底层模型分开记录：工具命令解决“怎么做”，底层模型解释“为什么这样做”。

第三个误区是没有验证意识。很多笔记写得很完整，但没有说明如何确认自己做对了。对于 $category 相关主题，验证至少应包含最小样例、边界样例、异常样例和性能样例。最小样例证明流程跑通，边界样例证明理解完整，异常样例证明系统可恢复，性能样例证明方案在目标规模下仍然可用。

第四个误区是忽略可维护性。短期学习时，能跑通就容易产生掌握的错觉；长期使用时，命名、分层、注释、测试、日志、版本管理和文档才会决定知识能否转化为稳定能力。扩充 $topic 笔记时，应把“如何写得清楚、如何排查、如何交接、如何复盘”也纳入内容。

#### 学习与实践建议

建议围绕 $topic 做一个小型闭环练习：先用自己的话解释概念，再画出流程，再实现一个最小案例，然后主动制造一个错误并排查，最后写下复盘。这个过程看起来比直接读资料慢，但能显著提高迁移能力。很多人学完后不会用，根本原因是缺少“从概念到问题再到验证”的闭环。

复习时可以使用四个问题：它解决什么问题；它依赖什么条件；它失败时有什么表现；它如何被验证。只要这四个问题能回答清楚，说明对 $topic 的理解已经从表层进入工程层。如果回答不清楚，就回到对应章节补充例子、边界和排错方法。
## 扩展复盘清单

- 能否用一句话说明本主题解决的问题。
- 能否列出本主题最重要的输入、输出、约束和失败模式。
- 能否独立完成一个最小实践案例，并解释每一步为什么需要。
- 能否设计边界测试、异常测试和性能测试。
- 能否把本主题和所在技术体系中的其他主题连接起来理解。
