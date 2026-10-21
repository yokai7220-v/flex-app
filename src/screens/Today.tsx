import { CheckButton } from '../components/DoneControls'
import { Top } from '../components/ui'
import { findLevel } from '../data/program'
import { human, today } from '../lib/date'
import { useStore } from '../store'
import { RoutineCard } from './Program'

export function TodayScreen() {
  const { settings } = useStore()
  const level = findLevel(settings.currentLevel)!
  const light = level.routines.find((r) => r.kind === 'light')!
  const t = today()

  return (
    <div className="screen">
      <Top title="Сегодня" big />
      <div className="small muted" style={{ margin: '-8px 4px 12px' }}>
        {human(t)} · уровень {level.num} «{level.short}»
      </div>

      <div className="section-title">Каждый день</div>
      <RoutineCard r={light} right={<CheckButton routine={light} />} />
    </div>
  )
}
