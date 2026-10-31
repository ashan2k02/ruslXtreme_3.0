import { useState, useMemo, useEffect } from 'react'
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
} from 'lucide-react'
import {
  getLeaderboardForCategory,
  type LeaderboardCategory,
  type LeaderboardTeam,
} from '../data/leaderboard'

export function Leaderboard() {
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>('world')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<LeaderboardTeam | null>(null)

  // Get ranked teams for current category
  const categoryTeams = useMemo(() => {
    return getLeaderboardForCategory(activeCategory)
  }, [activeCategory])

  // Filter by search query
  const filteredTeams = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return categoryTeams
    return categoryTeams.filter(
      (t) =>
        t.teamName.toLowerCase().includes(q) ||
        t.university.toLowerCase().includes(q) ||
        t.country.toLowerCase().includes(q)
    )
  }, [categoryTeams, searchQuery])

  // Top 3 for podium (only shown when not actively searching or when all results match)
  const showPodium = searchQuery.trim() === '' && filteredTeams.length >= 3
  const topThree = showPodium ? filteredTeams.slice(0, 3) : []
  const tableTeams = showPodium ? filteredTeams.slice(3) : filteredTeams

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
      {/* Top Banner: Clear Demo Mode Indicator */}
      <div className="leaderboard-demo-banner">
        <div className="leaderboard-demo-banner__left">
          <span className="leaderboard-live-dot">
            <span className="pulse-dot" />
          </span>
          <span className="leaderboard-demo-badge">DEMO MODE</span>
          <p className="leaderboard-demo-copy">
            <strong>Sample leaderboard data.</strong> Live data stream integration coming soon. Official results will populate here once the contest commences.
          </p>
        </div>
        <div className="leaderboard-demo-banner__right">
          <Clock size={13} />
          <span>SIMULATED STREAM · T+04:30:00</span>
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
            <span className="leaderboard-tab__count">All Regions</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'island'}
            className={`leaderboard-tab ${activeCategory === 'island' ? 'leaderboard-tab--active' : ''}`}
            onClick={() => setActiveCategory('island')}
          >
            <span className="leaderboard-tab__label">Island Rank</span>
            <span className="leaderboard-tab__count">Sri Lanka</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'university'}
            className={`leaderboard-tab ${activeCategory === 'university' ? 'leaderboard-tab--active' : ''}`}
            onClick={() => setActiveCategory('university')}
          >
            <span className="leaderboard-tab__label">University Rank</span>
            <span className="leaderboard-tab__count">Rajarata University</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="leaderboard-search-wrap">
          <Search size={16} className="leaderboard-search-icon" />
          <input
            type="text"
            className="leaderboard-search-input"
            placeholder="Search team, university, or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search teams by name, university, or country"
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
            {activeCategory === 'world' && '🌐 Global Standing (Worldwide)'}
            {activeCategory === 'island' && '🇱🇰 National Standing (Sri Lanka Universities)'}
            {activeCategory === 'university' && '🏛️ Host Institution Standing (Rajarata University of Sri Lanka)'}
          </span>
          <span className="leaderboard-scope-meta">
            Showing {filteredTeams.length} {filteredTeams.length === 1 ? 'team' : 'teams'} in category
          </span>
        </div>
      </div>

      {/* Top 3 Podium (Shown when not filtering) */}
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
                <span>#02 SILVER</span>
              </div>
              <div className="podium-card__avatar">
                <span>02</span>
              </div>
              <h4 className="podium-card__name">{topThree[1].teamName}</h4>
              <p className="podium-card__university">{topThree[1].university}</p>
              <div className="podium-card__country">
                <MapPin size={12} /> {topThree[1].country}
              </div>
              <div className="podium-card__score-box">
                <span className="podium-score-val">{topThree[1].score.toLocaleString()} PTS</span>
                <span className="podium-score-meta">{topThree[1].solved} solved · {topThree[1].penalty}m pen</span>
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
                <span>#01 CHAMPION</span>
              </div>
              <div className="podium-card__avatar podium-card__avatar--gold">
                <span>01</span>
              </div>
              <h4 className="podium-card__name podium-card__name--gold">{topThree[0].teamName}</h4>
              <p className="podium-card__university">{topThree[0].university}</p>
              <div className="podium-card__country">
                <MapPin size={12} /> {topThree[0].country}
              </div>
              <div className="podium-card__score-box podium-card__score-box--gold">
                <span className="podium-score-val podium-score-val--gold">{topThree[0].score.toLocaleString()} PTS</span>
                <span className="podium-score-meta">{topThree[0].solved} solved · {topThree[0].penalty}m pen</span>
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
                <span>#03 BRONZE</span>
              </div>
              <div className="podium-card__avatar">
                <span>03</span>
              </div>
              <h4 className="podium-card__name">{topThree[2].teamName}</h4>
              <p className="podium-card__university">{topThree[2].university}</p>
              <div className="podium-card__country">
                <MapPin size={12} /> {topThree[2].country}
              </div>
              <div className="podium-card__score-box">
                <span className="podium-score-val">{topThree[2].score.toLocaleString()} PTS</span>
                <span className="podium-score-meta">{topThree[2].solved} solved · {topThree[2].penalty}m pen</span>
              </div>
              <span className="podium-card__view-btn">
                Inspect Breakdown <ArrowUpRight size={13} />
              </span>
            </article>
          )}
        </div>
      )}

      {/* Main Leaderboard Table */}
      {tableTeams.length > 0 ? (
        <div className="leaderboard-table-card">
          <div className="leaderboard-table-responsive">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th className="th-rank">Rank</th>
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
                      <span className={`rank-pill ${team.displayRank <= 3 ? `rank-pill--top rank-pill--${team.displayRank}` : ''}`}>
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
                        {team.solved} / 10
                      </span>
                    </td>
                    <td className="td-penalty">
                      <span className="penalty-val">{team.penalty}m</span>
                    </td>
                    <td className="td-score">
                      <strong className="score-val">{team.score.toLocaleString()}</strong>
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
              <span>Simulated ranking feed · Updated every 60s in production stream</span>
            </div>
            <div className="leaderboard-footer-right">
              <span>IEEE XTREME 3.0 / Live Scoring Engine</span>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Search State */
        <div className="leaderboard-empty-search">
          <div className="empty-search-icon">
            <Search size={28} />
          </div>
          <h4>No matching teams found</h4>
          <p>
            No teams matched "<strong>{searchQuery}</strong>" in the {activeCategory === 'world' ? 'World' : activeCategory === 'island' ? 'Island' : 'University'} ranking category.
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

      {/* Team Details Modal / Drawer */}
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
                <span className="modal-demo-tag">SIMULATED TEAM PROFILE</span>
                <span className="modal-country-tag">
                  <MapPin size={12} /> {selectedTeam.country} ({selectedTeam.countryCode})
                </span>
              </div>
              <h3 id="modal-team-name">{selectedTeam.teamName}</h3>
              <p className="modal-university">
                <Building2 size={14} /> {selectedTeam.university}
              </p>
            </div>

            {/* Standings Grid */}
            <div className="modal-stats-grid">
              <div className="modal-stat-card">
                <span className="stat-label">World Rank</span>
                <span className="stat-value stat-value--cyan">#{selectedTeam.worldRank}</span>
              </div>
              <div className="modal-stat-card">
                <span className="stat-label">Island Rank</span>
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
                  {selectedTeam.score.toLocaleString()} <small>pts</small>
                </span>
              </div>
            </div>

            {/* Solved Problems Breakdown */}
            <div className="modal-problems-section">
              <div className="modal-section-title">
                <CheckCircle2 size={16} />
                <h4>Solved Challenge Breakdown ({selectedTeam.solvedProblems.length} Solved)</h4>
              </div>

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
                      <span className="problem-points-val">+{p.points}</span>
                      <span className="problem-attempts">
                        {p.attempts} {p.attempts === 1 ? 'attempt' : 'attempts'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <span className="modal-footer-note">
                RUSLXTREME 3.0 Demo Telemetry · Real-time socket stream ready
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
