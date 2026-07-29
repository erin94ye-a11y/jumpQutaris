# Qutara 美股波段策略回测平台设计规格

日期：2026-07-29  
状态：待用户最终评审

## 1. 产品目标

Qutara Backtest 是一个独立于 Jump Qutaris 企业官网的专业 Web 应用，面向测试持有周期为 7–15 个交易日的美股日线波段策略。

第一版交付可实际启动的完整闭环：获取 Alpaca 日线行情、配置策略、异步运行回测、展示图表与指标、保存并重新运行策略。首版不支持高频、逐笔成交、实盘交易或任意用户 Python 代码执行。

## 2. 用户与核心任务

目标用户是希望通过可视化参数构建和验证美股波段策略的研究者。用户需要完成以下核心任务：

1. 输入股票代码，或从行业分类中选择股票。
2. 设置日期、资金、仓位、信号、退出和交易成本。
3. 提交异步回测并查看任务状态。
4. 分析 K 线买卖点、资金曲线、回撤、基准和逐笔交易。
5. 保存策略版本并使用相同假设重新运行。

## 3. MVP 范围

### 3.1 包含

- 美股常规交易时段日线。
- 单只股票及小型自选股票池。
- MA、RSI、成交量突破买入条件。
- 止盈、止损、移动止损和最长持有交易日。
- 手续费、滑点、单次仓位、总仓位上限和成交量限制。
- 累计收益、年化收益、胜率、盈亏比、最大回撤、夏普比率和交易次数。
- K 线、买卖点、资金曲线、回撤曲线和交易记录。
- SPY、QQQ或行业ETF基准比较。
- 策略保存、版本化、修改和重新运行。
- 数据范围、数据 feed、复权、交易时段及执行成本披露。
- 缺失与异常数据的显式记录和提示。

### 3.2 延后

- 全市场历史成分股扫描。
- 分钟线、高频及逐笔回测。
- 任意 Python 策略代码执行。
- 实盘下单和券商账户连接。
- 复杂多腿订单和期权。
- 多租户团队协作与策略分享。

## 4. 界面结构

首版采用单一研究工作台，视觉上延续 Qutara 的黑、白、红品牌语言，但信息密度高于企业官网。

- 左侧参数区：股票池、日期、资金、仓位、信号、退出和成本。
- 中央研究区：K 线、成交量、买卖点及指标叠加。
- 右侧结果区：任务状态、核心收益及风险指标。
- 下方分析区：资金曲线、回撤、基准比较、交易记录和回测假设。
- 策略库：保存、复制、版本修改与重新运行。

桌面使用三栏布局；平板将参数区收为抽屉，图表和结果保持主视图。核心操作必须支持键盘操作，并为颜色编码提供文字或形状辅助。

在实现前将生成三个独立的桌面工作台视觉方向，用户选择后才进入界面开发。

## 5. 系统架构

项目在现有仓库内使用 `qutara-backtest/` 隔离目录，不修改现有官网页面和资源。

```text
Browser
  -> Next.js Web
  -> FastAPI REST API
       -> PostgreSQL
       -> Redis -> Celery Worker -> Backtest Engine
       -> DuckDB -> Partitioned Parquet
       -> Alpaca Market Data API
```

采用模块化单体和独立异步 Worker：

- Next.js、TypeScript 和 Tailwind CSS 构建前端。
- TradingView Lightweight Charts 作为 K 线主图；必要时使用 ECharts 绘制组合分析图。
- FastAPI 提供认证、策略、行情、任务和结果 API。
- PostgreSQL 保存用户、策略版本、任务、指标和交易记录。
- Redis 作为 Celery broker、任务状态和短期缓存。
- Celery Worker 执行下载、校验和回测。
- pandas、NumPy和vectorbt执行主要向量化计算。
- 仅在路径依赖订单逻辑无法可靠向量化时使用 Backtrader。
- Parquet 保存行情，DuckDB负责区间读取和批量查询。

## 6. 推荐目录

