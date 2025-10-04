import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type TopBrand } from "@/types/dashboard"

interface TopBrandsListProps {
  brands?: TopBrand[]
}

export function TopBrandsList({
  brands = []
}: TopBrandsListProps) {
  // Calculate total mentions from the brands data
  const totalMentions = brands.reduce((sum, brand) => sum + (brand.mentions || 0), 0)
  return (
    <Card className="col-span-4">
      <CardHeader className="@container/card-header relative grid auto-rows-min grid-rows-[auto_auto] items-start px-6 has-[data-slot=card-action]:grid-cols-[1fr_auto] border-b pb-5">
        <CardDescription className="text-muted-foreground text-sm truncate">
          Top Brands by Visibility
        </CardDescription>
        <CardTitle className="text-lg font-semibold truncate">
          {totalMentions} mentions
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[427px] relative p-0">
        <div>
          {brands.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <div className="text-sm">No brands found</div>
                <div className="text-xs mt-1">Brands will appear here once imported</div>
              </div>
            </div>
          ) : (
            brands.map((brand) => (
              <div
                key={brand.domain || brand.name}
                className="flex relative items-center justify-between py-3 px-6 gap-4 transition-opacity cursor-pointer hover:bg-muted/50 border-b last:border-transparent bg-white"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Color indicator matching chart line */}
                  <span
                    className={`size-2.5 rounded-full shrink-0 transition-transform ${brand.color}`}
                    aria-hidden="true"
                  />

                  {/* Favicon */}
                  <div className="flex items-center justify-center shrink-0">
                    <div className="bg-white rounded-sm overflow-hidden flex items-center justify-center border shrink-0 size-8">
                      {brand.favicon ? (
                        <img
                          alt={brand.domain || brand.name}
                          loading="eager"
                          width="20"
                          height="20"
                          decoding="async"
                          className="rounded-sm"
                          src={brand.favicon}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-sm font-medium text-muted-foreground rounded">
                          {brand.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Brand info */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-sm truncate flex items-center gap-2">
                        {brand.name}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {brand.domain}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right shrink-0">
                  <div className="text-sm font-medium">
                    {brand.visibilityScore.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {brand.mentions} mentions
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
