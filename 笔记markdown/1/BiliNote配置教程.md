# BiliNote 配置教程

> 适用对象：想在本地、服务器或 Docker 中部署并配置 BiliNote 的用户。本文以 2026-06-23 可查到的 BiliNote 官方仓库和官方文档为基础整理，覆盖安装、环境变量、模型供应商、语音识别、Cookie、GPU 加速、数据持久化、升级和排错。

## 1. BiliNote 是什么

BiliNote 是一个开源 AI 视频笔记工具，可以把哔哩哔哩、YouTube、抖音、快手、本地视频等内容转换为结构化 Markdown 笔记。它的核心流程是：

1. 输入视频链接或上传本地视频。
2. 下载视频或提取字幕、音频。
3. 使用语音识别服务把音频转成文本。
4. 调用大模型 API 生成总结、重点、教程式笔记、会议纪要等内容。
5. 可选插入视频截图、原片跳转链接、封面 Banner，并保留历史版本。

BiliNote 当前主要有三种使用方式：

| 方式 | 适合人群 | 优点 | 注意事项 |
|---|---|---|---|
| BiliNote Pro 在线版 | 只想直接使用 | 免安装、免环境、免模型下载 | 依赖官方在线服务 |
| Docker 部署 | 大多数本地或服务器用户 | 环境隔离，部署简单，推荐 | 需要 Docker，可根据网络情况配置镜像源 |
| 源码部署 | 开发者、二次开发用户 | 方便改代码和调试 | 需要 Python、Node.js、FFmpeg 等环境 |

官方仓库地址：

```text
https://github.com/JefferyHcool/BiliNote
```

官方文档地址：

```text
https://docs.bilinote.app/
```

在线版地址：

```text
https://www.bilinote.app/
```

## 2. 部署前准备

### 2.1 推荐环境

如果只是普通使用，优先选择 Docker 部署。

| 项目 | Docker 部署 | 源码部署 |
|---|---|---|
| 操作系统 | Windows、macOS、Linux 均可 | Windows、macOS、Linux 均可 |
| Docker | 必需 | 非必需 |
| Python | 容器内自带 | Python 3.10+，官方 README 新版本也可能使用 Python 3.11 |
| Node.js | 容器内自带 | Node.js 18+ 或 Node.js 20 |
| FFmpeg | Docker 镜像内置 | 必须手动安装并加入 PATH |
| Git | 建议安装 | 建议安装 |
| GPU | 可选 | 可选 |

### 2.2 Windows 注意事项

Windows 用户建议：

1. 项目路径不要包含中文、空格或特殊符号，例如推荐放在：

```text
D:\apps\BiliNote
```

不要放在：

```text
D:\我的工具\BiliNote
C:\Users\你的名字\Desktop\BiliNote
```

2. 使用 PowerShell 执行命令。
3. Docker 部署时先启动 Docker Desktop，并确认 Docker 图标处于运行状态。
4. 源码部署时必须确认 `ffmpeg` 能在命令行直接执行：

```powershell
ffmpeg -version
```

### 2.3 检查 Docker

```powershell
docker --version
docker compose version
```

如果两条命令都能输出版本号，说明 Docker 和 Docker Compose 可用。

## 3. 部署方式一：Docker 预构建镜像部署

这是最省事的方式，不需要在本机安装 Python、Node.js、FFmpeg。

### 3.1 拉取镜像

```powershell
docker pull ghcr.io/jefferyhcool/bilinote:latest
```

如果网络无法拉取 `ghcr.io` 镜像，可以尝试代理、镜像加速，或改用源码目录中的 `docker-compose` 本地构建方式。

### 3.2 启动容器

```powershell
docker run -d -p 80:80 `
  -v bilinote-data:/app/backend/data `
  -v bilinote-config:/app/backend/config `
  -v bilinote-static:/app/backend/static `
  -v bilinote-models:/app/backend/models `
  --name bilinote `
  ghcr.io/jefferyhcool/bilinote:latest
```

Linux 或 macOS 使用：

```bash
docker run -d -p 80:80 \
  -v bilinote-data:/app/backend/data \
  -v bilinote-config:/app/backend/config \
  -v bilinote-static:/app/backend/static \
  -v bilinote-models:/app/backend/models \
  --name bilinote \
  ghcr.io/jefferyhcool/bilinote:latest
```

访问：

```text
http://localhost
```

如果部署在服务器上，把 `localhost` 换成服务器 IP 或域名。

### 3.3 持久化卷说明

上面命令挂载了 4 个 Docker 命名卷：

