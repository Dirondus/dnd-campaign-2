import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Save, X } from 'lucide-react'

interface EditableSectionProps {
  title: string
  children: React.ReactNode
  editableContent?: React.ReactNode
  onSave?: () => void
  className?: string
}

export function EditableSection({ 
  title, 
  children, 
  editableContent, 
  onSave,
  className = ""
}: EditableSectionProps) {
  const { role } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    onSave?.()
    setIsEditing(false)
  }

  const canEdit = role === 'admin'

  return (
    <Card className={`bg-card-elevated border-border shadow-soft ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-accent">{title}</CardTitle>
        {canEdit && !isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {canEdit && isEditing && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              className="h-8 w-8 p-0"
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isEditing && editableContent ? editableContent : children}
      </CardContent>
    </Card>
  )
}