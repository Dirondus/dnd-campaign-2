import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const playerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  pdfs: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        return Array.from(files).every(file => file.type === "application/pdf");
      },
      "All files must be PDFs"
    ),
});

type PlayerFormData = z.infer<typeof playerSchema>;

interface PlayerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  player?: {
    id: string;
    name: string;
    pdf_urls?: string[];
  };
}

export function PlayerForm({ open, onOpenChange, onSuccess, player }: PlayerFormProps) {
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  const form = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: player?.name || "",
    },
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setIsAdmin(profile?.role === 'admin');
      }
    };
    checkAdminStatus();
  }, []);

  const uploadPDFs = async (files: FileList): Promise<string[]> => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('player-pdfs')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('player-pdfs')
        .getPublicUrl(filePath);

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const onSubmit = async (data: PlayerFormData) => {
    try {
      setUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to create a player');
      }

      let pdfUrls = player?.pdf_urls || [];

      // Upload PDFs if provided and user is admin
      if (data.pdfs && data.pdfs.length > 0 && isAdmin) {
        const newPdfUrls = await uploadPDFs(data.pdfs);
        pdfUrls = [...pdfUrls, ...newPdfUrls];
      }

      const playerData = {
        name: data.name,
        pdf_urls: pdfUrls,
      };

      if (player) {
        // Update existing player
        const { error } = await supabase
          .from('players')
          .update(playerData)
          .eq('id', player.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Player updated successfully',
        });
      } else {
        // Create new player
        const { error } = await supabase
          .from('players')
          .insert(playerData);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Player created successfully',
        });
      }

      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Failed to save player:', error);
      toast({
        title: 'Error',
        description: 'Failed to save player',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const removePdf = async (pdfUrl: string) => {
    if (!player || !isAdmin) return;
    
    try {
      const updatedPdfUrls = (player.pdf_urls || []).filter(url => url !== pdfUrl);
      
      const { error } = await supabase
        .from('players')
        .update({ pdf_urls: updatedPdfUrls })
        .eq('id', player.id);

      if (error) throw error;

      // Delete from storage
      const filePath = pdfUrl.split('/').pop();
      if (filePath) {
        await supabase.storage
          .from('player-pdfs')
          .remove([filePath]);
      }

      toast({
        title: 'Success',
        description: 'PDF removed successfully',
      });
      
      onSuccess();
    } catch (error) {
      console.error('Failed to remove PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove PDF',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{player ? 'Edit Player' : 'Create Player'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Player Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter player name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Show existing PDFs if editing */}
            {player && player.pdf_urls && player.pdf_urls.length > 0 && (
              <div className="space-y-2">
                <FormLabel>Existing PDFs</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {player.pdf_urls.map((pdfUrl, index) => (
                    <div key={index} className="flex items-center">
                      <Badge variant="secondary" className="flex items-center gap-2">
                        PDF {index + 1}
                        {isAdmin && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removePdf(pdfUrl)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isAdmin && (
              <FormField
                control={form.control}
                name="pdfs"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Add PDF Files (Admin Only)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf"
                        multiple
                        onChange={(e) => onChange(e.target.files)}
                        {...field}
                        value={undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? 'Saving...' : player ? 'Update Player' : 'Create Player'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}