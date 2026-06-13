import React, { useEffect, useMemo } from 'react';
import { getCachedClubLogo, setCachedClubLogo } from '../../lib/clubLogoCache';

/**
 * Renders the club logo + name at the top of a staff sidebar.
 *
 * `club` comes from the `clubsAPI.getClub` query each sidebar already runs.
 * We seed the logo URL from localStorage so it renders on the very first
 * paint — no fetch flash after login — and write back when the query lands.
 *
 * Pass `clubId` explicitly so we can read the right cache entry before the
 * query resolves.
 */
export default function ClubLogoBadge({ clubId, club }) {
  // Cache the URL whenever the query lands so future renders are instant.
  useEffect(() => {
    if (clubId && club?.logoUrl !== undefined) {
      setCachedClubLogo(clubId, club.logoUrl || null);
    }
  }, [clubId, club?.logoUrl]);

  const logoUrl = useMemo(
    () => club?.logoUrl || getCachedClubLogo(clubId) || null,
    [clubId, club?.logoUrl]
  );

  if (!clubId) return null;

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden shadow-md flex-shrink-0">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Club Logo"
            className="w-full h-full object-contain p-1"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
      </div>
      {club?.name && (
        <div className="min-w-0">
          <div className="text-white font-semibold truncate">{club.name}</div>
          {club?.code && (
            <div className="text-xs text-white/60 font-mono">{club.code}</div>
          )}
        </div>
      )}
    </div>
  );
}
