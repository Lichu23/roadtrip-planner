import { Flow, TripInput } from '@/lib/constants'
import { T } from '@/lib/i18n'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Globe, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import FlowGPS from './FlowGPS'
import FlowDestination from './FlowDestination'

interface IntakeScreenProps {
  currentFlow: Flow
  onFlowChange: (flow: Flow) => void
  formData: TripInput
  onFormChange: (data: TripInput) => void
  onGenerate: () => void
  onCancel?: () => void
  t: T
}

export default function IntakeScreen({
  currentFlow,
  onFlowChange,
  formData,
  onFormChange,
  onGenerate,
  onCancel,
  t,
}: IntakeScreenProps) {
  return (
    <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Cancel button — only shown when editing an existing trip */}
      {onCancel && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-700 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {t.backToTrip}
        </Button>
      )}
      {/* Flow selector */}
      <div className="flex flex-col md:flex-row gap-3">
        <Card
          className={cn(
            'relative flex-1 p-4 cursor-pointer transition-all',
            currentFlow === 'gps'
              ? 'border-2 border-emerald-500 bg-emerald-50'
              : 'border border-slate-200 hover:border-slate-300'
          )}
          onClick={() => onFlowChange('gps')}
        >
          {currentFlow === 'gps' && (
            <Badge className="absolute top-2 right-2 bg-emerald-600 text-white text-xs">
              {t.selected}
            </Badge>
          )}
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-900 text-sm">{t.flowGPSTitle}</span>
          </div>
          <p className="text-xs text-slate-500">{t.flowGPSDesc}</p>
        </Card>

        <Card
          className={cn(
            'relative flex-1 p-4 cursor-pointer transition-all',
            currentFlow === 'destination'
              ? 'border-2 border-emerald-500 bg-emerald-50'
              : 'border border-slate-200 hover:border-slate-300'
          )}
          onClick={() => onFlowChange('destination')}
        >
          {currentFlow === 'destination' && (
            <Badge className="absolute top-2 right-2 bg-emerald-600 text-white text-xs">
              {t.selected}
            </Badge>
          )}
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-900 text-sm">{t.flowDestTitle}</span>
          </div>
          <p className="text-xs text-slate-500">{t.flowDestDesc}</p>
        </Card>
      </div>

      {/* Flow form */}
      {currentFlow === 'gps' ? (
        <FlowGPS formData={formData} onFormChange={onFormChange} onGenerate={onGenerate} t={t} />
      ) : (
        <FlowDestination formData={formData} onFormChange={onFormChange} onGenerate={onGenerate} t={t} />
      )}
    </main>
  )
}
