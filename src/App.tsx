import * as React from "react"
import { useState, useCallback } from "react"
import { read, utils } from 'xlsx'
import ReactFlow, { 
  Node, 
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position
} from 'reactflow'
import 'reactflow/dist/style.css'
import './App.css'
import "./index.css"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Button } from "./components/ui/button"
import { Alert, AlertDescription } from "./components/ui/alert"
import { Upload, Download, Camera } from 'lucide-react'
import html2canvas from 'html2canvas'

interface ExcelData {
  [key: string]: string;
}

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [error, setError] = useState<string | null>(null)

  const processExcelData = (data: ExcelData[]) => {
    // Detect columns dynamically
    const columns = Object.keys(data[0] || {})
    const detectedLevels = columns.filter(col => 
      col === 'Unnamed: 0' || (col.startsWith('L') && !isNaN(Number(col.slice(1))))
    )
    
    const newNodes: Node[] = []
    const newEdges: Edge[] = []
    const nodeMap = new Map<string, string>()
    const levelCounts = new Array(detectedLevels.length).fill(0)
    const levelColors = [
      'rgb(239 68 68)', // L0 - red
      'rgb(249 115 22)', // L1 - orange
      'rgb(234 179 8)', // L2 - yellow
      'rgb(34 197 94)', // L3 - green
      'rgb(59 130 246)', // L4 - blue
      'rgb(168 85 247)', // L5 - purple
      'rgb(236 72 153)', // L6 - pink
    ]

    // First pass: count nodes per level and rename L0
    detectedLevels.forEach((levelKey, index) => {
      const values = data
        .filter(row => row[levelKey])
        .map(row => row[levelKey])
        .filter((value, idx, self) => self.indexOf(value) === idx)
      levelCounts[index] = values.length
    })

    // Second pass: create nodes with improved positioning
    detectedLevels.forEach((_, level) => {
      const currentKey = level === 0 ? 'Unnamed: 0' : `L${level}`
      const levelNodes = data
        .filter(row => row[currentKey])
        .map(row => row[currentKey])
        .filter((value, index, self) => self.indexOf(value) === index)

      const verticalSpacing = 150
      const horizontalSpacing = Math.max(200, 1000 / (levelCounts[level] || 1))
      
      levelNodes.forEach((label, index) => {
        if (!label) return
        
        const id = `${currentKey}-${index}`
        nodeMap.set(label, id)
        
        const x = (index - (levelNodes.length - 1) / 2) * horizontalSpacing + 500
        const y = level * verticalSpacing + 100

        const estimatedWidth = Math.max(
          150,
          label.length * (level === 0 ? 25 : 20)
        )

        newNodes.push({
          id,
          data: { 
            label,
            level,
            originalColumn: currentKey
          },
          position: { x, y },
          type: 'default',
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          style: {
            background: levelColors[level % levelColors.length],
            color: level === 2 ? '#000' : '#fff',
            padding: '10px',
            borderRadius: '8px',
            width: estimatedWidth,
            fontSize: Math.max(14, 18 - level),
            border: 'none',
            textAlign: 'center' as const,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            fontWeight: level === 0 ? 'bold' : 'normal',
            whiteSpace: 'normal' as const,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
          }
        })
      })

      // Create edges
      if (level > 0) {
        const parentKey = level === 1 ? 'Unnamed: 0' : `L${level - 1}`
        const currentKey = `L${level}`
        
        const validRows = data.filter(row => row[currentKey] && row[parentKey])
        
        validRows.forEach(row => {
          const sourceId = nodeMap.get(row[parentKey])
          const targetId = nodeMap.get(row[currentKey])
          if (sourceId && targetId) {
            const edgeId = `${sourceId}-${targetId}`
            if (!newEdges.some(edge => edge.id === edgeId)) {
              newEdges.push({
                id: edgeId,
                source: sourceId,
                target: targetId,
                type: 'smoothstep',
                style: { 
                  stroke: '#64748b',
                  strokeWidth: 2,
                  opacity: 0.8,
                  strokeDasharray: level > 3 ? '5,5' : undefined
                },
                animated: false
              })
            }
          }
        })
      }
    })

    setNodes(newNodes)
    setEdges(newEdges)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError(null)
      const data = await file.arrayBuffer()
      const workbook = read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = utils.sheet_to_json(worksheet) as ExcelData[]
      processExcelData(jsonData)
    } catch (err) {
      setError('文件解析错误，请确保上传有效的Excel文件。如果问题持续，请检查文件格式是否正确。')
      console.error('Excel parsing error:', err)
    }
  }

  const exportToDrawio = useCallback(() => {
    const drawioXml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <mxfile host="app.diagrams.net" modified="${new Date().toISOString()}">
        <diagram id="flowchart" name="Flowchart">
          <mxGraphModel dx="1422" dy="798" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169">
            <root>
              <mxCell id="0"/>
              <mxCell id="1" parent="0"/>
              ${nodes.map((node: Node) => `
                <mxCell id="${node.id}" value="${node.data.label}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=${node.style?.background};fontColor=${node.style?.color};fontSize=${node.style?.fontSize}px;" vertex="1" parent="1">
                  <mxGeometry x="${node.position.x}" y="${node.position.y}" width="${node.style?.width}" height="60" as="geometry"/>
                </mxCell>
              `).join('')}
              ${edges.map((edge: Edge) => `
                <mxCell id="${edge.id}" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="${edge.source}" target="${edge.target}">
                  <mxGeometry relative="1" as="geometry"/>
                </mxCell>
              `).join('')}
            </root>
          </mxGraphModel>
        </diagram>
      </mxfile>
    `.trim()

    const blob = new Blob([drawioXml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'flowchart.drawio'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [nodes, edges])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Excel转流程图工具</CardTitle>
            <CardDescription>上传Excel文件，自动生成流程图</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">点击上传</span> 或拖拽文件
                    </p>
                    <p className="text-xs text-gray-500">仅支持Excel文件格式</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {nodes.length > 0 && (
                <div className="space-y-4">
                  <Button 
                    className="w-full"
                    onClick={exportToDrawio}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    导出到Draw.io
                  </Button>
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => {
                      const svg = document.querySelector('.react-flow') as HTMLElement
                      if (svg) {
                        html2canvas(svg).then(canvas => {
                          const link = document.createElement('a')
                          link.download = 'flowchart.png'
                          link.href = canvas.toDataURL()
                          link.click()
                        })
                      }
                    }}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    导出预览图片
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="h-screen max-h-[80vh] min-h-[600px]">
          <CardContent className="p-0 h-full">
            <div className="h-full w-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
              >
                <Background />
                <Controls />
              </ReactFlow>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
