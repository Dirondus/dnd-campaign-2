import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlayerForm } from '@/components/forms/PlayerForm';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Eye, Edit, Trash2, FileText, Upload } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  pdf_urls?: string[];
  created_at: string;
  created_by: string;
}

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deletingPlayer, setDeletingPlayer] = useState<Player | null>(null);
  const [viewingPDF, setViewingPDF] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const { toast } = useToast();

  const loadPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert pdf_urls from Json to string[] and handle null values
      const playersWithPdfUrls = (data || []).map(player => ({
        ...player,
        pdf_urls: Array.isArray(player.pdf_urls) 
          ? (player.pdf_urls as string[])
          : []
      }));
      
      setPlayers(playersWithPdfUrls);
    } catch (error) {
      console.error('Failed to load players:', error);
      toast({
        title: 'Error',
        description: 'Failed to load players',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
    checkAdminStatus();
  }, []);

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

  const handleDelete = async (player: Player) => {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', player.id);

      if (error) throw error;

      // Also delete the PDFs from storage if they exist
      if (player.pdf_urls && player.pdf_urls.length > 0) {
        const filePaths = player.pdf_urls.map(url => url.split('/').pop()).filter(Boolean);
        if (filePaths.length > 0) {
          await supabase.storage
            .from('player-pdfs')
            .remove(filePaths);
        }
      }

      toast({
        title: 'Success',
        description: 'Player deleted successfully'
      });
      
      loadPlayers();
    } catch (error) {
      console.error('Failed to delete player:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete player',
        variant: 'destructive'
      });
    } finally {
      setDeletingPlayer(null);
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPlayer(null);
  };

  const handleFormSuccess = () => {
    loadPlayers();
    handleFormClose();
  };

  const uploadPDFs = async (files: FileList, playerId: string): Promise<string[]> => {
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

  const handleFileUpload = async (files: FileList, player: Player) => {
    if (!isAdmin) return;
    
    try {
      setUploading(player.id);
      
      // Validate file types
      const validFiles = Array.from(files).filter(file => file.type === 'application/pdf');
      if (validFiles.length === 0) {
        toast({
          title: 'Error',
          description: 'Please select PDF files only',
          variant: 'destructive'
        });
        return;
      }

      if (validFiles.length !== files.length) {
        toast({
          title: 'Warning',
          description: 'Only PDF files were uploaded. Other file types were ignored.',
        });
      }

      const newPdfUrls = await uploadPDFs(validFiles as any, player.id);
      const updatedPdfUrls = [...(player.pdf_urls || []), ...newPdfUrls];

      const { error } = await supabase
        .from('players')
        .update({ pdf_urls: updatedPdfUrls })
        .eq('id', player.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${validFiles.length} PDF${validFiles.length > 1 ? 's' : ''} uploaded successfully`
      });

      loadPlayers();
      
      // Reset file input
      if (fileInputRefs.current[player.id]) {
        fileInputRefs.current[player.id]!.value = '';
      }
    } catch (error) {
      console.error('Failed to upload PDFs:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload PDFs',
        variant: 'destructive'
      });
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Players</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Players</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Player
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {players.map((player) => (
          <Card key={player.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="truncate">{player.name}</span>
                {player.pdf_urls && player.pdf_urls.length > 0 && (
                  <Badge variant="secondary" className="ml-2 flex-shrink-0">
                    <FileText className="mr-1 h-3 w-3" />
                    {player.pdf_urls.length} PDF{player.pdf_urls.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-2">
                {player.pdf_urls && player.pdf_urls.map((pdfUrl, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="outline"
                    onClick={() => setViewingPDF(pdfUrl)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    PDF {index + 1}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      ref={(el) => fileInputRefs.current[player.id] = el}
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files, player)}
                      className="hidden"
                      id={`upload-${player.id}`}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={uploading === player.id}
                      onClick={() => fileInputRefs.current[player.id]?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading === player.id ? 'Uploading...' : 'Upload PDFs'}
                    </Button>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(player)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeletingPlayer(player)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {players.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold">No players</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by creating your first player.
          </p>
          <div className="mt-6">
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Player
            </Button>
          </div>
        </div>
      )}

      <PlayerForm
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={handleFormSuccess}
        player={editingPlayer || undefined}
      />

      <AlertDialog open={!!deletingPlayer} onOpenChange={() => setDeletingPlayer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the player "{deletingPlayer?.name}" and all their PDF files.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPlayer && handleDelete(deletingPlayer)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!viewingPDF} onOpenChange={() => setViewingPDF(null)}>
        <DialogContent className="max-w-7xl w-[95vw] h-[95vh] top-[2.5vh] translate-y-0 flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>PDF Viewer</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            {viewingPDF && (
              <iframe
                src={viewingPDF}
                className="w-full h-full border-0"
                title="PDF Viewer"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}