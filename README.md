# kiddo-plan

宝贝计划 - 小孩成长积分管理系统

## 在线部署（推荐）

以下步骤通过 Cloudflare 网站完成，无需安装任何软件。

### 第一步：Fork 项目到你的 GitHub

1. 打开项目 GitHub 页面
2. 点击右上角 **Fork** 按钮，将项目复制到你的 GitHub 账号下

### 第二步：创建 Cloudflare 账号

1. 打开 https://dash.cloudflare.com/sign-up
2. 输入邮箱和密码，注册免费账号

### 第三步：创建 D1 数据库

1. 登录 Cloudflare Dashboard
2. 左侧菜单点击 **D1 SQL 数据库**
3. 点击 **创建数据库**
4. 数据库名称输入 `kiddo-plan-db`，点击 **创建**
5. 进入数据库，点击 **控制台** 标签
6. 粘贴以下 SQL，点击 **执行**：

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  is_disabled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS children (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS presets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  category TEXT NOT NULL DEFAULT 'custom',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS score_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  preset_id INTEGER,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (preset_id) REFERENCES presets(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_children_user_id ON children(user_id);
CREATE INDEX IF NOT EXISTS idx_presets_user_id ON presets(user_id);
CREATE INDEX IF NOT EXISTS idx_score_logs_child_id ON score_logs(child_id);
CREATE INDEX IF NOT EXISTS idx_score_logs_created_at ON score_logs(created_at);
```

7. 返回 D1 页面，复制 **数据库 ID**（一串字母数字）

### 第四步：创建 KV 命名空间

1. 左侧菜单点击 **Workers 和 Pages**
2. 点击 **KV** 标签
3. 点击 **创建命名空间**，名称输入 `kiddo-plan-kv`
4. 创建后复制 **命名空间 ID**

### 第五步：部署应用（Worker + 前端）

只需部署一个 Worker，它会同时提供 API 接口和前端页面。

1. 在 Cloudflare Dashboard 左侧菜单点击 **Workers 和 Pages**
2. 点击 **创建应用程序** → **连接到 Git**
3. 授权 Cloudflare 访问你的 GitHub
4. 选择你 Fork 的 `kiddo-plan` 仓库
5. **构建配置**：
   - 构建命令：`pnpm run build && cd worker && npm install`
   - 部署命令：`cd worker && npx wrangler deploy`
   - 输出目录：`dist`
   - 根目录：`/`
6. 点击 **保存并部署**
7. 部署完成后，点击 Worker 名称进入详情页
8. 点击 **设置** → **变量和机密**，添加以下变量：

| 变量名                  | 值             | 说明                         |
| ----------------------- | -------------- | ---------------------------- |
| `JWT_SECRET`            | 随机32位字符串 | 用于加密登录凭证，可点击生成 |
| `ADMIN_USERNAME`        | admin          | 管理员用户名，自定义         |
| `ADMIN_PASSWORD`        | 你的密码       | 管理员密码，自定义           |
| `MAX_USERS`             | 50             | 最多注册用户数               |
| `MAX_CHILDREN_PER_USER` | 5              | 每个用户最多添加小孩数       |

9. 点击 **设置** → **绑定**，添加以下绑定：

| 绑定类型    | 名称 | 资源                            |
| ----------- | ---- | ------------------------------- |
| D1 数据库   | db   | 选择第三步创建的`kiddo-plan-db` |
| KV 命名空间 | kv   | 选择第四步创建的`kiddo-plan-kv` |

10. 保存后需要重新部署才能生效

### 第六步：开始使用

1. 打开 Worker URL（如 `https://kiddo-plan-worker.xxx.workers.dev`）
2. 使用第五步配置的管理员账号登录
3. 开始添加小孩、设置预设项、记录积分！

---

## 本地开发

需要先安装 [Node.js](https://nodejs.org/)（版本 18 或更高）和 [pnpm](https://pnpm.io/)。

```bash
# 安装依赖
pnpm install

# 启动前端开发服务
pnpm dev

# 启动 Worker 本地开发
cd worker
pnpm install
pnpm dev
```

本地开发时，需要在 `worker/wrangler.toml` 中添加数据库绑定（不要提交到 Git）：

```toml
[[d1_databases]]
binding = "db"
database_name = "kiddo-plan-db"
database_id = "你的D1数据库ID"

[[kv_namespaces]]
binding = "kv"
id = "你的KV命名空间ID"
```

## 项目结构

```
kiddo-plan/
├── src/                    # 前端页面
│   ├── pages/              # 各个页面
│   ├── stores/             # 数据管理
│   ├── i18n/               # 中英文翻译
│   └── utils/              # 工具函数
├── worker/                 # 后端 API
│   ├── src/routes/         # 各个接口
│   └── schema.sql          # 数据库建表语句
└── README.md
```

## 功能说明

### 管理员

- 使用配置的账号登录
- 管理用户：查看、启用/禁用、删除
- 也可以像普通用户一样使用所有功能

### 普通用户

- 注册账号并登录
- 添加小孩（最多5个，可配置）
- 设置预设加分/扣分项
- 为小孩记录积分
- 查看积分统计仪表盘
  - 总积分、今日/本周/本月变化
  - 积分趋势折线图
  - 项目占比饼图
  - 多小孩积分排行
  - 最近记录列表

## 遇到问题？

- 注册人数已满：联系管理员
- 忘记密码：联系管理员重置
- 其他问题：在 GitHub 提交 Issue
