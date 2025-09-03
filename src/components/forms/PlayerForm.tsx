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

interface PdfObject {
  name: string;
  url: string;
}

interface PlayerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  player?: {
    id: string;
    name: string;
    pdf_urls?: PdfObject[];
  };
}

export function PlayerForm({ open, onOpenChange, onSuccess, player }: PlayerFormProps) {
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editedPdfs, setEditedPdfs] = useState<PdfObject[]>([]);
  const { toast } = useToast();

  const form = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: player?.name || "",
    },
  });

  useEffect(() => {
    if (player?.pdf_urls) {
      setEditedPdfs([...player.pdf_urls]);
    } else {
      setEditedPdfs([]);
    }
    form.reset({
      name: player?.name || "",
    });
  }, [player, form]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if user is one of the hardcoded admin UUIDs from RLS policy
        const adminUUIDs = [
          '97d19cec-8106-44ef-9a6e-4fb1d9a2e78a',
          'e4eceed4-c78d-4fb0-ba45-92a4cbaecae7'
        ];
        setIsAdmin(adminUUIDs.includes(user.id));
      }
    };
    checkAdminStatus();
  }, []);

  const uploadPDFs = async (files: FileList): Promise<PdfObject[]> => {
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

      return {
        name: file.name.replace('.pdf', ''),
        url: publicUrl
      };
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

      let pdfUrls = editedPdfs;

      // Upload PDFs if provided and user is admin
      if (data.pdfs && data.pdfs.length > 0 && isAdmin) {
        const newPdfUrls = await uploadPDFs(data.pdfs);
        pdfUrls = [...pdfUrls, ...newPdfUrls];
      }

      const playerData = {
        name: data.name,
        pdf_urls: pdfUrls as any,
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

  const removePdf = (pdfObj: PdfObject) => {
    if (!isAdmin) return;
    setEditedPdfs(prev => prev.filter(pdf => pdf.url !== pdfObj.url));
  };

  const renamePdf = (pdfObj: PdfObject, newName: string) => {
    if (!isAdmin || !newName.trim()) return;
    setEditedPdfs(prev => prev.map(pdf => 
      pdf.url === pdfObj.url ? { ...pdf, name: newName.trim() } : pdf
    ));
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
            {editedPdfs.length > 0 && (
              <div className="space-y-2">
                <FormLabel>Existing PDFs</FormLabel>
                <div className="space-y-2">
                  {editedPdfs.map((pdfObj, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {isAdmin ? (
                        <Input
                          value={pdfObj.name}
                          onChange={(e) => renamePdf(pdfObj, e.target.value)}
                          className="flex-1"
                        />
                      ) : (
                        <Badge variant="secondary" className="flex-1">
                          {pdfObj.name}
                        </Badge>
                      )}
                      {isAdmin && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removePdf(pdfObj)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
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