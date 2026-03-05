import React from 'react';
import YearPanel from './YearPanel';
import ChampionsPanel from './ChampionsPanel';
import { useGame, useActivePromotion, useActivePromotionConfig, getActivePromotions } from '../context/GameContext';
import { Link } from 'react-router-dom';
import { getEffectiveLevel } from '../models/Wrestler';

const MONTH_NAMES = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// ── Event severity labels (newspaper style) ───────────────────────────────────
const EVENT_CONFIG = {
  leve:        { label: 'LESIÓN LEVE',        accent: '#888' },
  moderada:    { label: 'LESIÓN MODERADA',     accent: '#555' },
  grave:       { label: 'BAJA GRAVE',          accent: 'var(--ink)' },
  gravisima:   { label: 'LESIÓN CATASTRÓFICA', accent: 'var(--ink)' },
  suspension:  { label: 'SUSPENSIÓN',          accent: '#555' },
  careerEnd:   { label: 'FIN DE CARRERA',      accent: 'var(--ink)' },
  return:      { label: 'REGRESO',             accent: '#555' },
  titleVacant: { label: 'TÍTULO VACANTE',      accent: '#888' },
};

// ── Ranking table shared by global and promo views ──────────────────────────
const RankingTable = ({ wrestlers, year, label }) => {
  const ranking = [...wrestlers]
    .filter(w => w.status === 'active')
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, 10);

  return (
    <div style={{ borderLeft: '3px solid var(--ink)', paddingLeft: '14px' }}>
      <div style={{
        fontFamily: 'var(--display)', fontWeight: 700, textTransform: 'uppercase',
        fontSize: '0.68rem', letterSpacing: '0.14em', color: 'var(--ink-3)', marginBottom: '10px',
      }}>
        {label}
      </div>
      {ranking.length === 0 ? (
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-3)', fontSize: '0.85rem' }}>
          Sin combates registrados aún.
        </div>
      ) : (
        <div>
          {ranking.map((w, i) => {
            const effLevel = getEffectiveLevel(w, year);
            const lvlBg = effLevel >= 8 ? 'bg-success' : effLevel >= 5 ? 'bg-warning' : 'bg-danger';
            const lvlText = effLevel >= 5 && effLevel < 8 ? 'text-dark' : 'text-white';
            const roman = ['I.','II.','III.'][i] ?? `${i+1}.`;
            return (
              <div key={w.id} style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: i < ranking.length - 1 ? '1px solid #e0d8c8' : 'none',
                gap: '8px',
              }}>
                {/* Left: rank + name + promo */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0, flex: 1 }}>
                  <span style={{
                    fontFamily: 'var(--display)', fontWeight: 700, fontSize: '0.72rem',
                    color: 'var(--ink-3)', minWidth: '20px', paddingTop: '2px', flexShrink: 0,
                  }}>{roman}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--serif)', fontWeight: i < 3 ? 700 : 400, fontSize: '0.88rem', lineHeight: 1.2 }}>
                      {w.name}
                    </div>
                    {w.promoShortName && (
                      <span style={{ fontSize: '0.55rem', fontFamily: 'var(--display)', color: 'var(--ink-3)', border: '1px solid var(--ink-3)', padding: '0 3px', display: 'inline-block', marginTop: '2px' }}>
                        {w.promoShortName}
                      </span>
                    )}
                  </div>
                </div>
                {/* Right: level + points */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0, paddingTop: '2px' }}>
                  <span className={`badge ${lvlBg} ${lvlText}`} style={{ fontSize: '0.55rem' }}>LVL {effLevel}</span>
                  <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '0.8rem', minWidth: '22px', textAlign: 'right' }}>
                    {w.points || 0}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Event type → newspaper section label ─────────────────────────────────────
const NEWS_CONFIG = {
  titleMatch:    { section: 'Resultado de Título',   accent: 'var(--ink)' },
  tournamentFinal: { section: 'Final de Torneo',     accent: 'var(--ink)' },
  leve:          { section: 'Lesión Leve',           accent: '#888' },
  moderada:      { section: 'Lesión Moderada',       accent: '#555' },
  grave:         { section: 'Baja por Lesión',       accent: 'var(--ink)' },
  gravisima:     { section: 'Lesión Catastrófica',   accent: 'var(--ink)' },
  suspension:    { section: 'Suspensión',            accent: '#555' },
  careerEnd:     { section: 'Retiro',                accent: 'var(--ink)' },
  return:        { section: 'Regreso al Ring',       accent: '#555' },
  titleVacant:   { section: 'Título Vacante',        accent: '#888' },
};

