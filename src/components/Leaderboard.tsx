import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Trophy,
  Medal,
  Search,
  X,
  ChevronRight,
  Clock,
  CheckCircle2,
  MapPin,
  Building2,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import type {
  LeaderboardCategory,
  LeaderboardTeam,
  ConnectionStatus,
  ScoreboardState,
} from '../types/leaderboard'
import {
  fetchScoreboardData,
  formatTimeAgo,
  formatTimestamp,
  getScopedLeaderboard,
  isRajarataUniversity,
} from '../services/leaderboardService'
import { demoLeaderboardTeams } from '../data/leaderboard'

export function Leaderboard() {
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>('world')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<LeaderboardTeam | null>(null)

  // Leaderboard data state (strictly Rajarata University teams)
  const [teams, setTeams] = useState<LeaderboardTeam[]>(() =>
    demoLeaderboardTeams.filter((t) => isRajarataUniversity(t.university) || t.isRajarata)
  )
  const [status, setStatus] = useState<ConnectionStatus>('cached')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [sourceName, setSourceName] = useState<string>('CS Academy Scoreboard')
  const [isUpdating, setIsUpdating] = useState<boolean>(false)
  const [relativeTimeStr, setRelativeTimeStr] = useState<string>('Just now')

  // Fetch or refresh handler
  const loadScoreboard = useCallback(async (isManual = false) => {
    setIsUpdating(true)
    try {
      const result: ScoreboardState = await fetchScoreboardData(isManual)
      // Strictly guarantee only Rajarata University teams enter state
      const ruslOnly = result.teams.filter(
        (t) => isRajarataUniversity(t.university) || t.isRajarata
      )
      setTeams(ruslOnly)
      setStatus(result.status)
      setLastUpdated(result.lastUpdated)
      setSourceName(result.sourceName)
      if (result.lastUpdated) {
        setRelativeTimeStr(formatTimeAgo(result.lastUpdated))
      }
    } catch (err) {
      console.warn('Scoreboard fetch encountered an issue, retaining existing state:', err)
    } finally {
      setIsUpdating(false)
    }
  }, [])

  // Initial load and periodic auto-refresh (every 5s as per live specification)
  useEffect(() => {
    loadScoreboard(false)

    const syncInterval = setInterval(() => {
      loadScoreboard(false)
    }, 5000)

    return () => clearInterval(syncInterval)
  }, [loadScoreboard])

  // Relative time tick (every 10s)
  useEffect(() => {
    const timeInterval = setInterval(() => {
      if (lastUpdated) {
        setRelativeTimeStr(formatTimeAgo(lastUpdated))
      }
    }, 10000)

    return () => clearInterval(timeInterval)
  }, [lastUpdated])

  // Get strictly Rajarata teams for current category & search
  const rankedTeams = useMemo(() => {
    return getScopedLeaderboard(teams, activeCategory, searchQuery)
  }, [teams, activeCategory, searchQuery])

  // Total count of Rajarata teams
  const totalRajarataTeams = teams.length

  // Top 3 for podium (strictly Rajarata teams)
  const showPodium = searchQuery.trim() === '' && rankedTeams.length >= 3
  const topThree = showPodium ? rankedTeams.slice(0, 3) : []
  const tableTeams = showPodium ? rankedTeams.slice(3) : rankedTeams

  // Helper for podium badge text
  const getPodiumBadgeText = (team: LeaderboardTeam, position: 1 | 2 | 3) => {
    if (activeCategory === 'world') {
      return `WORLD #${team.worldRank}`
    }
    if (activeCategory === 'island') {
      return `ISLAND #${team.islandRank ?? 'N/A'}`
    }
    if (position === 1) return '#01 RUSL CHAMPION'
    if (position === 2) return '#02 RUSL SILVER'
    return '#03 RUSL BRONZE'
  }

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTeam(null)
      }
    }
    if (selectedTeam) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [selectedTeam])

  return (
    <div className="leaderboard-container">
      {/* Top Banner: Real Connection / Live Status Indicator */}
      <div className="leaderboard-demo-banner">
        <div className="leaderboard-demo-banner__left">
          <span className="leaderboard-live-dot">
            {status === 'connected' && <span className="pulse-dot pulse-dot--live" />}
            {status === 'syncing' && <span className="pulse-dot pulse-dot--syncing" />}
            {status === 'cached' && <span className="pulse-dot pulse-dot--cached" />}
            {status === 'error' && <span className="pulse-dot pulse-dot--error" />}
            {status === 'demo_mode' && <span className="pulse-dot" />}
          </span>

          {status === 'connected' && (
            <span className="leaderboard-status-badge leaderboard-status-badge--connected">
              LIVE SCOREBOARD
            </span>
          )}
          {status === 'syncing' && (
            <span className="leaderboard-status-badge leaderboard-status-badge--syncing">
              SYNCING
            </span>
          )}
          {status === 'cached' && (
            <span className="leaderboard-status-badge leaderboard-status-badge--cached">
              CACHED DATA
            </span>
          )}
          {status === 'error' && (
            <span className="leaderboard-status-badge leaderboard-status-badge--error">
              CONNECTION ISSUE
            </span>
          )}
          {status === 'demo_mode' && (
            <span className="leaderboard-status-badge leaderboard-status-badge--demo">
              DEMO MODE
            </span>
          )}

          <p className="leaderboard-demo-copy">
            {status === 'connected' && (
              <>
                <strong>CS Academy Live Scoring Engine.</strong> Real-time synchronized standings for Rajarata University of Sri Lanka delegations.
              </>
            )}
            {status === 'syncing' && (
              <>
                <strong>Synchronizing with CS Academy.</strong> Updating live scores and rankings from official scoring engine.
              </>
            )}
            {status === 'cached' && (
              <>
                <strong>CS Academy Official Standings (Cached).</strong> Displaying verified official standings snapshot. Auto-sync active.
              </>
            )}
            {status === 'error' && (
              <>
                <strong>Connection to CS Academy delayed.</strong> Preserving last verified standings snapshot. Retrying with exponential backoff.
              </>
            )}
            {status === 'demo_mode' && (
              <>
                <strong>Sample leaderboard preview.</strong> Official stream will populate once connection is established.
              </>
            )}
          </p>
        </div>

        <div className="leaderboard-demo-banner__right">
          <div className="leaderboard-sync-info">
            <Clock size={13} />
            <span>
              {isUpdating
                ? 'SYNCING...'
                : lastUpdated
                ? `UPDATED ${relativeTimeStr.toUpperCase()} (${formatTimestamp(lastUpdated)})`
                : 'SYNCHRONIZING...'}
            </span>
          </div>

          <button
            type="button"
            className="leaderboard-refresh-btn"
            onClick={() => loadScoreboard(true)}
            disabled={isUpdating}
            title="Force immediate scoreboard synchronization"
            aria-label="Refresh scoreboard data"
          >
            <RefreshCw size={12} className={isUpdating ? 'spin-icon' : ''} />
            <span>{isUpdating ? 'Updating' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Categories & Search */}
      <div className="leaderboard-controls">
        <div className="leaderboard-tabs" role="tablist" aria-label="Ranking Categories">
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'world'}
            className={`leaderboard-tab ${activeCategory === 'world' ? 'leaderboard-tab--active' : ''}`}
            onClick={() => setActiveCategory('world')}
          >
            <span className="leaderboard-tab__label">World Rank</span>
            <span className="leaderboard-tab__count">
              {totalRajarataTeams > 0 ? `${totalRajarataTeams} RUSL Teams` : 'Global Standing'}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'island'}
            className={`leaderboard-tab ${activeCategory === 'island' ? 'leaderboard-tab--active' : ''}`}
            onClick={() => setActiveCategory('island')}
          >
            <span className="leaderboard-tab__label">Island Rank</span>
            <span className="leaderboard-tab__count">
              {totalRajarataTeams > 0 ? `${totalRajarataTeams} RUSL Teams` : 'Sri Lanka Standing'}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'university'}
            className={`leaderboard-tab ${activeCategory === 'university' ? 'leaderboard-tab--active' : ''}`}
            onClick={() => setActiveCategory('university')}
          >
            <span className="leaderboard-tab__label">University Rank</span>
            <span className="leaderboard-tab__count">
              {totalRajarataTeams > 0 ? `${totalRajarataTeams} RUSL Teams` : 'Campus Standings'}
            </span>
          </button>
        </div>

        {/* Search Input (Strictly searches Rajarata teams) */}
        <div className="leaderboard-search-wrap">
          <Search size={16} className="leaderboard-search-icon" />
          <input
            type="text"
            className="leaderboard-search-input"
            placeholder="Search Rajarata teams by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search Rajarata University teams by name"
          />
          {searchQuery && (
            <button
              type="button"
              className="leaderboard-search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category Scope Sub-header */}
      <div className="leaderboard-scope-bar">
        <div className="leaderboard-scope-info">
          <span className="leaderboard-scope-tag">
            {activeCategory === 'world' && '🌐 Official Global Standing — Rajarata University of Sri Lanka Delegations'}
            {activeCategory === 'island' && '🇱🇰 Official Island Standing — Rajarata University Teams Among Sri Lankan Universities'}
            {activeCategory === 'university' && '🏛️ Internal Campus Standing — Rajarata University of Sri Lanka Standings'}
          </span>
          <span className="leaderboard-scope-meta">
            Showing {rankedTeams.length} {rankedTeams.length === 1 ? 'team' : 'teams'} (Rajarata University Only)
          </span>
        </div>
        <div className="leaderboard-source-tag">
          <span>Source: {sourceName}</span>
        </div>
      </div>

      {/* Top 3 Podium (Strictly Rajarata University Teams) */}
      {showPodium && (
        <div className="leaderboard-podium">
          {/* Rank 2: Silver */}
          {topThree[1] && (
            <article
              className="podium-card podium-card--silver"
              onClick={() => setSelectedTeam(topThree[1])}
              tabIndex={0}
              role="button"
              aria-label={`View details for rank 2 team ${topThree[1].teamName}`}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedTeam(topThree[1])}
            >
              <div className="podium-card__rank-badge">
                <Medal size={16} />
                <span>{getPodiumBadgeText(topThree[1], 2)}</span>
              </div>
              <div className="podium-card__avatar">
                <span>02</span>
              </div>
              <h4 className="podium-card__name">{topThree[1].teamName}</h4>
              <p className="podium-card__university">{topThree[1].university}</p>
              <div className="podium-card__country">
                <MapPin size={12} /> {topThree[1].country} ({topThree[1].countryCode})
              </div>
              <div className="podium-card__score-box">
                <span className="podium-score-val">{topThree[1].score.toFixed(2)} PTS</span>
                <span className="podium-score-meta">
                  {topThree[1].solved} solved · {topThree[1].penalty}m penalty
                </span>
              </div>
              <span className="podium-card__view-btn">
                Inspect Breakdown <ArrowUpRight size={13} />
              </span>
            </article>
          )}

          {/* Rank 1: Gold (Center & Taller) */}
          {topThree[0] && (
            <article
              className="podium-card podium-card--gold"
              onClick={() => setSelectedTeam(topThree[0])}
              tabIndex={0}
              role="button"
              aria-label={`View details for rank 1 team ${topThree[0].teamName}`}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedTeam(topThree[0])}
            >
              <div className="podium-card__crown">
                <Sparkles size={16} />
              </div>
              <div className="podium-card__rank-badge podium-card__rank-badge--gold">
                <Trophy size={16} />
                <span>{getPodiumBadgeText(topThree[0], 1)}</span>
              </div>
              <div className="podium-card__avatar podium-card__avatar--gold">
                <span>01</span>
              </div>
              <h4 className="podium-card__name podium-card__name--gold">{topThree[0].teamName}</h4>
              <p className="podium-card__university">{topThree[0].university}</p>
              <div className="podium-card__country">
                <MapPin size={12} /> {topThree[0].country} ({topThree[0].countryCode})
              </div>
              <div className="podium-card__score-box podium-card__score-box--gold">
                <span className="podium-score-val podium-score-val--gold">
                  {topThree[0].score.toFixed(2)} PTS
                </span>
                <span className="podium-score-meta">
                  {topThree[0].solved} solved · {topThree[0].penalty}m penalty
                </span>
              </div>
              <span className="podium-card__view-btn podium-card__view-btn--gold">
                Inspect Breakdown <ArrowUpRight size={13} />
              </span>
            </article>
          )}

          {/* Rank 3: Bronze */}
          {topThree[2] && (
            <article
              className="podium-card podium-card--bronze"
              onClick={() => setSelectedTeam(topThree[2])}
              tabIndex={0}
              role="button"
              aria-label={`View details for rank 3 team ${topThree[2].teamName}`}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedTeam(topThree[2])}
            >
              <div className="podium-card__rank-badge">
                <Medal size={16} />
                <span>{getPodiumBadgeText(topThree[2], 3)}</span>
              </div>
              <div className="podium-card__avatar">
                <span>03</span>
              </div>
              <h4 className="podium-card__name">{topThree[2].teamName}</h4>
              <p className="podium-card__university">{topThree[2].university}</p>
              <div className="podium-card__country">
                <MapPin size={12} /> {topThree[2].country} ({topThree[2].countryCode})
              </div>
              <div className="podium-card__score-box">
                <span className="podium-score-val">{topThree[2].score.toFixed(2)} PTS</span>
                <span className="podium-score-meta">
                  {topThree[2].solved} solved · {topThree[2].penalty}m penalty
                </span>
              </div>
              <span className="podium-card__view-btn">
                Inspect Breakdown <ArrowUpRight size={13} />
              </span>
            </article>
          )}
        </div>
      )}

      {/* Main Leaderboard Table (Strictly Rajarata University Teams) */}
      {tableTeams.length > 0 ? (
        <div className="leaderboard-table-card">
          <div className="leaderboard-table-responsive">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th className="th-rank">
                    {activeCategory === 'world'
                      ? 'World Rank'
                      : activeCategory === 'island'
                      ? 'Island Rank'
                      : 'RUSL Rank'}
                  </th>
                  <th className="th-team">Team & Affiliation</th>
                  <th className="th-country">Region</th>
                  <th className="th-solved">Solved</th>
                  <th className="th-penalty">Penalty</th>
                  <th className="th-score">Score</th>
                  <th className="th-action"><span className="sr-only">Details</span></th>
                </tr>
              </thead>
              <tbody>
                {tableTeams.map((team) => (
                  <tr
                    key={team.teamId}
                    className="leaderboard-row"
                    onClick={() => setSelectedTeam(team)}
                    tabIndex={0}
                    role="button"
                    aria-label={`View team breakdown for ${team.teamName}`}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedTeam(team)}
                  >
                    <td className="td-rank">
                      <span
                        className={`rank-pill ${
                          (team.universityRank ?? 99) <= 3
                            ? `rank-pill--top rank-pill--${team.universityRank}`
                            : ''
                        }`}
                      >
                        #{team.displayRank < 10 ? `0${team.displayRank}` : team.displayRank}
                      </span>
                    </td>
                    <td className="td-team">
                      <div className="team-cell">
                        <span className="team-cell__name">{team.teamName}</span>
                        <span className="team-cell__university">{team.university}</span>
                      </div>
                    </td>
                    <td className="td-country">
                      <span className="country-badge">
                        <span className="country-badge__code">{team.countryCode}</span>
                        <span className="country-badge__name">{team.country}</span>
                      </span>
                    </td>
                    <td className="td-solved">
                      <span className="solved-badge">
                        <CheckCircle2 size={13} />
                        {team.solved}
                        {team.partiallySolved ? ` (+${team.partiallySolved})` : ''}
                      </span>
                    </td>
                    <td className="td-penalty">
                      <span className="penalty-val">{team.penalty}m</span>
                    </td>
                    <td className="td-score">
                      <strong className="score-val">{team.score.toFixed(2)}</strong>
                      <span className="score-unit">pts</span>
                    </td>
                    <td className="td-action">
                      <button
                        type="button"
                        className="btn-inspect-row"
                        aria-label={`Open stats for ${team.teamName}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTeam(team)
                        }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="leaderboard-table-footer">
            <div className="leaderboard-footer-left">
              <span className="telemetry-live-dot" />
              <span>
                Scoreboard data sourced from{' '}
                <a
                  href="https://csacademy.com/ieeextreme20/scoreboard/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="leaderboard-attribution-link"
                >
                  CS Academy <ExternalLink size={10} />
                </a>{' '}
                (IEEEXtreme 20.0 Official Scoring Engine) · Filtered strictly for Rajarata University of Sri Lanka.
              </span>
            </div>
            <div className="leaderboard-footer-right">
              <span>IEEE XTREME 3.0 / RUSL Scoring Engine</span>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Search State */
        <div className="leaderboard-empty-search">
          <div className="empty-search-icon">
            <Search size={28} />
          </div>
          <h4>No matching Rajarata teams found</h4>
          <p>
            No teams from Rajarata University matched "<strong>{searchQuery}</strong>".
          </p>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => setSearchQuery('')}
          >
            Clear Search Filter
          </button>
        </div>
      )}

      {/* Team Details Modal */}
      {selectedTeam && (
        <div
          className="leaderboard-modal-overlay"
          onClick={() => setSelectedTeam(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-team-name"
        >
          <div
            className="leaderboard-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="leaderboard-modal-close"
              onClick={() => setSelectedTeam(null)}
              aria-label="Close team details modal"
            >
              <X size={18} />
            </button>

            <div className="modal-header">
              <div className="modal-topline">
                <span className="modal-demo-tag">RAJARATA UNIVERSITY TEAM</span>
                <span className="modal-country-tag">
                  <MapPin size={12} /> {selectedTeam.country} ({selectedTeam.countryCode})
                </span>
              </div>
              <h3 id="modal-team-name">{selectedTeam.teamName}</h3>
              <p className="modal-university">
                <Building2 size={14} /> {selectedTeam.university}
              </p>
            </div>

            {/* Standings Grid: Preserved Original Official Ranks */}
            <div className="modal-stats-grid">
              <div className="modal-stat-card">
                <span className="stat-label">Official World Rank</span>
                <span className="stat-value stat-value--cyan">
                  {selectedTeam.worldRank ? `#${selectedTeam.worldRank}` : '—'}
                </span>
              </div>
              <div className="modal-stat-card">
                <span className="stat-label">Official Island Rank</span>
                <span className="stat-value">
                  {selectedTeam.islandRank ? `#${selectedTeam.islandRank}` : 'N/A'}
                </span>
              </div>
              <div className="modal-stat-card">
                <span className="stat-label">University Rank</span>
                <span className="stat-value stat-value--purple">
                  {selectedTeam.universityRank ? `#${selectedTeam.universityRank}` : 'N/A'}
                </span>
              </div>
              <div className="modal-stat-card">
                <span className="stat-label">Total Score</span>
                <span className="stat-value stat-value--gold">
                  {selectedTeam.score.toFixed(2)} <small>pts</small>
                </span>
              </div>
            </div>

            {/* Solved Problems Breakdown */}
            <div className="modal-problems-section">
              <div className="modal-section-title">
                <CheckCircle2 size={16} />
                <h4>
                  Challenge Breakdown ({selectedTeam.solvedProblems.length} Tasks Recorded)
                </h4>
              </div>

              {selectedTeam.solvedProblems.length > 0 ? (
                <div className="modal-problems-list">
                  {selectedTeam.solvedProblems.map((p) => (
                    <div className="problem-item" key={p.id}>
                      <div className="problem-item__code">
                        <span className="problem-code-badge">{p.id}</span>
                        <div className="problem-meta">
                          <span className="problem-name">{p.name}</span>
                          <span className="problem-time">
                            <Clock size={11} /> Solved at {p.time}
                          </span>
                        </div>
                      </div>
                      <div className="problem-item__points">
                        <span className="problem-points-val">
                          {p.points > 0 ? `+${p.points}` : '0.0'} pts
                        </span>
                        <span className="problem-attempts">
                          {p.attempts} {p.attempts === 1 ? 'attempt' : 'attempts'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-problems-note" style={{ color: '#94a3b8', fontSize: '13px' }}>
                  No submission task logs recorded yet for this team.
                </p>
              )}
            </div>

            <div className="modal-footer">
              <span className="modal-footer-note">
                Official CS Academy Telemetry · Contest ID #133706 · Rajarata Delegation
              </span>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setSelectedTeam(null)}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