| 卷名 | 容器路径 | 用途 |
|---|---|---|
| `bilinote-data` | `/app/backend/data` | SQLite 数据、生成笔记等运行数据 |
| `bilinote-config` | `/app/backend/config` | 模型供应商、Cookie、转写配置等 |
| `bilinote-static` | `/app/backend/static` | 截图、静态资源 |
| `bilinote-models` | `/app/backend/models` | Whisper 模型缓存 |

不要把整个 `/app/backend` 挂成一个卷，否则升级镜像后可能被旧文件覆盖，导致升级不生效。

### 3.4 查看运行状态

```powershell
docker ps
docker logs -f bilinote
```

停止容器：

```powershell
docker stop bilinote
```

重新启动：

```powershell
docker start bilinote
```

删除容器但保留数据卷：

```powershell
docker rm -f bilinote
```

数据仍会留在 `bilinote-data`、`bilinote-config`、`bilinote-static`、`bilinote-models` 这些卷中。

## 4. 部署方式二：Docker Compose 部署

如果你需要修改 `.env`、使用 GPU 编排、二次构建镜像，建议使用 Docker Compose。

### 4.1 克隆仓库

```powershell
git clone https://github.com/JefferyHcool/BiliNote.git
cd BiliNote
```

如果没有 Git，可以在 GitHub 页面下载 ZIP 压缩包，解压后进入目录。

### 4.2 创建 `.env`

Windows PowerShell：

```powershell
Copy-Item .env.example .env
```

Linux 或 macOS：

```bash
cp .env.example .env
```

第一次部署务必创建 `.env`，否则 `BACKEND_PORT`、`APP_PORT` 等变量为空时可能启动失败。

### 4.3 启动

```powershell
docker compose up --build -d
```

旧版 Docker Compose 也可能使用：

```powershell
docker-compose up --build -d
```

访问：

```text
http://localhost:3015
```

如果你修改了 `.env` 中的 `APP_PORT`，访问端口也要跟着变化。

### 4.4 常用管理命令

查看容器：

```powershell
docker compose ps
```

查看日志：

```powershell
docker compose logs -f
```

只看后端日志：

```powershell
docker logs -f bilinote-backend
```

停止服务：

```powershell
docker compose down
```

重新构建并启动：

```powershell
docker compose up --build -d
```

## 5. 部署方式三：源码部署

源码部署适合开发者或需要改代码的人。

### 5.1 克隆仓库并创建 `.env`

```powershell
git clone https://github.com/JefferyHcool/BiliNote.git
cd BiliNote
Copy-Item .env.example .env
```

Linux 或 macOS：

```bash
git clone https://github.com/JefferyHcool/BiliNote.git
cd BiliNote
cp .env.example .env
```

### 5.2 安装 FFmpeg

Windows：

1. 访问 `https://ffmpeg.org/download.html` 下载 Windows 版本。
2. 解压到固定目录，例如 `D:\tools\ffmpeg`。
3. 把 `D:\tools\ffmpeg\bin` 加入系统环境变量 `Path`。
4. 重新打开 PowerShell，执行：

```powershell
ffmpeg -version
```

macOS：

```bash
brew install ffmpeg
```

Ubuntu 或 Debian：

```bash
sudo apt update
sudo apt install ffmpeg
```

### 5.3 启动后端

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
```

Linux 或 macOS：

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

后端默认端口通常是：

```text
http://127.0.0.1:8483
```

### 5.4 启动前端

另开一个终端，在项目根目录执行：

```powershell
cd BillNote_frontend
pnpm install
pnpm dev
```

如果没有 `pnpm`：

```powershell
npm install -g pnpm
```

访问：

```text
http://localhost:3015
```

如果你的版本使用 `npm` 脚本，也可以参考官方文档中的：

```powershell
npm install
npm run start
```

具体以仓库 `BillNote_frontend/package.json` 为准。

## 6. `.env` 配置详解

BiliNote 的 `.env.example` 里已经给出默认配置。推荐做法是复制为 `.env` 后，只改你真正需要的项。

### 6.1 重要原则

1. `VITE_*` 是前端构建时变量，会被打进前端 JS 文件。
2. 改了 `VITE_*` 后，只重启容器通常不会生效，必须重新构建前端。
3. 非 `VITE_*` 的后端变量通常是运行时变量，改完后重新 `docker compose up -d` 即可。
4. 大模型 API Key 不建议写进 `.env`，应在前端“模型供应商”页面录入。
5. API Key、Cookie、数据库文件不要提交到公开仓库。

### 6.2 端口配置

```dotenv
BACKEND_PORT=8483
FRONTEND_PORT=3015
BACKEND_HOST=0.0.0.0
APP_PORT=3015
```

| 变量 | 作用 | 推荐值 | 说明 |
|---|---|---|---|
| `BACKEND_PORT` | 后端 FastAPI 端口 | `8483` | 源码或容器内部后端端口 |
| `FRONTEND_PORT` | 前端开发端口 | `3015` | 源码开发常用 |
| `BACKEND_HOST` | 后端监听地址 | `0.0.0.0` | 容器或服务器部署不要随意改 |
| `APP_PORT` | Docker 对外访问端口 | `3015` | 浏览器访问用端口 |

如果端口被占用，例如 `3015` 已经被其他服务使用，可以改成：

```dotenv
APP_PORT=3016
FRONTEND_PORT=3016
```

然后重新部署：

```powershell
docker compose up -d
```

访问：

```text
http://localhost:3016
```

### 6.3 前端访问后端配置

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8483
VITE_SCREENSHOT_BASE_URL=http://127.0.0.1:8483/static/screenshots
VITE_FRONTEND_PORT=3015
```

