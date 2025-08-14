import {
  AlignLeft,
  Gauge,
  Plus,
  Star,
  StickyNote,
  Tag,
  TrendingUp,
  Video,
} from 'lucide-react';
import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface CreateVideoProps {
  description?: string;
  setDescription?: (desc: string) => void;
  difficulty?: string;
  setDifficulty?: (diff: string) => void;
  priority?: string;
  setPriority?: (priority: string) => void;
  notes?: string;
  setNotes?: (notes: string) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  name: string;
  setName: (name: string) => void;
  url: string;
  setUrl: (url: string) => void;
  statusOnCreate: string;
  setStatusOnCreate: (status: string) => void;
  tags: string[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  createVideo: (e: React.FormEvent<HTMLFormElement>) => void;
}

const CreateVideo: React.FC<CreateVideoProps> = ({
  isDialogOpen,
  setIsDialogOpen,
  name,
  setName,
  url,
  setUrl,
  statusOnCreate = 'learning',
  setStatusOnCreate,
  tags,
  selectedTags,
  setSelectedTags,
  createVideo,
  description = '',
  setDescription = () => {},
  difficulty = 'beginner',
  setDifficulty = () => {},
  priority = '3',
  setPriority = () => {},
  notes = '',
  setNotes = () => {},
}) => {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="ml-4">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Vídeo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-blue-600" />
            Adicionar Novo Vídeo
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <form onSubmit={createVideo} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Nome do Vídeo
                </label>
                <Input
                  placeholder="Ex: Tutorial React Avançado"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  URL do YouTube
                </label>
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <AlignLeft className="h-4 w-4" />
                Descrição
              </label>
              <Textarea
                placeholder="Breve descrição do vídeo..."
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDescription(e.target.value)
                }
                className="w-full"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <Select
                  value={statusOnCreate}
                  onValueChange={setStatusOnCreate}
                  required
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
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" /> Dificuldade
                </label>
                <Select
                  value={difficulty}
                  onValueChange={setDifficulty}
                  required
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Star className="h-4 w-4" />
                Prioridade
              </label>
              <Select value={priority} onValueChange={setPriority} required>
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <StickyNote className="h-4 w-4" />
                Notas pessoais
              </label>
              <Textarea
                placeholder="Suas anotações sobre o vídeo..."
                value={notes}
                onChange={(e: any) => setNotes(e.target.value)}
                className="w-full"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Tag className="h-4 w-4" />
                Tags (opcional)
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                {tags.length > 0 ? (
                  <div className="space-y-2">
                    {tags.map((tagName) => (
                      <label
                        key={tagName}
                        className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white rounded p-2 transition-colors"
                      >
                        <input
                          type="checkbox"
                          value={tagName}
                          checked={selectedTags.includes(tagName)}
                          onChange={() => {
                            setSelectedTags(
                              selectedTags.includes(tagName)
                                ? selectedTags.filter((t) => t !== tagName)
                                : [...selectedTags, tagName]
                            );
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{tagName}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">
                    Nenhuma tag disponível
                  </p>
                )}
              </div>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default CreateVideo;
