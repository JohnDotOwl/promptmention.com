import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ShareOfVoiceData {
  ourBrand: number
  otherBrands: number
  trend: number
  isPositive: boolean
  ourBrandMentions: number
  totalMentions: number
}

interface ShareOfVoiceCardProps {
  data: ShareOfVoiceData
}

export function ShareOfVoiceCard({ data }: ShareOfVoiceCardProps) {
  const getTrendIcon = () => {
    if (data.trend === 0) return <Minus className="h-4 w-4" />
    return data.isPositive ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  const getTrendColor = () => {
    if (data.trend === 0) return 'text-gray-500'
    return data.isPositive ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="h-[495px] space-y-4 border-r border-b p-8">
      <div>
        <h2 className="text-base font-semibold leading-none">Share of Voice</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your brand mentions compared to total mentions
        </p>
      </div>

      <div className="h-full flex flex-col justify-center space-y-6">
        {/* Main Share of Voice Display */}
        <div className="text-center">
          <div className="text-5xl font-bold text-blue-600">
            {data.ourBrand}%
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            of all brand mentions
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Your Brand</span>
            <span className="text-muted-foreground">{data.ourBrand}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${data.ourBrand}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Other Brands</span>
            <span className="text-muted-foreground">{data.otherBrands}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gray-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${data.otherBrands}%` }}
            />
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center justify-center gap-2">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {data.trend > 0 ? '+' : ''}{data.trend}% from last period
          </span>
        </div>

        {/* Raw Numbers */}
        <div className="text-center space-y-1">
          <div className="text-lg font-semibold">
            {data.ourBrandMentions}
          </div>
          <div className="text-sm text-muted-foreground">
            brand mentions out of {data.totalMentions} total
          </div>
        </div>
      </div>
    </div>
  )
}