| 变量 | 作用 |
|---|---|
| `VITE_API_BASE_URL` | 前端请求后端 API 的基础地址 |
| `VITE_SCREENSHOT_BASE_URL` | 前端加载截图的基础地址 |
| `VITE_FRONTEND_PORT` | 前端开发服务端口 |

Docker Compose 生产部署通常通过 nginx 代理后端，这些值多作为回退。源码部署时，如果后端端口是 `8483`，保持默认即可。

如果你把后端端口改成 `9000`：

```dotenv
BACKEND_PORT=9000
VITE_API_BASE_URL=http://127.0.0.1:9000
VITE_SCREENSHOT_BASE_URL=http://127.0.0.1:9000/static/screenshots
```

改了 `VITE_*` 后需要重新构建前端：

```powershell
docker compose build frontend
docker compose up -d
```

### 6.4 生产环境与输出目录

```dotenv
ENV=production
STATIC=/static
OUT_DIR=./static/screenshots
NOTE_OUTPUT_DIR=note_results
IMAGE_BASE_URL=/static/screenshots
DATA_DIR=data
```

| 变量 | 作用 | 建议 |
|---|---|---|
| `ENV` | 运行环境 | 普通部署保持 `production` |
| `STATIC` | 静态资源路径 | 保持默认 |
| `OUT_DIR` | 截图输出目录 | 保持默认 |
| `NOTE_OUTPUT_DIR` | 笔记输出目录 | 保持默认 |
| `IMAGE_BASE_URL` | 笔记中引用截图的 URL 前缀 | 保持默认 |
| `DATA_DIR` | 数据目录 | 保持默认 |

除非你明确知道后端代码如何读取这些目录，否则不建议修改。

### 6.5 FFmpeg 配置

```dotenv
FFMPEG_BIN_PATH=
```

Docker 镜像已经内置 FFmpeg，通常留空。

源码部署时，如果系统 PATH 已经能识别 `ffmpeg`，也可以留空。如果不能识别，可填绝对路径，例如 Windows：

```dotenv
FFMPEG_BIN_PATH=D:\tools\ffmpeg\bin\ffmpeg.exe
```

Linux：

```dotenv
FFMPEG_BIN_PATH=/usr/bin/ffmpeg
```

### 6.6 语音识别配置

```dotenv
TRANSCRIBER_TYPE=fast-whisper
WHISPER_MODEL_SIZE=tiny
GROQ_TRANSCRIBER_MODEL=whisper-large-v3-turbo
```

| 变量 | 作用 | 可选值或示例 |
|---|---|---|
| `TRANSCRIBER_TYPE` | 选择语音识别引擎 | `fast-whisper`、`bcut`、`kuaishou`、`mlx-whisper`、`groq` |
| `WHISPER_MODEL_SIZE` | 本地 Whisper 模型大小 | `tiny`、`base`、`small`、`medium`、`large-v1`、`large-v2`、`large-v3`、`large-v3-turbo` |
| `GROQ_TRANSCRIBER_MODEL` | Groq 转写模型 | `whisper-large-v3-turbo` |

推荐新手先用：

```dotenv
TRANSCRIBER_TYPE=fast-whisper
WHISPER_MODEL_SIZE=tiny
```

原因：

1. `tiny` 模型体积小，首次启动下载快。
2. 内存占用低，不容易因为模型下载或加载导致容器 OOM。
3. 跑通流程后可以在前端“音频转写配置”中逐步切到 `base`、`small`、`medium`。

如果本机性能不足，但你有 Groq API，可以用：

```dotenv
TRANSCRIBER_TYPE=groq
GROQ_TRANSCRIBER_MODEL=whisper-large-v3-turbo
```

然后在前端“模型供应商”中配置 Groq 相关 API 信息。