```text
qutara-backtest/
├── apps/web/
│   ├── src/app/
│   ├── src/components/
│   ├── src/features/
│   ├── src/lib/
│   └── tests/
├── services/api/
│   ├── app/api/
│   ├── app/auth/
│   ├── app/backtest/
│   ├── app/market_data/
│   ├── app/models/
│   ├── app/repositories/
│   ├── app/workers/
│   ├── migrations/
│   └── tests/
├── data/market/
│   ├── raw/
│   ├── adjusted/
│   └── manifests/
├── infra/
│   ├── docker-compose.yml
│   └── scripts/
├── docs/
├── .env.example
├── .gitignore
├── Makefile
└── README.md
```

## 7. 数据库设计

### 7.1 用户与策略

- `users`: `id`, `email`, `password_hash`, `created_at`, `updated_at`。
- `strategies`: `id`, `user_id`, `name`, `description`, `current_version_id`, timestamps。
- `strategy_versions`: `id`, `strategy_id`, `version`, `config_json`, `config_hash`, `created_at`。版本不可变。

### 7.2 回测

- `backtest_runs`: `id`, `user_id`, `strategy_version_id`, `status`, `parameters_json`, `data_manifest_id`, `engine_version`, timestamps, `error_code`, `error_detail`。
- `backtest_metrics`: `run_id`, total/annual return, win rate, profit factor, max drawdown, Sharpe ratio, trade count。
- `backtest_trades`: entry/exit dates and prices, quantity, fees, slippage, realized PnL, holding days and exit reason。
- `backtest_series`: `run_id`, `series_type`, `data_jsonb`。规模扩大后迁移到 Parquet。
- `benchmark_results`: `run_id`, benchmark symbol, metrics and series。

### 7.3 行情与审计

- `instruments`: 当前代码、名称、交易所、行业、是否活跃。
- `symbol_history`: 同一证券的历史代码有效区间。
- `corporate_actions`: 拆股、分红、合并、更名等事件及原始载荷。
- `market_data_manifests`: provider、feed、复权方式、范围、文件、校验值、抓取时间和质量状态。
- `data_quality_events`: 缺失、重复、异常和排除记录。

行情明细不写入 PostgreSQL；数据库仅保存索引、清单、审计信息和业务结果。

## 8. Alpaca 数据方案

### 8.1 获取

使用 Alpaca Historical Stock Bars API，固定 `timeframe=1Day`。下载器必须处理 `next_page_token`、429限流、可重试的5xx错误和部分分页失败。

数据 feed 显式保存：订阅允许时使用 SIP，否则使用 IEX。IEX 回测必须提示成交量只覆盖 IEX，成交量突破和流动性限制的可信度低于 SIP。

### 8.2 缓存

Parquet按 provider、feed、timeframe、symbol、year 分区。写入采用临时文件、校验、原子替换，避免失败任务留下半成品。DuckDB只读取通过质量检查的分区。

### 8.3 复权与公司行动

同时缓存原始数据和复权对照数据。交易模拟使用原始成交价格，并根据公司行动显式调整持仓数量和现金；复权序列用于指标验证，禁止重复计入分红。

使用 Alpaca `asof` 和本地 `symbol_history` 解析股票代码变化。每次回测绑定不可变的数据清单，后续数据更新不得静默改变历史结果。

### 8.4 数据质量

检查时间排序、重复日期、OHLC关系、负成交量、交易日缺失、异常跳变和公司行动一致性。不得自动前向填充价格。存在缺失时任务失败，或在用户明确选择的宽松模式下排除相关股票并显示原因。

## 9. 回测语义

- 所有指标只能读取当前及更早K线。
- 当日收盘后生成信号，信号整体延迟一根K线，默认次日开盘成交。
- 不允许使用当日收盘信号在同日收盘成交。
- 持有期按实际交易日计数，不按自然日计数。
- 交易所日历决定有效交易日和提前收市日。
- 开盘跳空越过止损或止盈时，使用开盘可成交价格加滑点。
- 日线内同时触发止损和止盈时，默认采取止损先发生的保守路径。
- 移动止损的当日阈值只能基于前一交易日结束时可见的信息。
- 成交量限制按指定 feed 的当日可见成交量计算，并在结果中披露 feed。
- 每次运行保存引擎版本、策略快照、数据清单和全部执行假设。

