import { Filter, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { tagService, videoService } from '../services';
import CreateVideo from './CreateVideo';
import SearchBar from './SearchBar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface NavbarProps {
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  status: string;
  search: string;
  priority?: string;
  setPriority?: React.Dispatch<React.SetStateAction<string>>;
  difficulty?: string;
  setDifficulty?: React.Dispatch<React.SetStateAction<string>>;
}

const Navbar = ({
  setSearch,
  setStatus,
  status,
  search,
  priority = '',
  setPriority = () => {},
  difficulty = '',
  setDifficulty = () => {},
}: NavbarProps) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusOnCreate, setStatusOnCreate] = useState('learning');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await tagService.getTags({ limit: 100 });
        setTags(response.tags.map((tag) => tag.name));
      } catch (error) {
        console.error('Erro ao buscar tags:', error);
      }
    };

    fetchTags();
  }, []);

  const createVideo = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await videoService.createVideo({
        name,
        url,
        collectionTags: selectedTags,
        status: statusOnCreate as 'learning' | 'watched' | 'later',
      });

      // Limpar formulário
      setName('');
      setUrl('');
      setSelectedTags([]);
      setStatusOnCreate('learning');
      setIsDialogOpen(false);

      // Recarregar página para mostrar o novo vídeo
      window.location.reload();
    } catch (error) {
      console.error('Erro ao criar vídeo:', error);
    }
  };

  const clearAllFilters = () => {
    setStatus('');
    setPriority('');
    setDifficulty('');
    setSearch('');
  };

  const activeFiltersCount = [status, priority, difficulty, search].filter(
    Boolean
  ).length;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      {/* Header Principal */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Video className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">MysPro</h1>
          </div>

          {/* Search Bar - Centralizada */}
          <div className="flex-1 max-w-2xl mx-8">
            <SearchBar search={search} setSearch={setSearch} />
          </div>

          {/* Create Video Button */}
          <CreateVideo
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            name={name}
            setName={setName}
            url={url}
            setUrl={setUrl}
            statusOnCreate={statusOnCreate}
            setStatusOnCreate={setStatusOnCreate}
            tags={tags}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            createVideo={createVideo}
          />
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Filtros:
                </span>
              </div>

              {/* Status Filter */}
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-40 h-8">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="learning">Aprendendo</SelectItem>
                  <SelectItem value="later">Para Depois</SelectItem>
                  <SelectItem value="watched">Assistido</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-40 h-8">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Baixa</SelectItem>
                  <SelectItem value="2">2 - Baixa/Média</SelectItem>
                  <SelectItem value="3">3 - Média</SelectItem>
                  <SelectItem value="4">4 - Média/Alta</SelectItem>
                  <SelectItem value="5">5 - Alta</SelectItem>
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-40 h-8">
                  <SelectValue placeholder="Dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Iniciante</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters Count & Clear Button */}
            <div className="flex items-center gap-3">
              {activeFiltersCount > 0 && (
                <>
                  <Badge variant="secondary" className="text-xs">
                    {activeFiltersCount} filtro
                    {activeFiltersCount > 1 ? 's' : ''} ativo
                    {activeFiltersCount > 1 ? 's' : ''}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-8 text-xs"
                  >
                    Limpar filtros
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