## 7. AI 模型供应商配置

BiliNote 的大模型用于生成笔记、总结、问答等内容。语音识别只负责“听写”，大模型负责“理解和整理”。

### 7.1 不要把大模型 API Key 写进 `.env`

当前官方 `.env.example` 明确提醒：LLM API Key 不要写在 `.env` 中。部署完成后，应从前端“模型供应商”页面录入。这些 Key 会保存到 SQLite 数据库或配置目录中，并随容器数据持久化。

这样做的好处：

1. 减少误提交密钥到 Git 仓库的风险。
2. 可以在前端直接测试连通性。
3. 可以配置多个供应商和多个模型。

### 7.2 打开模型配置页面

1. 访问 BiliNote 前端页面。
2. 点击 BiliNote Logo 附近的“全局设置”或设置按钮。
3. 找到“AI 模型配置”。
4. 进入“模型供应商”或类似页面。

### 7.3 模型供应商需要填写什么

一般需要：

| 字段 | 含义 | 示例 |
|---|---|---|
| 供应商名称 | 方便自己识别 | `OpenAI`、`DeepSeek`、`Qwen`、`Groq`、`Ollama` |
| API Key | 服务商控制台生成的密钥 | `sk-...` |
| Base URL | OpenAI SDK 兼容接口地址 | `https://api.openai.com/v1` |
| 模型名称 | 具体模型 ID | `gpt-4o`、`deepseek-chat`、`qwen-plus` |

常见 Base URL 示例：

```text
OpenAI:   https://api.openai.com/v1
Ollama:   http://localhost:11434/v1
DeepSeek: 以 DeepSeek 官方控制台当前文档为准
Qwen:     以阿里云 DashScope 当前文档为准
```

不同供应商的接口地址可能变化，最终以服务商官方文档为准。

### 7.4 供应商配置流程

1. 新增或编辑供应商。
2. 填写 `API Key`。
3. 填写 `Base URL`。
4. 点击“测试连通性”。
5. 测试成功后保存供应商。
6. 切换到“模型配置”或“模型列表”。
7. 点击“刷新模型”。
8. 选择需要的模型并保存。
9. 回到首页，在“模型选择”下拉框中选择刚保存的模型。

### 7.5 模型选择建议

| 场景 | 建议 |
|---|---|
| 普通学习视频 | 选择价格适中、上下文较长的文本模型 |
| 长视频总结 | 选择上下文窗口更大的模型 |
| PPT、操作演示、图文混合视频 | 选择支持图片输入的多模态模型 |
| 本地隐私优先 | 使用 Ollama 或自部署 OpenAI 兼容接口 |
| 成本敏感 | 选择便宜模型，或先用短视频测试 token 消耗 |

### 7.6 多模态模型配置

BiliNote 支持“视频画面理解”时，会截取视频关键帧，并把图片发送给支持图像输入的大模型。

使用多模态功能前必须确认：

1. 你选择的模型确实支持图片输入。
2. 供应商接口兼容 BiliNote 的调用方式。
3. API Key 有对应模型权限。
4. 多模态模型价格通常高于纯文本模型，要留意账单。

如果模型不支持多模态，不要开启视频画面理解，只用“纯文字理解”即可。

## 8. 语音识别配置

BiliNote 强依赖语音识别。没有字幕的视频，需要先把音频转文字，才能让大模型总结。

### 8.1 支持的转写方式

| 转写器 | 特点 | 适合场景 |
|---|---|---|
| `fast-whisper` | 本地转写，常用、稳定 | 大多数本地和 Docker 用户 |
| `groq` | 云端 Whisper，速度快 | 本地 CPU 弱但有 Groq API |
| `mlx-whisper` | Apple Silicon 平台 | M 系列 Mac |
| `bcut` | 依赖外部服务，可能不稳定 | 特定场景 |
| `kuaishou` | 依赖外部服务，可能不稳定 | 特定场景 |

### 8.2 Whisper 模型大小选择

| 模型 | 速度 | 精度 | 资源占用 | 建议 |
|---|---|---|---|---|
| `tiny` | 最快 | 较低 | 很低 | 首次部署、低配机器 |
| `base` | 快 | 一般 | 低 | 普通中文视频入门 |
| `small` | 中等 | 较好 | 中等 | 日常推荐 |
| `medium` | 慢 | 更好 | 较高 | 需要较高识别质量 |
| `large-v3` | 更慢 | 高 | 高 | GPU 或高配机器 |
| `large-v3-turbo` | 较快 | 高 | 较高 | 想兼顾速度和质量 |

新手不要一开始就改成 `medium` 或 `large-v3`。首次启动时模型需要下载，大模型可能导致：

