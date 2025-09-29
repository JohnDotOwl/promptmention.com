import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head } from '@inertiajs/react'
import { CitationsTableEnhanced } from '@/components/citations/citations-table-enhanced'
import { TopDomainsCard } from '@/components/citations/top-domains-card'
import { DomainRankDistributionCard } from '@/components/citations/domain-rank-distribution-card'
import { mockCitations } from '@/data/citations'
import { useState } from 'react'
import { type CitationSortConfig } from '@/types/citation'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Citations',
    href: '/citations',
  },
]

export default function Citations() {
  const [sortConfig, setSortConfig] = useState<CitationSortConfig>({
    column: null,
    direction: 'desc'
  })

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortConfig({ column, direction })
  }

  const sortedCitations = [...mockCitations].sort((a, b) => {
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
      <Head title="Citations" />
      <div className="min-h-[100vh] flex-1 md:min-h-min">
        <div className="relative z-10 py-6">
          <div className="px-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-semibold">All Citations</h1>
              <p className="text-muted-foreground mt-1">
                View all your citations across all monitors
              </p>
            </div>

            {/* Charts Grid */}
            <div className="mt-6 grid gap-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="lg:col-span-1">
                  <TopDomainsCard citations={sortedCitations} />
                </div>
                <div className="lg:col-span-1">
                  <DomainRankDistributionCard citations={sortedCitations} />
                </div>
              </div>

              {/* Citations Table */}
              <CitationsTableEnhanced 
                citations={sortedCitations}
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