# sklearn 项目基本模板

机器学习项目最怕一上来就调模型。一个稳定的项目结构应该先把数据、划分、预处理、训练、评估流程固定下来，再替换不同模型。

## 一、通用流程

```text
导入库
  -> 读取数据
  -> 明确 X 和 y
  -> 划分训练集和测试集
  -> 构建预处理流程
  -> 构建模型
  -> 训练
  -> 预测
  -> 评估
  -> 保存结果和复盘
```

## 二、基础代码骨架

```python
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

df = pd.read_csv("data.csv")

target_col = "target"
X = df.drop(columns=[target_col])
y = df[target_col]

numeric_features = X.select_dtypes(include=["int64", "float64"]).columns
categorical_features = X.select_dtypes(include=["object", "category"]).columns

numeric_pipe = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
])

categorical_pipe = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("onehot", OneHotEncoder(handle_unknown="ignore")),
])

preprocess = ColumnTransformer(transformers=[
    ("num", numeric_pipe, numeric_features),
    ("cat", categorical_pipe, categorical_features),
])

model = Pipeline(steps=[
    ("preprocess", preprocess),
    ("clf", LogisticRegression(max_iter=1000)),
])

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model.fit(X_train, y_train)
y_pred = model.predict(X_test)

print(classification_report(y_test, y_pred))
```

## 三、为什么要用 Pipeline

Pipeline 的核心价值是防止数据泄漏。标准化、缺失值填充、编码等步骤只能在训练集上学习规则，再应用到验证集和测试集。如果先对全数据做预处理，再划分训练测试，就会把测试集信息泄漏给训练过程。

Pipeline 还能让交叉验证和网格搜索更可靠。模型选择时，预处理会在每一折训练数据内重新拟合，评估更接近真实泛化表现。

## 四、分类和回归的差异

分类任务的模型最后一步可以是：

```python
LogisticRegression()
RandomForestClassifier()
SVC()
```

回归任务的模型最后一步可以是：

```python
LinearRegression()
Ridge()
RandomForestRegressor()
```

分类看准确率、查准率、查全率、F1、AUC；回归看 MAE、MSE、RMSE、R2。

## 五、新手必须养成的习惯

1. 永远先划分数据，再做会学习数据分布的预处理。
2. 永远保留一个最终测试集。
3. 永远建立简单基线。
4. 永远看错误样本，而不是只看一个总分。
5. 永远记录随机种子、数据版本、模型参数和指标。
