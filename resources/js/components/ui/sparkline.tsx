import { type ChartDataPoint } from '@/types/monitor'

interface SparklineProps {
  data: Array<{ value: number }>
  width?: number
  height?: number
  color?: string
  showArea?: boolean
}

export function Sparkline({
  data,
  width = 60,
  height = 20,
  color = 'currentColor',
  showArea = false
}: SparklineProps) {
  if (!data || data.length < 2) {
    return (
      <div
        className="inline-flex items-center justify-center"
        style={{ width, height }}
      >
        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    )
  }

  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  })

  const areaPoints = `0,${height} ${points.join(' ')} ${width},${height}`

  return (
    <svg width={width} height={height} className="inline-flex">
      {showArea && (
        <path
          d={`M${areaPoints}`}
          fill={color}
          fillOpacity="0.1"
        />
      )}
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}