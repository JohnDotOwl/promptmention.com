import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head } from '@inertiajs/react'
import { ResponsesTable } from '@/components/responses/responses-table'
import { useState } from 'react'
import { type ResponseSortConfig, type Response, type ModelUsageData, type ResponseTimelineData } from '@/types/response'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, Bot, ChevronLeft, ChevronRight, ChevronFirst, ChevronLast } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Rectangle } from 'recharts'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Responses',
    href: '/responses',
  },
]

// Custom shape for rounded bars
const RoundedBar = (props: any) => {
  const { fill, x, y, width, height } = props
  const radius = 4

  if (height <= 0) return null

  return (
    <path
      d={`
        M ${x},${y + height}
        L ${x},${y + radius}
        Q ${x},${y} ${x + radius},${y}
        L ${x + width - radius},${y}
        Q ${x + width},${y} ${x + width},${y + radius}
        L ${x + width},${y + height}
        Z
      `}
      fill={fill}
    />
  )
}

interface ResponsesProps {
  responses: Response[]
  modelUsageData: ModelUsageData[]
  responseTimelineData: ResponseTimelineData[]
}

export default function Responses({ responses, modelUsageData, responseTimelineData }: ResponsesProps) {
  const [sortConfig, setSortConfig] = useState<ResponseSortConfig>({
    column: null,
    direction: 'desc'
  })

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortConfig({ column, direction })
  }

  const sortedResponses = [...responses].sort((a, b) => {
    if (!sortConfig.column) return 0

    let aValue: string | number | Date
    let bValue: string | number | Date

    switch (sortConfig.column) {
      case 'model':
        aValue = a.model.name
        bValue = b.model.name
        break
      case 'visibility':
        aValue = a.visibility
        bValue = b.visibility
        break
      case 'answered':
        aValue = new Date(a.answered)
        bValue = new Date(b.answered)
        break
      default:
        return 0
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Responses" />
      <div className="min-h-[100vh] flex-1 md:min-h-min">
        <div className="relative z-10 py-6">
          <div className="px-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-semibold">All Responses</h1>
              <p className="text-muted-foreground mt-1">
                View all responses from your LLMs
              </p>
            </div>

            {/* Charts Section */}
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {/* Model Usage Pie Chart */}
              <Card className="bg-card text-card-foreground flex flex-col rounded-xl shrink-0 ring-muted/60 border shadow-sm ring-3 md:col-span-1" data-slot="card">
                <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-5 pt-4 has-[data-slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-2" data-slot="card-header">
                  <CardTitle className="leading-none font-semibold pt-2" data-slot="card-title">Model Usage</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm" data-slot="card-description">Last 30 days</CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-4 h-60 w-full" data-slot="card-content">
                  <div className="[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden mx-auto aspect-square h-[200px] w-full" data-slot="chart" data-chart="chart-model-usage">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={modelUsageData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={0}
                          dataKey="count"
                          strokeWidth={4}
                          stroke="white"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          className="stroke-white dark:stroke-gray-950 [&_.recharts-pie-sector]:outline-none cursor-default"
                          tabIndex={0}
                        >
                          {modelUsageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} className="recharts-sector" tabIndex={-1} />
                          ))}
                        </Pie>
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-700 dark:fill-gray-300 text-2xl font-bold">
                          60
                        </text>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Response Timeline Chart */}
              <Card className="ring-muted/60 border shadow-sm ring-3 md:col-span-3">
                <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-5 pt-4 has-[data-slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-2">
                  <CardTitle className="leading-none font-semibold pt-2">Response Count by Model Over Time</CardTitle>
                  <CardDescription>The number of responses generated by each model over the last 30 days.</CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-4 h-60 w-full">
                  <div className="w-full relative h-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <BarChart data={responseTimelineData}>
                        <CartesianGrid strokeDasharray="0" horizontal={true} vertical={false} stroke="#ccc" className="stroke-gray-200 stroke-1 dark:stroke-gray-800" />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ transform: 'translate(0, 6)' }}
                          className="text-xs fill-gray-500 dark:fill-gray-500 mt-4"
                          tickFormatter={(value) => {
                            const date = new Date(value)
                            return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
                          }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ transform: 'translate(-3, 0)' }}
                          className="text-xs fill-gray-500 dark:fill-gray-500"
                        />
                        <Tooltip />
                        <Bar dataKey="gemini-2.0-flash" fill="#3B82F6" shape={RoundedBar} className="fill-blue-500" />
                        <Bar dataKey="gpt-4o-search" fill="#10B981" shape={RoundedBar} className="fill-emerald-500" />
                        <Bar dataKey="mistral-small-latest" fill="#8B5CF6" shape={RoundedBar} className="fill-violet-500" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Table */}
            <div className="mt-6 grid gap-4">
              <div className="animate-in fade-in space-y-4 duration-300">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="default"
                      className="h-9 px-4 py-2 cursor-pointer rounded-full"
                      type="button"
                      aria-haspopup="dialog"
                      aria-expanded="false"
                      data-state="closed"
                    >
                      <Filter className="-ms-1 me-2 h-4 w-4 opacity-60" aria-hidden="true" />
                      Brand Sentiment
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select defaultValue="all-models">
                      <SelectTrigger className="w-[180px] h-9" data-size="default">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <Bot className="w-4 h-4" aria-hidden="true" />
                            All Models
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-models">
                          <div className="flex items-center gap-2">
                            <Bot className="w-4 h-4" aria-hidden="true" />
                            All Models
                          </div>
                        </SelectItem>
                        <SelectItem value="gemini">Gemini 2.0 Flash</SelectItem>
                        <SelectItem value="gpt-4o">ChatGPT Search</SelectItem>
                        <SelectItem value="mistral">Mistral Small</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all-types">
                      <SelectTrigger className="w-[180px] h-9" data-size="default">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-types">All Types</SelectItem>
                        <SelectItem value="informational">Informational</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Responses Table */}
                <ResponsesTable
                  responses={sortedResponses}
                  onSort={handleSort}
                  sortConfig={sortConfig}
                />

                {/* Pagination */}
                <div className="flex items-center justify-between gap-8">
                  <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
                    <p className="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite">
                      <span className="text-foreground">1-{Math.min(25, sortedResponses.length)}</span> of{' '}
                      <span className="text-foreground">{responses.length}</span>
                    </p>
                  </div>
                  <div>
                    <nav aria-label="pagination" className="mx-auto flex w-full justify-center">
                      <ul className="flex flex-row items-center gap-1">
                        <li>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-full"
                            disabled
                            aria-label="Go to first page"
                          >
                            <ChevronFirst className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </li>
                        <li>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-full"
                            disabled
                            aria-label="Go to previous page"
                          >
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </li>
                        <li>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-full"
                            aria-label="Go to next page"
                          >
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </li>
                        <li>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-full"
                            aria-label="Go to last page"
                          >
                            <ChevronLast className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}