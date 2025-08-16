import {
  AlignLeft,
  Edit,
  Gauge,
  Plus,
  Star,
  StickyNote,
  Tag,
  TrendingUp,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { tagService, videoService } from '../services';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';

const ModalEdit = ({
  currentId,
  setIsOpen,
}: {
  currentId: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [video, setVideo] = useState({
    name: '',
    url: '',
    status: '',
    description: '',
    difficulty: '',
    priority: '',
    notes: '',
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar dados do vídeo
        const videoData = await videoService.getVideoById(currentId);
        setVideo({
          name: videoData.name,
          url: videoData.url,
          status: videoData.status,
          description: videoData.description || '',
          difficulty: videoData.difficulty || 'beginner',
          priority: videoData.priority?.toString() || '3',
          notes: videoData.notes || '',
        });
        setSelectedTags(
          videoData.collectionTags.map((tag: { name: string }) => tag.name)
        );

        // Buscar todas as tags
        const tagsResponse = await tagService.getTags({ limit: 100 });
        setTags(tagsResponse.tags.map((tag) => tag.name));
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, [currentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await videoService.updateVideo(currentId, {
        name: video.name,
        url: video.url,
        status: video.status as 'learning' | 'watched' | 'later',
        description: video.description,
        difficulty: video.difficulty as
          | 'beginner'
          | 'intermediate'
          | 'advanced',
        priority: parseInt(video.priority),
        notes: video.notes,
        collectionTags: selectedTags,
      });

      setIsOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Erro ao atualizar vídeo:', error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" />
            Editar Vídeo
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Nome e URL do Vídeo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 flex items-center">
                  Nome do Vídeo
                </label>
                <Input
                  type="text"
                  value={video.name}
                  onChange={(e) => setVideo({ ...video, name: e.target.value })}
                  placeholder="Ex: Tutorial React Avançado"
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 flex items-center">
                  URL do YouTube
                </label>
                <Input
                  type="url"
                  value={video.url}
                  onChange={(e) => setVideo({ ...video, url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 flex items-center gap-1">
                <AlignLeft className="h-4 w-4" />
                Descrição
              </label>
              <Textarea
                value={video.description}
                onChange={(e) =>
                  setVideo({ ...video, description: e.target.value })
                }
                placeholder="Breve descrição do vídeo..."
                rows={2}
                className="w-full"
              />
            </div>

            {/* Status e Dificuldade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 flex items-center">
                  Status
                </label>
                <Select
                  value={video.status}
                  onValueChange={(value) =>
                    setVideo({ ...video, status: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="learning">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Aprendendo
                      </div>
                    </SelectItem>
                    <SelectItem value="later">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" /> Para Depois
                      </div>
                    </SelectItem>
                    <SelectItem value="watched">
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4" /> Assistido
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" /> Dificuldade
                </label>
                <Select
                  value={video.difficulty}
                  onValueChange={(value) =>
                    setVideo({ ...video, difficulty: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 flex items-center gap-1">
                <Star className="h-4 w-4" />
                Prioridade
              </label>
              <Select
                value={video.priority}
                onValueChange={(value) =>
                  setVideo({ ...video, priority: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Baixa</SelectItem>
                  <SelectItem value="2">2 - Baixa/Média</SelectItem>
                  <SelectItem value="3">3 - Média</SelectItem>
                  <SelectItem value="4">4 - Média/Alta</SelectItem>
                  <SelectItem value="5">5 - Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 flex items-center gap-1">
                <StickyNote className="h-4 w-4" />
                Notas pessoais
              </label>
              <Textarea
                value={video.notes}
                onChange={(e) => setVideo({ ...video, notes: e.target.value })}
                placeholder="Suas anotações sobre o vídeo..."
                rows={2}
                className="w-full"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 flex items-center gap-1">
                <Tag className="h-4 w-4" />
                Tags (opcional)
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                {tags.length > 0 ? (
                  <div className="space-y-2">
                    {tags.map((tagName) => (
                      <div
                        key={tagName}
                        className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white rounded p-2 transition-colors"
                        onClick={() => {
                          setSelectedTags(
                            selectedTags.includes(tagName)
                              ? selectedTags.filter((t) => t !== tagName)
                              : [...selectedTags, tagName]
                          );
                        }}
                      >
                        <input
                          type="checkbox"
                          value={tagName}
                          checked={selectedTags.includes(tagName)}
                          onChange={() => {}} // Controlado pelo onClick do div
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                        />
                        <span className="flex-1">{tagName}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">
                    Nenhuma tag disponível
                  </p>
                )}
              </div>
              {/* Área fixa para tags selecionadas */}
              <div className="h-6 mt-6">
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 h-full overflow-y-auto">
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs h-fit pr-1 pl-2 flex items-center gap-1 group"
                      >
                        <span>{tag}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTags(
                              selectedTags.filter((t) => t !== tag)
                            );
                          }}
                          className="ml-1 h-4 w-4 p-0 hover:bg-gray-300 rounded-full transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default ModalEdit;
