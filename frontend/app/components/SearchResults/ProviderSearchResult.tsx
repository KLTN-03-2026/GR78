'use client'

import Link from 'next/link'
import { SearchProviderItem } from '@/lib/api/search.service'

interface ProviderSearchResultProps {
  provider: SearchProviderItem
  onClick?: () => void
}

function getInitials(name?: string) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function ProviderSearchResult({ provider, onClick }: ProviderSearchResultProps) {
  return (
    <Link
      href={`/profile/${provider.id}`}
      onClick={onClick}
      className="block rounded-app-lg border border-outline-variant/60 bg-surface p-app-md transition-all hover:border-brand/30 hover:shadow-app-card-hover"
    >
      <div className="flex items-start gap-app-md">
        {/* Avatar */}
        {provider.avatarUrl ? (
          <img
            src={provider.avatarUrl}
            alt={provider.displayName || 'Thợ'}
            className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-tint text-sm font-bold text-brand-dark">
            {getInitials(provider.displayName)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Name + verified */}
          <div className="flex items-center gap-app-xs">
            <h3 className="truncate text-base font-semibold text-foreground">
              {provider.displayName || 'Thợ'}
            </h3>
            {provider.isVerified && (
              <svg
                className="h-4 w-4 flex-shrink-0 text-brand"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-label="Đã xác minh"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 10-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          {provider.province && (
            <p className="mt-0.5 text-sm text-foreground-muted">
              <span aria-hidden>📍</span> {provider.province}
            </p>
          )}

          {provider.bio && (
            <p className="mt-app-xs line-clamp-2 text-sm text-foreground-muted">{provider.bio}</p>
          )}

          {/* Trades with icon */}
          {provider.trades && provider.trades.length > 0 && (
            <div className="mt-app-xs flex flex-wrap gap-1">
              {provider.trades.slice(0, 3).map((trade) => (
                <span
                  key={trade.slug}
                  className="inline-flex items-center gap-0.5 rounded-full bg-brand-tint px-2 py-0.5 text-xs text-brand-dark"
                >
                  {trade.icon && <span aria-hidden>{trade.icon}</span>}
                  {trade.name}
                  {trade.yearsExperience ? ` · ${trade.yearsExperience}n` : ''}
                </span>
              ))}
              {provider.trades.length > 3 && (
                <span className="inline-block rounded-full bg-surface-highest px-2 py-0.5 text-xs text-foreground-muted">
                  +{provider.trades.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Member since */}
        {provider.memberSince && (
          <div className="flex-shrink-0 text-right">
            <span className="text-xs text-foreground-muted">
              Tham gia {new Date(provider.memberSince).getFullYear()}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
