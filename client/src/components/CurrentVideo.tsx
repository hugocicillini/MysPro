import { VideoProps } from '@/lib/types';
import {
  BookOpen,
  Check,
  ChevronsUpDown,
  Edit3,
  ExternalLink,
  Play,
  Plus,
  Star,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { tagService, videoService } from '../services';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Separator } from './ui/separator';

interface CurrentVideoProps {
  currentVideo: VideoProps | null;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  onVideoUpdate?: () => void; // Callback para recarregar a lista quando houver mudanças
  setCurrentVideo?: React.Dispatch<React.SetStateAction<VideoProps | null>>; // Para atualização local
}

const CurrentVideo = ({
  currentVideo,
  setSearch,
  onVideoUpdate,
  setCurrentVideo,
}: CurrentVideoProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState('');
  const [showTagsSelect, setShowTagsSelect] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Função para atualizar prioridade
  const updatePriority = async (newPriority: number) => {
    if (!currentVideo?._id) return;

    setIsUpdating(true);
    try {
      const updatedVideo = await videoService.updatePriority(
        currentVideo._id,
        newPriority
      );

      // Atualizar o estado local imediatamente
      if (setCurrentVideo) {
        setCurrentVideo(updatedVideo);
      }

      // Também recarregar a lista se callback fornecido
      onVideoUpdate?.();
    } catch (error) {
      console.error('Erro ao atualizar prioridade:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Função para buscar tags disponíveis
  const loadAvailableTags = async () => {
    try {
      const response = await tagService.getTags();
      const tagNames = response.tags.map((tag) => tag.name);

      // Filtrar tags que o vídeo já possui
      const currentTagNames =
        currentVideo?.collectionTags?.map((tag) => tag.name) || [];
      const availableTagNames = tagNames.filter(
        (tagName) => !currentTagNames.includes(tagName)
      );

      setAvailableTags(availableTagNames);
    } catch (error) {
      console.error('Erro ao carregar tags:', error);
      setAvailableTags([]);
    }
  };

  // Função para adicionar tag ao vídeo
  const addTagToVideo = async (tagName: string) => {
    if (!currentVideo?._id) return;

    setIsUpdating(true);
    try {
      // Adicionar a tag à lista atual
      const currentTagNames = currentVideo.collectionTags.map(
        (tag) => tag.name
      );
      const updatedTagNames = [...currentTagNames, tagName];

      const updatedVideo = await videoService.updateVideo(currentVideo._id, {
        collectionTags: updatedTagNames,
      });

      if (setCurrentVideo) {
        setCurrentVideo(updatedVideo);
      }
      onVideoUpdate?.();

      // Atualizar lista de tags disponíveis
      setAvailableTags((prev) => prev.filter((tag) => tag !== tagName));
      setShowTagsSelect(false);
    } catch (error) {
      console.error('Erro ao adicionar tag:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Função para remover tag do vídeo
  const removeTagFromVideo = async (tagName: string) => {
    if (!currentVideo?._id) return;

    setIsUpdating(true);
    try {
      // Remover a tag da lista atual
      const currentTagNames = currentVideo.collectionTags.map(
        (tag) => tag.name
      );
      const updatedTagNames = currentTagNames.filter((tag) => tag !== tagName);

      const updatedVideo = await videoService.updateVideo(currentVideo._id, {
        collectionTags: updatedTagNames,
      });

      if (setCurrentVideo) {
        setCurrentVideo(updatedVideo);
      }
      onVideoUpdate?.();

      // Adicionar tag de volta à lista disponível
      setAvailableTags((prev) => [...prev, tagName].sort());
    } catch (error) {
      console.error('Erro ao remover tag:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Funções para edição inline
  const startTitleEdit = () => {
    setEditingTitle(true);
    setTempTitle(currentVideo?.name || '');
  };

  const saveTitleEdit = async () => {
    if (!currentVideo?._id || tempTitle.trim() === '') {
      setEditingTitle(false);
      return;
    }

    setIsUpdating(true);
    try {
      const updatedVideo = await videoService.updateVideo(currentVideo._id, {
        name: tempTitle.trim(),
      });

      if (setCurrentVideo) {
        setCurrentVideo(updatedVideo);
      }
      onVideoUpdate?.();
    } catch (error) {
      console.error('Erro ao atualizar título:', error);
    } finally {
      setEditingTitle(false);
      setIsUpdating(false);
    }
  };

  const cancelTitleEdit = () => {
    setEditingTitle(false);
    setTempTitle('');
  };

  const startDescriptionEdit = () => {
    setEditingDescription(true);
    setTempDescription(currentVideo?.description || '');
  };

  const saveDescriptionEdit = async () => {
    if (!currentVideo?._id) {
      setEditingDescription(false);
      return;
    }

    setIsUpdating(true);
    try {
      const updatedVideo = await videoService.updateVideo(currentVideo._id, {
        description: tempDescription.trim(),
      });

      if (setCurrentVideo) {
        setCurrentVideo(updatedVideo);
      }
      onVideoUpdate?.();
    } catch (error) {
      console.error('Erro ao atualizar descrição:', error);
    } finally {
      setEditingDescription(false);
      setIsUpdating(false);
    }
  };

  const cancelDescriptionEdit = () => {
    setEditingDescription(false);
    setTempDescription('');
  };

  const startNotesEdit = () => {
    setEditingNotes(true);
    setTempNotes(currentVideo?.notes || '');
  };

  const saveNotesEdit = async () => {
    if (!currentVideo?._id) {
      setEditingNotes(false);
      return;
    }

    setIsUpdating(true);
    try {
      const updatedVideo = await videoService.updateVideo(currentVideo._id, {
        notes: tempNotes.trim(),
      });

      if (setCurrentVideo) {
        setCurrentVideo(updatedVideo);
      }
      onVideoUpdate?.();
    } catch (error) {
      console.error('Erro ao atualizar notas:', error);
    } finally {
      setEditingNotes(false);
      setIsUpdating(false);
    }
  };

  const cancelNotesEdit = () => {
    setEditingNotes(false);
    setTempNotes('');
  };

  // Função para atualizar status
  const updateStatus = async (newStatus: 'learning' | 'watched' | 'later') => {
    if (!currentVideo?._id) return;

    setIsUpdating(true);
    try {
      const updateData: any = { status: newStatus };

      // Se marcar como assistido, adicionar a data
      if (newStatus === 'watched') {
        updateData.dateWatched = new Date().toISOString();
      }

      const updatedVideo = await videoService.updateVideo(
        currentVideo._id,
        updateData
      );

      if (setCurrentVideo) {
        setCurrentVideo(updatedVideo);
      }
      onVideoUpdate?.();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Função para atualizar difficulty
  const updateDifficulty = async (
    newDifficulty: 'beginner' | 'intermediate' | 'advanced'
  ) => {
    if (!currentVideo?._id) return;

    setIsUpdating(true);
    try {
      const updatedVideo = await videoService.updateVideo(currentVideo._id, {
        difficulty: newDifficulty,
      });

      if (setCurrentVideo) {
        setCurrentVideo(updatedVideo);
      }
      onVideoUpdate?.();
    } catch (error) {
      console.error('Erro ao atualizar dificuldade:', error);
    } finally {
      setIsUpdating(false);
    }
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
            <p className="text-sm text-center max-w-xs mb-4">
              Escolha um vídeo da lista para começar a assistir
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full border">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-gray-600 font-mono text-xs">
                ESC
              </kbd>
              <span>para voltar aqui quando assistindo</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 overflow-hidden flex flex-col">
        {/* Player de Vídeo */}
        <div className="relative bg-black shrink-0">
          <iframe
            width="100%"
            height="480"
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
                {/* Título Editável */}
                <div className="mb-2">
                  {editingTitle ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        onBlur={saveTitleEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTitleEdit();
                          if (e.key === 'Escape') cancelTitleEdit();
                        }}
                        className="text-lg font-semibold"
                        autoFocus
                        disabled={isUpdating}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={saveTitleEdit}
                        disabled={isUpdating}
                      >
                        <Check className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelTitleEdit}
                        disabled={isUpdating}
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 group">
                      <CardTitle
                        className="text-lg leading-tight cursor-pointer hover:bg-gray-50 hover:rounded-lg px-2 py-1 -mx-2 transition-all"
                        onDoubleClick={startTitleEdit}
                      >
                        {currentVideo.name}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-all p-1 h-auto hover:bg-gray-100 rounded-md"
                        onClick={startTitleEdit}
                        disabled={isUpdating}
                      >
                        <Edit3 className="w-4 h-4 text-gray-500" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Select de Status */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={currentVideo.status}
                      onValueChange={(value) =>
                        updateStatus(value as 'learning' | 'watched' | 'later')
                      }
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-auto min-w-[120px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="learning">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            Aprendendo
                          </div>
                        </SelectItem>
                        <SelectItem value="watched">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            Realizado
                          </div>
                        </SelectItem>
                        <SelectItem value="later">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            Futuros
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select de Difficulty */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={currentVideo.difficulty || ''}
                      onValueChange={(value) =>
                        updateDifficulty(
                          value as 'beginner' | 'intermediate' | 'advanced'
                        )
                      }
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-auto min-w-[120px] h-8 text-xs">
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            Iniciante
                          </div>
                        </SelectItem>
                        <SelectItem value="intermediate">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                            Intermediário
                          </div>
                        </SelectItem>
                        <SelectItem value="advanced">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            Avançado
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select de Prioridade */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={currentVideo.priority?.toString() || ''}
                      onValueChange={(value) => updatePriority(parseInt(value))}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-auto min-w-[120px] h-8 text-xs">
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">
                          <div className="flex items-center gap-2">
                            <Star className="w-3 h-3 text-green-500 fill-current" />
                            Baixa
                          </div>
                        </SelectItem>
                        <SelectItem value="2">
                          <div className="flex items-center gap-2">
                            <Star className="w-3 h-3 text-green-500 fill-current" />
                            Baixa-Média
                          </div>
                        </SelectItem>
                        <SelectItem value="3">
                          <div className="flex items-center gap-2">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            Média
                          </div>
                        </SelectItem>
                        <SelectItem value="4">
                          <div className="flex items-center gap-2">
                            <Star className="w-3 h-3 text-red-500 fill-current" />
                            Média-Alta
                          </div>
                        </SelectItem>
                        <SelectItem value="5">
                          <div className="flex items-center gap-2">
                            <Star className="w-3 h-3 text-red-500 fill-current" />
                            Alta
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
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

            {/* Ações Rápidas */}
            {(!currentVideo.description || !currentVideo.notes) && (
              <div className="flex gap-2">
                {!currentVideo.description && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={startDescriptionEdit}
                    disabled={isUpdating}
                  >
                    <Edit3 className="w-4 h-4" />
                    Adicionar Descrição
                  </Button>
                )}
                {!currentVideo.notes && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={startNotesEdit}
                    disabled={isUpdating}
                  >
                    <Edit3 className="w-4 h-4" />
                    Adicionar Notas
                  </Button>
                )}
              </div>
            )}

            {/* Descrição Editável */}
            {(currentVideo.description || editingDescription) && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <h4 className="font-medium">Descrição</h4>
                    {!editingDescription && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-md transition-all"
                        onClick={startDescriptionEdit}
                        disabled={isUpdating}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {editingDescription ? (
                    <div className="space-y-2">
                      <textarea
                        value={tempDescription}
                        onChange={(e) => setTempDescription(e.target.value)}
                        className="w-full min-h-[100px] p-2 text-sm border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Adicione uma descrição..."
                        autoFocus
                        disabled={isUpdating}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={saveDescriptionEdit}
                          disabled={isUpdating}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Salvar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelDescriptionEdit}
                          disabled={isUpdating}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <CardDescription
                      className="text-sm leading-relaxed cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 -mx-2 transition-colors"
                      onDoubleClick={startDescriptionEdit}
                    >
                      {currentVideo.description ||
                        'Clique para adicionar uma descrição...'}
                    </CardDescription>
                  )}
                </div>
              </>
            )}

            {/* Tags */}
            {currentVideo.collectionTags.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2 items-center">
                    {currentVideo.collectionTags.map((tag, index) => (
                      <Badge
                        key={tag._id || index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-gray-200 transition-colors group pl-3 py-1 flex items-center gap-1"
                        onClick={() => setSearch(tag.name)}
                      >
                        <span>{tag.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTagFromVideo(tag.name);
                          }}
                          className="ml-1 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-gray-300 rounded-full transition-all"
                          disabled={isUpdating}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}

                    {/* Combobox para adicionar tags */}
                    <Popover
                      open={showTagsSelect}
                      onOpenChange={setShowTagsSelect}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!showTagsSelect) {
                              loadAvailableTags();
                            }
                          }}
                          disabled={isUpdating}
                          className="h-6 w-6 p-0 rounded-full hover:bg-blue-50 border-dashed border-blue-300 hover:border-blue-400 transition-colors"
                        >
                          <Plus className="w-3 h-3 text-blue-500" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[250px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar tags..." />
                          <CommandList>
                            <CommandEmpty>Nenhuma tag encontrada.</CommandEmpty>
                            <CommandGroup>
                              {availableTags.map((tagName) => (
                                <CommandItem
                                  key={tagName}
                                  value={tagName}
                                  onSelect={() => {
                                    addTagToVideo(tagName);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Check className="mr-2 h-4 w-4 opacity-0" />
                                  {tagName}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </>
            )}

            {/* Se não há tags, mostrar botão para adicionar */}
            {currentVideo.collectionTags.length === 0 && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-4">
                    <h4 className="font-medium">Tags</h4>
                    <Popover
                      open={showTagsSelect}
                      onOpenChange={setShowTagsSelect}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!showTagsSelect) {
                              loadAvailableTags();
                            }
                          }}
                          disabled={isUpdating}
                          className="gap-1 text-xs h-7"
                        >
                          <Plus className="w-3 h-3" />
                          Adicionar Tag
                          <ChevronsUpDown className="w-3 h-3 ml-1" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Buscar tags..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>Nenhuma tag encontrada.</CommandEmpty>
                            <CommandGroup className="max-h-[200px] overflow-auto">
                              {availableTags.map((tagName) => (
                                <CommandItem
                                  key={tagName}
                                  value={tagName}
                                  onSelect={() => {
                                    addTagToVideo(tagName);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Check className="mr-2 h-4 w-4 opacity-0" />
                                  {tagName}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </>
            )}

            {/* Notas Editáveis */}
            {(currentVideo.notes || editingNotes) && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <h4 className="font-medium">Notas</h4>
                    {!editingNotes && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-md transition-all"
                        onClick={startNotesEdit}
                        disabled={isUpdating}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {editingNotes ? (
                    <div className="space-y-2">
                      <textarea
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        className="w-full min-h-[120px] p-2 text-sm border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Adicione suas notas..."
                        autoFocus
                        disabled={isUpdating}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={saveNotesEdit}
                          disabled={isUpdating}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Salvar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelNotesEdit}
                          disabled={isUpdating}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <CardDescription
                      className="text-sm leading-relaxed whitespace-pre-wrap cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2 transition-colors"
                      onDoubleClick={startNotesEdit}
                    >
                      {currentVideo.notes || 'Clique para adicionar notas...'}
                    </CardDescription>
                  )}
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
