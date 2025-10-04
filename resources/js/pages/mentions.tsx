import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head } from '@inertiajs/react'
import { MentionsTableEnhanced } from '@/components/mentions/mentions-table-enhanced'
import { TopDomainsCard } from '@/components/mentions/top-domains-card'
import { DomainRankDistributionCard } from '@/components/mentions/domain-rank-distribution-card'
import { mockMentions } from '@/data/mentions'
import { useState } from 'react'
import { type MentionSortConfig, type Mention } from '@/types/mention'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Mentions',
    href: '/mentions',
  },
]

interface MentionsPageProps {
  mentions: Mention[]
  useDatabaseData: boolean
}

export default function Mentions({ mentions: propsMentions, useDatabaseData }: MentionsPageProps) {
  const [sortConfig, setSortConfig] = useState<MentionSortConfig>({
    column: null,
    direction: 'desc'
  })

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortConfig({ column, direction })
  }

  // Use database mentions if available, otherwise fallback to mock data
  const mentions = propsMentions && propsMentions.length > 0 ? propsMentions : mockMentions

  const sortedMentions = [...mentions].sort((a, b) => {
    if (!sortConfig.column) return 0

    let aValue: string | number | Date
    let bValue: string | number | Date

    switch (sortConfig.column) {
      case 'domain':
        aValue = a.domain
        bValue = b.domain
        break
      case 'url':
        aValue = a.url
        bValue = b.url
        break
      case 'domainRating':
        aValue = a.domainRating
        bValue = b.domainRating
        break
      case 'pageRank':
        aValue = a.pageRank
        bValue = b.pageRank
        break
      case 'position':
        aValue = a.position
        bValue = b.position
        break
      case 'firstSeen':
        aValue = new Date(a.firstSeen)
        bValue = new Date(b.firstSeen)
        break
      case 'estimatedTraffic':
        aValue = a.estimatedTraffic || 0
        bValue = b.estimatedTraffic || 0
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
      <Head title="Mentions" />
      <div className="min-h-[100vh] flex-1 md:min-h-min">
        <div className="relative z-10 py-6">
          <div className="px-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-semibold">All Mentions</h1>
              <p className="text-muted-foreground mt-1">
                View all your mentions across all monitors
              </p>
              {useDatabaseData && mentions.length > 0 && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Showing {mentions.length} mentions from your monitoring data
                </p>
              )}
              {(!useDatabaseData || mentions.length === 0) && (
                <p className="text-sm text-muted-foreground mt-2">
                  Showing sample data - your monitoring data will appear here once available
                </p>
              )}
            </div>

            {/* Charts Grid */}
            <div className="mt-6 grid gap-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="lg:col-span-1">
                  <TopDomainsCard mentions={sortedMentions} />
                </div>
                <div className="lg:col-span-1">
                  <DomainRankDistributionCard mentions={sortedMentions} />
                </div>
              </div>

              {/* Mentions Table */}
              <MentionsTableEnhanced 
                mentions={sortedMentions}
                onSort={handleSort}
                sortConfig={sortConfig}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}