## 10. API 边界

主要资源：

- `/api/v1/auth/*`
- `/api/v1/instruments` 与 `/api/v1/sectors`
- `/api/v1/market-data/bars`
- `/api/v1/strategies` 与 `/api/v1/strategies/{id}/versions`
- `/api/v1/backtests`
- `/api/v1/backtests/{id}`
- `/api/v1/backtests/{id}/trades`
- `/api/v1/backtests/{id}/series`

创建回测返回 `202 Accepted` 和任务 ID。前端轮询状态；第一版不依赖 WebSocket。所有写接口执行用户资源权限检查。

## 11. 安全与配置

- Alpaca、数据库和 Redis 凭据只通过服务端环境变量注入。
- `.env`、Parquet缓存、日志和任务结果导出默认加入 `.gitignore`。
- 仓库仅提交无密钥的 `.env.example`。
- 密码使用现代自适应哈希算法。
- API输入使用严格模式校验并限制日期跨度、股票数量和并发任务数。
- 日志不得记录密钥、密码、认证令牌或完整敏感请求头。
- MVP不执行用户提交的任意代码。

## 12. 错误处理

- Alpaca认证错误：任务失败并返回可操作配置提示。
- 限流或暂时故障：指数退避重试，超过上限后保留失败原因。
- 缺失数据：创建质量事件，不静默填充。
- 参数无效：任务入队前返回结构化422错误。
- Worker中断：任务可识别为失联并安全重试；结果写入必须幂等。
- 前端显示失败阶段、原因和建议操作，不只显示通用错误。

## 13. 测试策略

### 13.1 回测核心

- 修改未来K线不得改变历史信号。
- 收盘信号只能在下一交易日成交。
- 开盘跳空止损、止盈和滑点计算。
- 同日止盈止损冲突采用保守路径。
- 固定与移动止损不读取未来最高价。
- 第7和第15个交易日持有边界。
- 手续费、滑点、仓位和成交量限制。
- 拆股后股数与持仓价值连续。
- 分红只计入一次。
- 缺失数据产生失败或显式排除记录。

### 13.2 系统

- Alpaca分页、限流和重试契约测试。
- Parquet缓存写入和DuckDB读取集成测试。
- Celery任务幂等和失败恢复测试。
- API认证与资源隔离测试。
- Next.js类型检查、组件测试和生产构建。
- 桌面和平板核心流程视觉与交互检查。

每个实施阶段必须运行相关单元测试、类型检查、lint和生产构建；发现失败时在进入下一阶段前修复。

## 14. 分阶段实施

### 阶段0：工程基础

初始化隔离项目、Next.js、FastAPI、Docker Compose、PostgreSQL、Redis、Alembic、Celery、环境变量示例和统一检查命令。

### 阶段1：行情链路

实现 Alpaca 日线获取、分页重试、Parquet缓存、DuckDB查询、公司行动、交易日历和质量报告。

### 阶段2：回测核心

实现指标、信号延迟、订单模拟、风险退出、成本、组合限制、指标和基准，并完成核心单元测试。

### 阶段3：用户闭环

实现参数工作台、异步运行、图表、指标、交易记录、假设披露和策略版本管理。

### 阶段4：认证与交付

实现账户和权限，完成README、初始化脚本、示例数据、全量测试和构建验证。

## 15. MVP 完成标准

- 新用户可本地启动前端、API、Worker、PostgreSQL和Redis。
- 配置 Alpaca 密钥后可下载并缓存真实美股日线。
- 用户可配置策略并完成异步回测。
- 结果可显示全部指定指标、图表、基准和交易记录。
- 策略可保存、修改版本并重新运行。
- 结果明确披露数据和执行假设。
- 未来函数、持有期、止盈止损、手续费及公司行动测试通过。
- `.env.example`、数据库迁移、README和本地启动命令齐全。
- 现有企业官网文件未被覆盖或改写。
