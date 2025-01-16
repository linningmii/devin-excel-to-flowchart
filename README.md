# Excel to Flowchart Converter

一个将Excel文件转换为流程图的在线工具 | An online tool to convert Excel files to flowcharts

## 功能特点 | Features

- 📊 Excel文件上传和解析 | Excel file upload and parsing
- 🔄 动态流程图生成 | Dynamic flowchart generation
- 🈺 完整中文支持 | Full Chinese text support
- 🎨 分层布局和配色 | Hierarchical layout with color coding
- 💾 导出为Draw.io格式 | Export to Draw.io format
- 📸 导出预览图片 | Export preview image
- 📱 响应式设计 | Responsive design

## 安装 | Installation

```bash
# 安装依赖 | Install dependencies
pnpm install

# 启动开发服务器 | Start development server
pnpm dev

# 构建生产版本 | Build for production
pnpm build
```

## 使用方法 | Usage

1. 上传Excel文件 | Upload Excel file
   - 支持.xlsx和.xls格式 | Supports .xlsx and .xls formats
   - 自动检测层级结构 | Automatically detects hierarchical structure

2. 查看流程图 | View flowchart
   - 使用鼠标拖拽移动节点 | Drag nodes to move them
   - 滚轮缩放视图 | Use mouse wheel to zoom
   - 点击节点查看详情 | Click nodes for details

3. 导出 | Export
   - 导出为Draw.io格式 (.drawio) | Export as Draw.io format (.drawio)
   - 导出为图片 (.png) | Export as image (.png)

## Excel文件格式 | Excel File Format

Excel文件应包含以下列：
Excel file should contain the following columns:

- L0: 顶层节点 | Top level nodes
- L1-L6: 子层级节点 | Sub-level nodes

### 示例数据 | Sample Data

项目包含示例数据供测试：
The project includes sample data for testing:

1. 位置 | Location: `sample_data/sample.xlsx`
2. 生成脚本 | Generator Script: `scripts/generate_sample.py`

运行示例 | Run Example:
```bash
# 使用pnpm安装依赖 | Install dependencies with pnpm
pnpm install

# 启动开发服务器 | Start dev server
pnpm dev

# 使用示例数据测试 | Test with sample data
1. 打开 http://localhost:5173
2. 上传 sample_data/sample.xlsx
3. 查看生成的流程图
```

### Draw.io导出说明 | Draw.io Export Notes

虽然使用ReactFlow绘制流程图，但提供Draw.io导出功能是为了：
While we use ReactFlow for visualization, Draw.io export is provided for:

1. 与Draw.io编辑器的兼容性 | Compatibility with Draw.io editor
2. 后续编辑和修改 | Further editing and modifications
3. 团队协作支持 | Team collaboration support

## 技术栈 | Tech Stack

- React + TypeScript
- Vite
- ReactFlow
- TailwindCSS
- XLSX

## 开发 | Development

```bash
# 运行测试 | Run tests
pnpm test

# 代码检查 | Lint code
pnpm lint
```

## 许可证 | License

MIT

## 贡献 | Contributing

欢迎提交Issue和Pull Request | Issues and Pull Requests are welcome