1. 下载很慢。
2. 容器内存不足。
3. 后端启动或首次任务卡住。

推荐路径：

```text
tiny -> base -> small -> medium -> large-v3
```

先跑通，再逐档升级。

### 8.3 前端音频转写配置

部署成功后，进入：

```text
设置 -> 音频转写配置
```

通常可以在这里调整：

1. 转写引擎。
2. Whisper 模型大小。
3. 是否下载或切换模型。
4. 当前模型是否就绪。

如果后端提示模型未就绪，先在这里下载或切换模型，不要反复提交视频任务。

## 9. Cookie 配置

Cookie 主要用于需要登录态的平台，例如抖音、快手。有些平台对未登录访问有限制，可能出现无法解析、403、只能获取低清资源等情况。

### 9.1 什么时候需要 Cookie

| 平台 | 是否常用 Cookie | 说明 |
|---|---|---|
| 哔哩哔哩 | 视视频而定 | 公开视频通常不需要，会员、限制内容可能需要 |
| YouTube | 视网络和字幕情况而定 | 公开视频通常不需要 |
| 抖音 | 经常需要 | 未登录接口限制较多 |
| 快手 | 经常需要 | 未登录接口限制较多 |

### 9.2 获取 Cookie 的通用方法

以抖音网页版为例：

1. 打开 `https://www.douyin.com/`。
2. 登录账号，推荐扫码登录。
3. 按 `F12` 打开开发者工具。
4. 切换到 `Network` 或“网络”标签页。
5. 刷新页面，或点击一个视频。
6. 找到 `www.douyin.com` 相关请求。
7. 点击请求，切到 `Headers` 或“标头”。
8. 在 `Request Headers` 中找到 `cookie:`。
9. 复制 `cookie:` 后面的完整字符串，不要复制 `cookie:` 这几个字。

### 9.3 Cookie 安全注意事项

Cookie 等同于一段登录凭证，必须当作密码处理：

1. 不要发给陌生人。
2. 不要提交到 GitHub。
3. 不要写进公开教程截图。
4. 不要贴到群聊或 issue。
5. 失效后重新获取并更新。
6. 如果怀疑泄露，退出网页登录状态或修改账号密码。

### 9.4 Cookie 在 BiliNote 中配置

通常在前端设置页中找到 Cookie 或下载配置相关页面，把复制到的 Cookie 字符串填入对应平台配置中并保存。

配置后建议先用一个短视频测试，确认能正常解析、下载和生成笔记。

## 10. 下载、代理和网络配置

BiliNote 会访问多个外部服务：

1. 视频平台，例如 B 站、YouTube、抖音、快手。
2. 大模型供应商，例如 OpenAI、DeepSeek、Qwen、Groq。
3. Whisper 模型下载源。
4. Docker 镜像源，例如 `ghcr.io`、`docker.io`。

如果你在国内网络环境下部署，常见问题是：

1. Docker 镜像拉不下来。
2. YouTube 视频无法下载。
3. OpenAI API 无法访问。
4. Whisper 模型下载慢。
5. 模型供应商连通性测试失败。

### 10.1 Docker 镜像问题

如果构建时报：

```text
dial tcp ... i/o timeout
```

可以尝试：

1. 使用预构建镜像，避免本地 build。
2. 配置 Docker Desktop 镜像加速。
3. 在 `.env` 中设置 `BASE_REGISTRY`，例如：

```dotenv
BASE_REGISTRY=docker.m.daocloud.io
```

然后：

```powershell
docker compose build
docker compose up -d
```

公共镜像源可用性经常变化，如果某个源不可用，需要更换当前可用源。

### 10.2 API 代理

BiliNote 新版本支持全局代理配置，通常可在设置页的下载配置或代理配置中设置。部分版本也支持使用环境变量兜底：

```dotenv
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
```

注意：

1. Docker 容器里的 `127.0.0.1` 指的是容器自己，不是宿主机。
2. Windows 或 macOS Docker Desktop 中，容器访问宿主机可以尝试：

```text
host.docker.internal
```

例如：

```dotenv
HTTP_PROXY=http://host.docker.internal:7890
HTTPS_PROXY=http://host.docker.internal:7890
```

3. 代理是否可用取决于你的本机代理软件是否允许局域网或 Docker 访问。

## 11. GPU 加速配置

GPU 主要用于本地 `fast-whisper` 转写。调用 OpenAI、DeepSeek、Groq 等云模型时，本机 GPU 不会加速大模型推理。

### 11.1 什么时候需要 GPU

适合使用 GPU 的情况：

