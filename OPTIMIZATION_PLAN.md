# TouchDesigner MCP - OpenClaw 优化计划

Forked from: https://github.com/8beeeaaat/touchdesigner-mcp
Maintained by: Vaayaa/OpenClaw

## 当前问题

### 1. 节点连接问题
**问题**: 无法通过 MCP 直接连接两个节点
**原因**: 需要使用 `node.setInputs([src])` 方法，而不是直接赋值

**现有 workaround**:
```python
# 需要通过 execute_python_script 调用
script = """
import td
td.op('/project1/dst').setInputs([td.op('/project1/src')])
"""
```

### 2. 缺少直接的连接工具
**当前**: 只能通过 `execute_python_script` 间接连接

## 优化方案

### Priority 1: 新增 `connect_nodes` 工具

```typescript
// 新增工具定义
{
  name: "connect_td_nodes",
  description: "Connect two TouchDesigner nodes together",
  inputSchema: {
    type: "object",
    properties: {
      sourcePath: {
        type: "string",
        description: "Source node path (e.g., '/project1/noise_tex')"
      },
      destinationPath: {
        type: "string",
        description: "Destination node path (e.g., '/project1/blur')"
      },
      inputIndex: {
        type: "number",
        default: 0,
        description: "Input index on destination node"
      }
    },
    required: ["sourcePath", "destinationPath"]
  }
}
```

### Priority 2: 新增 `create_network` 工具

创建预定义的完整网络模板：

```typescript
{
  name: "create_td_network",
  description: "Create a pre-defined node network with connections",
  inputSchema: {
    type: "object",
    properties: {
      template: {
        type: "string",
        enum: ["audio-reactive", "particle-system", "3d-sphere", "video-player"],
        description: "Network template to create"
      },
      parentPath: {
        type: "string",
        default: "/project1",
        description: "Parent path for the network"
      },
      prefix: {
        type: "string",
        default: "",
        description: "Prefix for node names"
      }
    },
    required: ["template"]
  }
}
```

### Priority 3: 预设模板

#### Audio Reactive Template
```
audio_in (audiostreaminCHOP)
    ↓
audio_ana (analyzeCHOP)
    ↓
audio_out (nullCHOP)
```

#### Visual Chain Template
```
noise_tex (noiseTOP) → blur (blurTOP) → composite (compositeTOP) → out (outTOP)
```

#### 3D Sphere Template
```
sphere (sphereSOP)
    ↓
sphere_noise (noiseSOP)
    ↓
sphere_mat (constantMAT)
    ↓
sphere_geo (geoCOMP)
    ↓
camera (cameraCOMP)
light (lightCOMP)
render (baseCOMP)
```

### Priority 4: 增强错误信息

```typescript
// 当前
"list assignment index out of range"

// 优化后
"Cannot connect ${src} to ${dst}. The destination node may not have input ports available. Try checking if ${dst} is a TOP/CHOP/SOP that accepts inputs."
```

### Priority 5: 中文文档

- README_zh.md
- 常见问题解答
- 示例代码

## 开发计划

### Day 1: connect_nodes 工具
- [ ] 定义工具 schema
- [ ] 实现 connect_nodes 处理器
- [ ] 添加单元测试
- [ ] 更新文档

### Day 2: create_network 工具
- [ ] 设计模板格式
- [ ] 实现模板引擎
- [ ] 创建常用模板
- [ ] 添加测试

### Day 3: 错误信息优化
- [ ] 收集常见错误
- [ ] 编写友好错误信息
- [ ] 添加故障排除指南

### Day 4: 文档
- [ ] 中文 README
- [ ] API 文档
- [ ] 示例教程

## 技术栈

- TypeScript (ESM)
- Zod (验证)
- OpenAPI (代码生成)
- Vitest (测试)
- Biome (格式)

## 参考

- 原始项目: https://github.com/8beeeaaat/touchdesigner-mcp
- MCP SDK: @modelcontextprotocol/sdk
- TouchDesigner Python API: https://docs.derivative.ca/
