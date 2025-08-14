import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { videoService, tagService } from '../services';

const ModalEdit = ({
  currentId,
  setIsOpen,
}: {
  currentId: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [video, setVideo] = useState({ name: '', url: '', status: '' });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [statusOnCreate, setStatusOnCreate] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar dados do vídeo
        const videoData = await videoService.getVideoById(currentId);
        setVideo({
          name: videoData.name,
          url: videoData.url,
          status: videoData.status,
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await videoService.updateVideo(currentId, {
        name: video.name,
        url: video.url,
        status: (statusOnCreate || video.status) as 'learning' | 'watched' | 'later',
        collectionTags: selectedTags,
      });

      setIsOpen(false);
      window.location.reload(); // Recarregar para mostrar as mudanças
    } catch (error) {
      console.error('Erro ao atualizar vídeo:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800">Editar Vídeo</h2>
        <form onSubmit={handleSave} className="space-y-4 mt-4">
          <Input
            placeholder="Insira o nome do vídeo"
            value={video.name}
            onChange={(e) => setVideo({ ...video, name: e.target.value })}
          />
          <Input
            placeholder="Insira o link do vídeo"
            value={video.url}
            onChange={(e) => setVideo({ ...video, url: e.target.value })}
          />

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Tags</h3>
            <ScrollArea className="h-32 p-2 border border-gray-300 rounded-lg">
              {tags.map((tagName) => (
                <label
                  key={tagName}
                  className="flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100"
                >
                  <input
                    type="checkbox"
                    value={tagName}
                    checked={selectedTags.includes(tagName)}
                    onChange={() => {
                      setSelectedTags((prev) =>
                        prev.includes(tagName)
                          ? prev.filter((t) => t !== tagName)
                          : [...prev, tagName]
                      );
                    }}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">{tagName}</span>
                </label>
              ))}
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Status</h3>
            <Select
              onValueChange={(value) => setStatusOnCreate(value)}
              value={statusOnCreate || video.status}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="learning">Aprendendo</SelectItem>
                <SelectItem value="watched">Realizados</SelectItem>
                <SelectItem value="later">Futuros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ModalEdit;