1. 经常处理长视频。
2. 想使用 `medium`、`large-v3` 等较大 Whisper 模型。
3. 有 NVIDIA 显卡并且驱动环境正常。

不一定需要 GPU 的情况：

1. 只处理短视频。
2. 使用 `tiny`、`base`、`small`。
3. 使用 Groq 这类云端转写。
4. 只是用大模型总结文本。

### 11.2 NVIDIA GPU 前提

宿主机需要：

1. NVIDIA 显卡。
2. 较新的 NVIDIA 驱动。
3. `nvidia-smi` 正常输出。
4. Docker 部署时安装 NVIDIA Container Toolkit。

检查：

```powershell
nvidia-smi
```

Docker GPU 检查：

```powershell
docker run --rm --gpus all nvidia/cuda:12.4.1-base-ubuntu22.04 nvidia-smi
```

如果这条命令能列出显卡，说明 Docker 可以访问 GPU。

### 11.3 使用 GPU Compose

在 BiliNote 源码目录中：

```powershell
docker compose down
docker compose -f docker-compose.gpu.yml up --build -d
```

旧版命令：

```powershell
docker-compose down
docker-compose -f docker-compose.gpu.yml up --build -d
```

确认是否使用 GPU：

```powershell
docker logs bilinote-backend | Select-String -Pattern "cuda","CUDA","GPU"
```

Linux：

```bash
docker logs bilinote-backend | grep -i cuda
```

转写时也可以在宿主机执行：

```powershell
nvidia-smi
```

如果看到 Python 或相关进程占用显存，说明正在使用 GPU。

## 12. 使用流程

完成部署、模型供应商、转写器配置后，就可以生成笔记。

### 12.1 生成普通视频笔记

1. 打开 BiliNote 首页。
2. 选择视频平台，例如“哔哩哔哩”。
3. 粘贴视频链接，例如：

```text
https://www.bilibili.com/video/BVxxxxxx/
```

4. 在“模型选择”中选择已保存的大模型。
5. 选择笔记风格。
6. 选择笔记格式，例如是否插入截图、是否带时间戳、是否生成目录。
7. 点击“生成笔记”。
8. 等待任务完成。

### 12.2 纯文字理解与视频画面理解

BiliNote 常见有两类理解方式：

| 模式 | 流程 | 适合内容 |
|---|---|---|
| 纯文字理解 | 音频转写 -> 大模型总结 | 讲课、播客、访谈、知识讲解 |
| 视频画面理解 | 截取关键帧 -> 多模态模型理解 -> 总结 | PPT、代码演示、操作教程、图文混合视频 |

如果只是讲课类视频，优先用纯文字理解，成本低、速度快。

如果视频里大量信息在画面上，例如 PPT、软件操作、代码演示，可以开启视频画面理解，但必须使用支持图片输入的多模态模型。

### 12.3 笔记风格选择

常见风格：

| 风格 | 适合场景 |
|---|---|
| 精简风格 | 快速了解视频重点 |
| 详细风格 | 学习、复盘、系统整理 |
| 教程风格 | 操作步骤、编程教程、软件教学 |
| 学术风格 | 讲座、论文解读、理论课程 |
| 任务导向风格 | 项目会议、行动清单 |
| 会议纪要风格 | 会议、访谈、讨论 |
| 商业风格 | 财经、产品、市场分析 |
| 生活向风格 | vlog、纪录片 |

如果不确定，先用“详细风格”或“教程风格”。

## 13. 数据位置、备份与恢复

### 13.1 Docker 预构建镜像数据

如果使用 `docker run` 并挂载了命名卷：

```text
bilinote-data
bilinote-config
bilinote-static
bilinote-models
```

数据保存在 Docker 卷中。

查看卷：

```powershell
docker volume ls
```

### 13.2 Docker Compose 数据

官方 README 中提到，`docker-compose` 部署时常见数据在宿主机源码目录的 `backend` 下，例如：

| 路径 | 内容 |
|---|---|
| `backend/bili_note.db` | SQLite 数据库，可能包含供应商配置和笔记历史 |
| `backend/config/transcriber.json` | 转写配置 |
| `backend/static/screenshots/` | 视频截图 |
| `backend/uploads/` | 上传的视频 |
| `backend/models/` | Whisper 模型缓存 |

不同版本目录可能略有差异，以实际目录为准。

### 13.3 备份建议

Docker Compose 部署时，至少备份：

```text
backend/bili_note.db
backend/config/
backend/static/
backend/uploads/
backend/models/
```

如果使用 Docker 命名卷，需要用 `docker run --rm -v ...` 或 Docker Desktop 的卷管理功能导出。

### 13.4 重置配置

