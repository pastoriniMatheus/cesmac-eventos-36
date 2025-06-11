
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar } from 'lucide-react';
import { useEvents, useDeleteEvent } from '@/hooks/useSupabaseData';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const EventManager = () => {
  const { data: events = [], isLoading } = useEvents();
  const deleteEvent = useDeleteEvent();

  const handleDeleteEvent = (eventId: string, eventName: string) => {
    console.log('Confirmando exclusão do evento:', eventName);
    deleteEvent.mutate(eventId);
  };

  if (isLoading) {
    return <div className="text-center py-4">Carregando eventos...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Gerenciar Eventos</h2>
      </div>
      
      {events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            Nenhum evento cadastrado
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event: any) => (
            <Card key={event.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">{event.name}</CardTitle>
                  <CardDescription>
                    Criado em: {new Date(event.created_at).toLocaleDateString('pt-BR')}
                  </CardDescription>
                  {event.whatsapp_number && (
                    <CardDescription>
                      WhatsApp: {event.whatsapp_number}
                    </CardDescription>
                  )}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      disabled={deleteEvent.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir o evento "{event.name}"? 
                        Esta ação não pode ser desfeita e removerá o evento permanentemente do banco de dados.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteEvent(event.id, event.name)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventManager;
