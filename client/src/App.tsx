import { useEffect, useState } from 'react';
import CurrentVideo from './components/CurrentVideo';
import ListVideos from './components/ListVideos';
import ModalEdit from './components/ModalEdit';
import Navbar from './components/Navbar';
import { VideoProps } from './lib/types';
import { videoService } from './services';

function App() {
  const [videos, setVideos] = useState<VideoProps[]>([]);
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [currentId, setCurrentId] = useState<string>('');
  const [currentVideo, setCurrentVideo] = useState<VideoProps | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        let response;

        if (search.trim()) {
          // Usar busca avançada se houver termo de busca
          response = await videoService.searchVideos(search.trim(), {
            status: status || undefined,
            priority: priority ? Number(priority) : undefined,
            difficulty: difficulty || undefined,
            page: 1,
            limit: 50,
          });
        } else {
          // Usar listagem normal com filtros
          response = await videoService.getVideos({
            status: status || undefined,
            priority: priority ? Number(priority) : undefined,
            difficulty: difficulty || undefined,
            page: 1,
            limit: 50,
          });
        }

        setVideos(response.videos);
      } catch (error) {
        console.error('Erro ao buscar vídeos:', error);
      }
    };

    fetchVideos();
  }, [search, status, priority, difficulty]);

  const refreshVideos = async () => {
    try {
      let response;

      if (search.trim()) {
        response = await videoService.searchVideos(search.trim(), {
          status: status || undefined,
          priority: priority ? Number(priority) : undefined,
          difficulty: difficulty || undefined,
          page: 1,
          limit: 50,
        });
      } else {
        response = await videoService.getVideos({
          status: status || undefined,
          priority: priority ? Number(priority) : undefined,
          difficulty: difficulty || undefined,
          page: 1,
          limit: 50,
        });
      }

      setVideos(response.videos);
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error);
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-blue-50 via-purple-100 to-pink-50 flex flex-col">
      <div className="flex-1 w-4/5 bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl m-8 mx-auto flex flex-col overflow-hidden">
        <Navbar
          setSearch={setSearch}
          setStatus={setStatus}
          status={status}
          search={search}
          priority={priority}
          setPriority={setPriority}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
        />
        <div className="flex flex-col md:flex-row gap-6 p-6 flex-1 overflow-hidden">
          <div className="w-1/4">
            <ListVideos
              setCurrentVideo={setCurrentVideo}
              setIsOpen={setIsOpen}
              setCurrentId={setCurrentId}
              videos={videos}
            />
          </div>
          <div className="md:w-4/5 w-full flex flex-col gap-4 overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <CurrentVideo
                currentVideo={currentVideo}
                setSearch={setSearch}
                onVideoUpdate={refreshVideos}
              />
            </div>
            {isOpen && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 max-h-96 overflow-y-auto">
                <ModalEdit currentId={currentId} setIsOpen={setIsOpen} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