如果配置混乱，想保留代码但重置运行数据，可以在停止服务后删除数据库和配置文件。

危险操作，执行前先备份：

```powershell
docker compose down
Remove-Item .\backend\bili_note.db
Remove-Item .\backend\config\transcriber.json
docker compose up -d
```

如果路径不存在，说明你的版本数据位置不同，先不要强删，先确认实际文件。

## 14. 升级 BiliNote

### 14.1 Docker 预构建镜像升级

```powershell
docker pull ghcr.io/jefferyhcool/bilinote:latest
docker rm -f bilinote
docker run -d -p 80:80 `
  -v bilinote-data:/app/backend/data `
  -v bilinote-config:/app/backend/config `
  -v bilinote-static:/app/backend/static `
  -v bilinote-models:/app/backend/models `
  --name bilinote `
  ghcr.io/jefferyhcool/bilinote:latest
```

只要你没有删除命名卷，配置和历史数据会保留。

### 14.2 Docker Compose 升级

先备份 `backend` 中的重要数据，然后：

```powershell
git pull
docker compose down
docker compose up --build -d
```

如果改过 `.env.example` 中新增的变量，升级后建议对比：

```powershell
git diff .env.example
```

然后把新增必要项手动补到自己的 `.env` 中。

### 14.3 源码部署升级

```powershell
git pull
cd backend
pip install -r requirements.txt
cd ..\BillNote_frontend
pnpm install
pnpm dev
```

生产环境还需要重新构建或重新启动对应服务。

## 15. 常见问题排查

### 15.1 页面一直显示后端初始化中

先看容器状态：

```powershell
docker compose ps
```

再看后端日志：

```powershell
docker logs -f bilinote-backend
```

常见原因：

1. 后端仍在下载 Whisper 模型。
2. `WHISPER_MODEL_SIZE` 太大，内存不足。
3. `TRANSCRIBER_TYPE` 写错。
4. `.env` 没复制或变量为空。
5. 后端端口被占用。

处理建议：

```dotenv
TRANSCRIBER_TYPE=fast-whisper
WHISPER_MODEL_SIZE=tiny
```

然后：

```powershell
docker compose up -d
```

### 15.2 容器一直 restart 或 unhealthy

查看日志：

```powershell
docker logs -f bilinote-backend
```

如果卡在转写器初始化：

1. 检查 `TRANSCRIBER_TYPE`。
2. Docker/Linux 不要使用 `mlx-whisper`，它主要面向 Apple Silicon。
3. 把 `WHISPER_MODEL_SIZE` 改回 `tiny`。

如果首次跑视频时容器被 kill：

1. 大概率是内存不足。
2. 先用 `tiny` 跑通。
3. 关闭其他占内存程序。
4. 有条件再启用 GPU 或云端转写。

### 15.3 改了 `.env` 不生效

先判断改的是哪类变量。

如果改的是：

```text
VITE_API_BASE_URL
VITE_SCREENSHOT_BASE_URL
VITE_FRONTEND_PORT
```

需要重新构建前端：

```powershell
docker compose build frontend
docker compose up -d
```

如果改的是：

```text
TRANSCRIBER_TYPE
WHISPER_MODEL_SIZE
FFMPEG_BIN_PATH
APP_PORT
```

通常：

```powershell
docker compose up -d
```

即可。

### 15.4 前端空白或 502

可能是 nginx 已经启动，但后端还没 ready。

检查：

```powershell
docker compose ps
docker logs -f bilinote-backend
```

如果 backend 长期 unhealthy，先解决后端日志中的错误。

### 15.5 模型连通性测试失败

检查：

1. API Key 是否复制完整。
2. Base URL 是否正确。
3. 模型供应商是否支持 OpenAI SDK 兼容接口。
4. 当前网络是否能访问供应商。
5. 代理是否配置正确。
6. API Key 是否有对应模型权限。
7. 账户余额是否充足。

不要只看 `/v1/models` 是否能访问。有些供应商不实现模型列表接口，但聊天补全接口可用；以 BiliNote 前端的连通性测试结果和实际生成任务为准。

### 15.6 视频下载失败

检查：

1. 视频链接是否能在浏览器打开。
2. 平台是否需要登录 Cookie。
3. Cookie 是否过期。
4. 是否需要代理。
5. 视频是否是会员、地区限制或私密内容。
6. 本地 FFmpeg 是否可用。

先用公开视频、短视频测试，减少变量。

### 15.7 Whisper 模型下载慢或失败

建议：

1. 先使用 `tiny`。
2. 配置代理。
3. 检查容器是否能访问模型下载源。
4. 如果模型文件损坏，删除对应模型缓存后重下。

Docker Compose 中常见模型缓存位置可能在：

