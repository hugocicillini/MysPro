import { VideoProps } from '@/lib/types';
import {
  BookOpen,
  Check,
  ExternalLink,
  MoreHorizontal,
  Play,
  Star,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { videoService } from '../services';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';

interface CurrentVideoProps {
  currentVideo: VideoProps | null;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  onVideoUpdate?: () => void; // Callback para recarregar a lista quando houver mudanças
}

const CurrentVideo = ({
  currentVideo,
  setSearch,
  onVideoUpdate,
}: CurrentVideoProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPriorityControls, setShowPriorityControls] = useState(false);

  // Função para atualizar prioridade
  const updatePriority = async (newPriority: number) => {
    if (!currentVideo?._id) return;

    setIsUpdating(true);
    try {
      await videoService.updatePriority(currentVideo._id, newPriority);
      onVideoUpdate?.(); // Recarrega a lista
    } catch (error) {
      console.error('Erro ao atualizar prioridade:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Função para marcar como assistido
  const markAsWatched = async () => {
    if (!currentVideo?._id) return;

    setIsUpdating(true);
    try {
      await videoService.updateVideo(currentVideo._id, {
        status: 'watched',
        dateWatched: new Date().toISOString(),
      });
      onVideoUpdate?.(); // Recarrega a lista
    } catch (error) {
      console.error('Erro ao marcar como assistido:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Função para deletar vídeo
  const deleteVideo = async () => {
    if (!currentVideo?._id) return;

    const confirmed = confirm('Tem certeza que deseja deletar este vídeo?');
    if (!confirmed) return;

    setIsUpdating(true);
    try {
      await videoService.deleteVideo(currentVideo._id);
      onVideoUpdate?.(); // Recarrega a lista
    } catch (error) {
      console.error('Erro ao deletar vídeo:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Função para obter cor da prioridade
  const getPriorityColor = (priority?: number) => {
    if (!priority) return 'text-gray-400';
    if (priority <= 2) return 'text-green-500';
    if (priority === 3) return 'text-yellow-500';
    return 'text-red-500';
  };
  // Função para extrair o ID do vídeo do YouTube
  const extractVideoId = (url: string): string => {
    // Se já é apenas o ID (11 caracteres), retorna como está
    if (url.length === 11 && !url.includes('/') && !url.includes('=')) {
      return url;
    }

    // Padrões de URL do YouTube
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // Se não conseguir extrair, retorna a URL original
    console.warn('Não foi possível extrair ID do vídeo:', url);
    return url;
  };

  if (!currentVideo) {
    return (
      <div className="h-full flex flex-col">
        <Card className="flex-1 border-dashed border-2 border-gray-200">
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Play className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-medium mb-2">Selecione um vídeo</h3>
            <p className="text-sm text-center max-w-xs">
              Escolha um vídeo da lista para começar a assistir
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'learning':
        return 'bg-blue-100 text-blue-800';
      case 'watched':
        return 'bg-green-100 text-green-800';
      case 'later':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'learning':
        return 'Aprendendo';
      case 'watched':
        return 'Realizado';
      case 'later':
        return 'Futuros';
      default:
        return status;
    }
  };

  const getDifficultyText = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Iniciante';
      case 'intermediate':
        return 'Intermediário';
      case 'advanced':
        return 'Avançado';
      default:
        return 'Não definido';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 overflow-hidden flex flex-col">
        {/* Player de Vídeo */}
        <div className="relative bg-black shrink-0">
          <iframe
            width="100%"
            height="250"
            src={`https://www.youtube.com/embed/${
              currentVideo.videoId || extractVideoId(currentVideo.url)
            }?controls=1&rel=0`}
            allowFullScreen
            title={currentVideo.name}
            className="border-0"
          ></iframe>
        </div>

        {/* Conteúdo do Vídeo - Scrollável */}
        <div className="flex-1 overflow-y-auto">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-lg leading-tight mb-2">
                  {currentVideo.name}
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getStatusColor(currentVideo.status)}>
                    {getStatusText(currentVideo.status)}
                  </Badge>
                  {currentVideo.difficulty && (
                    <Badge
                      className={getDifficultyColor(currentVideo.difficulty)}
                    >
                      {getDifficultyText(currentVideo.difficulty)}
                    </Badge>
                  )}
                  {currentVideo.priority && (
                    <Badge
                      variant="outline"
                      className="gap-1 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() =>
                        setShowPriorityControls(!showPriorityControls)
                      }
                    >
                      <Star
                        className={`w-3 h-3 ${getPriorityColor(
                          currentVideo.priority
                        )}`}
                      />
                      {currentVideo.priority}
                    </Badge>
                  )}
                </div>
                {showPriorityControls && (
                  <div className="flex gap-2 mt-2">
                    <span className="text-sm text-gray-600 self-center">
                      Prioridade:
                    </span>
                    {[1, 2, 3, 4, 5].map((priority) => (
                      <Button
                        key={priority}
                        variant={
                          currentVideo.priority === priority
                            ? 'default'
                            : 'outline'
                        }
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => updatePriority(priority)}
                        disabled={isUpdating}
                      >
                        <Star
                          className={`w-3 h-3 ${
                            currentVideo.priority === priority
                              ? 'text-white'
                              : getPriorityColor(priority)
                          }`}
                          fill={
                            currentVideo.priority === priority
                              ? 'currentColor'
                              : 'none'
                          }
                        />
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={isUpdating}>
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={markAsWatched}
                      disabled={isUpdating || currentVideo.status === 'watched'}
                    >
                      <Check className="w-4 h-4" />
                      Marcar como Assistido
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() =>
                        setShowPriorityControls(!showPriorityControls)
                      }
                    >
                      <Star className="w-4 h-4" />
                      Alterar Prioridade
                    </Button>
                    <Separator />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={deleteVideo}
                      disabled={isUpdating}
                    >
                      <Trash2 className="w-4 h-4" />
                      Deletar Vídeo
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Informações Adicionais */}
            <div className="grid grid-cols-1 gap-4 text-sm">
              {currentVideo.dateAdded && (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  <span>
                    Adicionado em{' '}
                    {new Date(currentVideo.dateAdded).toLocaleDateString(
                      'pt-BR'
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Descrição */}
            {currentVideo.description && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Descrição</h4>
                  <CardDescription className="text-sm leading-relaxed">
                    {currentVideo.description}
                  </CardDescription>
                </div>
              </>
            )}

            {/* Tags */}
            {currentVideo.collectionTags.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentVideo.collectionTags.map((tag, index) => (
                      <Badge
                        key={tag._id || index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => setSearch(tag.name)}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Notas */}
            {currentVideo.notes && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Notas</h4>
                  <CardDescription className="text-sm leading-relaxed whitespace-pre-wrap">
                    {currentVideo.notes}
                  </CardDescription>
                </div>
              </>
            )}

            {/* Ações */}
            <Separator />
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  window.open(
                    `https://youtube.com/watch?v=${
                      currentVideo.videoId || extractVideoId(currentVideo.url)
                    }`,
                    '_blank'
                  )
                }
              >
                <ExternalLink className="w-4 h-4" />
                Ver no YouTube
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default CurrentVideo;