// Single newspaper cell
const NewsCell = ({ item, featured = false }) => {
  const cfg = NEWS_CONFIG[item?.eventType] || { section: 'Noticia', accent: 'var(--ink)' };
  if (!item) {
    // Empty placeholder cell
    return (
      <div style={{
        borderTop: '2px solid #e0d8c8',
        padding: '12px 0 8px',
        opacity: 0.35,
        gridColumn: featured ? 'span 2' : 'span 1',
      }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#bbb', marginBottom: '6px' }}>
          — Sin noticias —
        </div>
        <div style={{ fontFamily: 'var(--display)', fontWeight: 900, fontSize: featured ? '1.05rem' : '0.88rem', color: '#ccc', lineHeight: 1.2 }}>
          Avanzá el mes para ver las noticias aquí.
        </div>
      </div>
    );
  }
  return (
    <div style={{
      borderTop: `3px solid ${cfg.accent}`,
      padding: '12px 12px 10px 0',
      gridColumn: featured ? 'span 2' : 'span 1',
    }}>
      {/* Section + promo badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
        <span style={{
          fontFamily: 'var(--display)', fontWeight: 700, textTransform: 'uppercase',
          fontSize: '0.58rem', letterSpacing: '0.14em', color: cfg.accent,
        }}>{cfg.section}</span>
        {item.promoShortName && (
          <span style={{
            fontFamily: 'var(--display)', fontSize: '0.55rem', color: 'var(--ink-3)',
            border: '1px solid #c8b890', padding: '0 4px', letterSpacing: '0.06em',
          }}>{item.promoShortName}</span>
        )}
      </div>
      {/* Headline */}
      <div style={{
        fontFamily: 'var(--display)', fontWeight: 900,
        fontSize: featured ? '1.05rem' : '0.85rem',
        lineHeight: 1.2, color: 'var(--ink)', marginBottom: '4px',
      }}>
        {item.text}
      </div>
      {/* Dateline */}
      {item.month && (
        <div style={{ fontFamily: 'var(--display)', fontSize: '0.58rem', color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {MONTH_NAMES[item.month] ?? `Mes ${item.month}`} {item.year}
        </div>
      )}
    </div>
  );
};

// ── Global Portada ─────────────────────────────────────────────────────────────
// Shown when activePromotionId === null
const GlobalPortada = () => {
  const { state } = useGame();
  const { globalNewsFeed, currentYear, currentMonth, promotions } = state;
  const activePromos = getActivePromotions(currentYear);

  // Combined ranking: all wrestlers from all active promotions, tagged with promo
  const allWrestlers = activePromos.flatMap(p => {
    const promoState = promotions[p.id];
    if (!promoState) return [];
    return (promoState.roster || []).map(w => ({ ...w, promoShortName: p.shortName }));
  });

  // Newspaper grid: 9 cells, padded with nulls for empty slots
  // First item is "featured" (spans 2 columns)
  const GRID_SLOTS = 9;
  const feedSlice = (globalNewsFeed || []).slice(0, GRID_SLOTS);
  const cells = [...feedSlice, ...Array(Math.max(0, GRID_SLOTS - feedSlice.length)).fill(null)];

  return (
    <div className="container-fluid fade-in" style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 24px' }}>
      {/* Masthead */}
      <div style={{
        textAlign: 'center', borderBottom: '3px double var(--ink)',
        paddingBottom: '12px', marginBottom: '24px',
      }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '0.72rem', color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>
          {MONTH_NAMES[currentMonth]} {currentYear} · Edición Global
        </div>
        <div style={{ fontFamily: 'var(--display)', fontWeight: 900, fontSize: '1.6rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Noticias
        </div>
      </div>

      {/* Main layout: news grid + ranking sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '36px', alignItems: 'start' }}>

        {/* Left: 3-col newspaper grid */}
        <div>
          {/* Rule above grid */}
          <div style={{ borderTop: '2px solid var(--ink)', marginBottom: '0' }} />

          {/* Newspaper CSS grid: 3 columns, auto rows */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            columnGap: '20px',
          }}>
            {/* Featured item — spans col 1+2, row 1 */}
            <NewsCell item={cells[0]} featured={true} />

            {/* Small item top-right */}
            <NewsCell item={cells[1]} />

            {/* Row 2: three equal cells */}
            {cells.slice(2, 5).map((item, i) => (
              <NewsCell key={i} item={item} />
            ))}

            {/* Horizontal rule row */}
            <div style={{ gridColumn: 'span 3', borderTop: '1px solid #c8b890', margin: '4px 0' }} />

            {/* Row 3: three equal cells */}
            {cells.slice(5, 8).map((item, i) => (
              <NewsCell key={i+5} item={item} />
            ))}

            {/* Bottom cell — spans 3 */}
            <div style={{ gridColumn: 'span 3', borderTop: '1px solid #c8b890', margin: '4px 0' }} />
            <NewsCell item={cells[8]} featured={false} />
          </div>
        </div>

        {/* Right: permanent WON ranking */}
        <div style={{ borderLeft: '2px solid var(--ink)', paddingLeft: '20px' }}>
          <RankingTable
            wrestlers={allWrestlers}
            year={currentYear}
            label="WON Wrestler of the Year"
          />
        </div>

      </div>
    </div>
  );
};


// ── Promo Dashboard ────────────────────────────────────────────────────────────
// Shown when a specific promotion is selected
const PromoDashboard = () => {
  const { state } = useGame();
  const promo = useActivePromotion();
  const promoConfig = useActivePromotionConfig();

  if (!promo) return null;

  const rankingLabel = `${promoConfig?.shortName ?? ''} Wrestler Ranking`;

  // Recent events: last 10 from eventLog + title/tournament from matchLog
  const recentMatchNews = (promo.matchLog || [])
    .filter(r => r.isTitleMatch || r.isTournamentFinal)
    .slice(0, 6)
    .map(r => ({
      id: r.id,
      eventType: r.isTournamentFinal ? 'tournamentFinal' : 'titleMatch',
      text: r.loserName
        ? `${r.winnerName} vence a ${r.loserName} — ${r.title ?? ''}`
        : `${r.winnerName} retiene — ${r.title ?? ''}`,
      month: r.month,
      year: r.year,
    }));

  const recentInjuries = (promo.eventLog || []).slice(0, 8);

  // Merge and sort by most recent (eventLog items don't always have year/month, matchLog does)
  const allRecent = [
    ...recentMatchNews,
    ...recentInjuries.map(ev => ({ ...ev, isEvent: true })),
  ].slice(0, 10);

  const MONTH_NAMES_LOCAL = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  return (
    <div className="container fade-in">
      <YearPanel />
      <ChampionsPanel />

      {/* Dos columnas: ranking + eventos recientes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', marginTop: '20px' }}>

        {/* Ranking de la promoción */}
        <div style={{ borderLeft: '3px solid var(--ink)', paddingLeft: '16px' }}>
          <RankingTable
            wrestlers={promo.roster || []}
            year={state.currentYear}
            label={rankingLabel}
          />
        </div>

        {/* Log de eventos recientes */}
        <div style={{ borderLeft: '2px solid #c8b890', paddingLeft: '16px' }}>
          <div style={{
            fontFamily: 'var(--display)', fontWeight: 700, textTransform: 'uppercase',
            fontSize: '0.68rem', letterSpacing: '0.14em', color: 'var(--ink-3)', marginBottom: '12px',
          }}>
            Últimas Noticias
          </div>

          {allRecent.length === 0 ? (
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-3)', fontSize: '0.88rem', padding: '16px 0' }}>
              Sin eventos aún. Avanzá el mes para ver noticias aquí.
            </div>
          ) : (
            allRecent.map((ev, i) => {
              const cfg = NEWS_CONFIG[ev.eventType] || { section: 'Noticia', accent: '#888' };
              return (
                <div key={ev.id ?? i} style={{
                  paddingLeft: '10px',
                  borderLeft: `3px solid ${cfg.accent}`,
                  marginBottom: '12px',
                }}>
                  <div style={{
                    fontFamily: 'var(--display)', fontWeight: 700, textTransform: 'uppercase',
                    fontSize: '0.58rem', letterSpacing: '0.12em', color: cfg.accent, marginBottom: '3px',
                  }}>{cfg.section}</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: '0.86rem', color: 'var(--ink)', lineHeight: 1.35 }}>
                    {ev.text}
                  </div>
                  {ev.month && (
                    <div style={{ fontFamily: 'var(--display)', fontSize: '0.58rem', color: 'var(--ink-3)', letterSpacing: '0.06em', marginTop: '2px' }}>
                      {MONTH_NAMES_LOCAL[ev.month] ?? `Mes ${ev.month}`} {ev.year ?? state.currentYear}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};


// ── Main export ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { state } = useGame();
  if (!state.activePromotionId) return <GlobalPortada />;
  return <PromoDashboard />;
};

export default Dashboard;