```text
backend/models/
```

删除前先确认路径，避免误删其他数据。

### 15.8 生成结果很差

可能原因：

1. 转写模型太小，语音识别错误多。
2. 视频音质差或背景音乐太大。
3. 选用的大模型能力较弱。
4. 视频太长，被分段后上下文损失。
5. 笔记风格不适合当前内容。

优化顺序：

1. 把 Whisper 从 `tiny` 升到 `base` 或 `small`。
2. 换一个更强的大模型。
3. 对 PPT、操作演示开启多模态理解。
4. 使用“详细风格”或“教程风格”。
5. 先用短视频确认配置，再处理长视频。

### 15.9 Docker 构建很慢

原因可能是：

1. Python、Node、nginx 基础镜像拉取慢。
2. npm 或 pnpm 依赖下载慢。
3. pip 依赖下载慢。
4. GPU 镜像很大。

建议：

1. 优先使用预构建镜像。
2. 配置 Docker 镜像加速。
3. 配置 `PIP_INDEX`。
4. GPU 镜像首次构建本来就很慢，需耐心等待。

## 16. 推荐配置组合

### 16.1 低配电脑

```dotenv
TRANSCRIBER_TYPE=fast-whisper
WHISPER_MODEL_SIZE=tiny
```

模型选择：

```text
便宜、速度快、上下文够用的文本模型
```

适合：

```text
短视频、普通讲解视频、首次跑通流程
```

### 16.2 普通笔记工作流

```dotenv
TRANSCRIBER_TYPE=fast-whisper
WHISPER_MODEL_SIZE=small
```

模型选择：

```text
DeepSeek、Qwen、OpenAI 或其他 OpenAI SDK 兼容供应商
```

适合：

```text
学习视频、教程视频、会议整理
```

### 16.3 长视频或高质量转写

```dotenv
TRANSCRIBER_TYPE=fast-whisper
WHISPER_MODEL_SIZE=medium
```

或 GPU 环境：

```dotenv
TRANSCRIBER_TYPE=fast-whisper
WHISPER_MODEL_SIZE=large-v3
```

适合：

```text
长课程、讲座、重要资料整理
```

### 16.4 本地机器弱但网络和 API 可用

```dotenv
TRANSCRIBER_TYPE=groq
GROQ_TRANSCRIBER_MODEL=whisper-large-v3-turbo
```

适合：

```text
CPU 弱、不想下载 Whisper 模型、希望转写更快
```

### 16.5 图文混合视频

转写：

```dotenv
TRANSCRIBER_TYPE=fast-whisper
WHISPER_MODEL_SIZE=small
```

模型：

```text
选择支持图片输入的多模态模型
```

前端：

```text
开启视频画面理解，设置合适的采样间隔和拼图尺寸
```

适合：

```text
PPT 课程、软件操作、代码演示、设计教程
```

## 17. 安全建议

1. 不要把 `.env`、数据库、Cookie、API Key 提交到 Git。
2. 不要把包含 Cookie 或 API Key 的截图发到公开平台。
3. 给大模型 API 设置额度限制，避免误调用造成高额账单。
4. 部署到公网时，建议加反向代理、HTTPS 和访问控制。
5. 如果只是自己用，不建议直接把服务裸露到公网。
6. 定期备份数据库和配置目录。
7. 升级前先备份。
8. 使用第三方聚合 API 时，确认其计费、隐私和稳定性。

## 18. 最小跑通检查清单

部署完成后，按这个顺序检查：

1. 页面能打开。
2. 后端日志没有持续报错。
3. 进入设置页，配置模型供应商。
4. 模型连通性测试通过。
5. 保存至少一个模型。
6. 转写器选择 `fast-whisper`。
7. Whisper 模型先用 `tiny`。
8. 用一个 1 到 3 分钟的公开视频测试。
9. 确认能生成 Markdown 笔记。
10. 再逐步开启截图、多模态、大模型 Whisper、Cookie、GPU 等高级配置。

## 19. 参考链接

1. BiliNote 官方仓库：`https://github.com/JefferyHcool/BiliNote`
2. BiliNote 官方文档：`https://docs.bilinote.app/`
3. BiliNote Docker 部署文档：`https://docs.bilinote.app/deployment/docker`
4. BiliNote 模型配置文档：`https://docs.bilinote.app/guide/model-config`
5. BiliNote 语音识别文档：`https://docs.bilinote.app/guide/transcription`
6. BiliNote Cookie 配置文档：`https://docs.bilinote.app/guide/cookies`
7. FFmpeg 官网：`https://ffmpeg.org/`
8. Docker 官网：`https://www.docker.com/`

