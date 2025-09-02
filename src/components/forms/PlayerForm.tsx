import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/supabase-storage';
import { X } from 'lucide-react';

const playerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  pdfFile: z.instanceof(File).optional().refine((file) => {
    if (!file) return true;
    return file.type === 'application/pdf';
  }, 'Only PDF files are allowed')
});

type PlayerFormData = z.infer<typeof playerSchema>;

interface PlayerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  player?: {
    id: string;
    name: string;
    pdf_url?: string;
  };
}

export function PlayerForm({ open, onOpenChange, onSuccess, player }: PlayerFormProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: player?.name || '',
    }
  });

  const selectedFile = watch('pdfFile');

  const uploadPDF = async (file: File, userId: string) => {
    const fileExt = 'pdf';
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('player-pdfs')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('player-pdfs')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const onSubmit = async (data: PlayerFormData) => {
    try {
      setUploading(true);
      const user = await getCurrentUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to create players',
          variant: 'destructive'
        });
        return;
      }

      let pdfUrl = player?.pdf_url;

      if (data.pdfFile) {
        pdfUrl = await uploadPDF(data.pdfFile, user.id);
      }

      const playerData = {
        name: data.name,
        pdf_url: pdfUrl,
        created_by: user.id
      };

      if (player) {
        const { error } = await supabase
          .from('players')
          .update(playerData)
          .eq('id', player.id);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Player updated successfully'
        });
      } else {
        const { error } = await supabase
          .from('players')
          .insert(playerData);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Player created successfully'
        });
      }

      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving player:', error);
      toast({
        title: 'Error',
        description: 'Failed to save player',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{player ? 'Edit Player' : 'Create Player'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Player Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter player name"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="pdf">PDF File</Label>
            <Input
              id="pdf"
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setValue('pdfFile', file);
                }
              }}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {selectedFile.name}
              </p>
            )}
            {player?.pdf_url && !selectedFile && (
              <p className="text-sm text-muted-foreground mt-1">
                Current PDF attached
              </p>
            )}
            {errors.pdfFile && (
              <p className="text-sm text-destructive mt-1">{errors.pdfFile.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Saving...' : player ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}