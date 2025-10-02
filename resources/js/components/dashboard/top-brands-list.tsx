import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type TopBrand } from "@/types/dashboard"

const defaultBrands: TopBrand[] = [
  {
    name: "Wix",
    domain: "wix.com",
    favicon: "https://www.google.com/s2/favicons?domain=wix.com&sz=256",
    visibilityScore: 80.8,
    mentions: 44,
    color: "bg-lime-500",
  },
  {
    name: "Squarespace",
    domain: "squarespace.com",
    favicon: "https://www.google.com/s2/favicons?domain=squarespace.com&sz=256",
    visibilityScore: 76.2,
    mentions: 45,
    color: "bg-gray-500",
  },
  {
    name: "Bistank",
    domain: "bistank.com",
    favicon: undefined,
    visibilityScore: 63.8,
    mentions: 33,
    color: "bg-blue-500",
  },
  {
    name: "Shopify",
    domain: "shopify.com",
    favicon: "https://www.google.com/s2/favicons?domain=shopify.com&sz=256",
    visibilityScore: 61.5,
    mentions: 28,
    color: "bg-amber-500",
  },
  {
    name: "Webflow",
    domain: "webflow.com",
    favicon: "https://www.google.com/s2/favicons?domain=webflow.com&sz=256",
    visibilityScore: 59.4,
    mentions: 26,
    color: "bg-cyan-500",
  },
  {
    name: "Weebly",
    domain: "weebly.com",
    favicon: "https://www.google.com/s2/favicons?domain=weebly.com&sz=256",
    visibilityScore: 56.1,
    mentions: 15,
    color: "bg-pink-500",
  },
  {
    name: "WordPress.org",
    domain: "wordpress.org",
    favicon: "https://www.google.com/s2/favicons?domain=wordpress.org&sz=256",
    visibilityScore: 58.6,
    mentions: 14,
    color: "bg-red-500",
  },
]

interface TopBrandsListProps {
  brands?: TopBrand[]
  totalMentions?: number
}

export function TopBrandsList({
  brands = defaultBrands,
  totalMentions = 205
}: TopBrandsListProps) {
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
          {brands.map((brand, index) => (
            <div
              key={brand.domain}
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
                        alt={brand.domain}
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
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
