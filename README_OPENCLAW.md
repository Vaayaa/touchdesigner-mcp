# OpenClaw Optimized TouchDesigner MCP

Forked from [8beeeaaat/touchdesigner-mcp](https://github.com/8beeeaaat/touchdesigner-mcp) for OpenClaw integration.

## 主要优化

### 1. 新增 `connect_td_nodes` 工具

解决节点连接问题，提供更友好的错误信息：

```typescript
// 使用方式
{
  tool: "connect_td_nodes",
  params: {
    sourcePath: "/project1/noise_tex",
    destinationPath: "/project1/blur"
  }
}
```

### 2. 预设网络模板 (规划中)

```
audio_in → audio_ana → audio_out
noise_tex → blur → composite → final_out
```

### 3. 更好的错误信息

```
❌ 旧错误: "list assignment index out of range"

✅ 新错误:
   "Cannot connect /project1/blur to /project1/noise_tex.
    The destination node may not have available input ports.
    Try checking if blur is a TOP/CHOP/SOP that accepts inputs."
```

## 分支结构

| 分支 | 用途 |
|------|------|
| `main` | 原始上游代码 |
| `feature/connect-nodes-tool` | 新增连接工具 |
| `feature/create-network-template` | 预设模板系统 |

## 开发计划

- [x] 定义 connect_td_nodes 工具 schema
- [ ] 实现工具处理器
- [ ] 添加单元测试
- [ ] 集成到主分支
- [ ] 添加预设模板

## 安装

```bash
npm install touchdesigner-mcp-server
```

## 使用

```bash
# 启动 MCP 服务器
npx touchdesigner-mcp-server --stdio

# 或者 HTTP 模式
npx touchdesigner-mcp-server --mcp-http-port=6280
```

## 参考

- [原始项目](https://github.com/8beeeaaat/touchdesigner-mcp)
- [TouchDesigner Python API](https://docs.derivative.ca/Python_Classes_and_Modules)
- [OpenClaw](https://github.com/openclaw/openclaw)
