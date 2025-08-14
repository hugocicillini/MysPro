import { VideoProps } from '@/lib/types';
import { Edit, MoreVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { videoService } from '../services';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface ListVideosProps {
  setCurrentVideo: React.Dispatch<React.SetStateAction<VideoProps | null>>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentId: React.Dispatch<React.SetStateAction<string>>;
  videos: VideoProps[];
}

const ListVideos = ({
  setCurrentVideo,
  setIsOpen,
  setCurrentId,
  videos,
}: ListVideosProps) => {
  const handleCurrentVideo = async (id: string) => {
    try {
      const video = await videoService.getVideoById(id);
      setCurrentVideo(video);
    } catch (error) {
      console.error('Erro ao buscar vídeo:', error);
    }
  };

  const handleEditVideo = (id: string) => {
    setIsOpen(true);
    setCurrentId(id);
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      await videoService.deleteVideo(id);
      window.location.reload();
    } catch (error) {
      console.error('Erro ao deletar vídeo:', error);
    }
  };

  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (videoId: string) => {
    setOpenMenus((prevState) => ({
      ...prevState,
      [videoId]: !prevState[videoId],
    }));
  };

  const closeMenu = (videoId: string) => {
    setOpenMenus((prevState) => ({
      ...prevState,
      [videoId]: false,
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-2">
        {videos.map((video) => (
          <Card
            className="relative w-full mb-3 cursor-pointer hover:shadow-md transition-shadow"
            key={video._id}
          >
            <CardContent
              className="flex p-0 h-20"
              onClick={() => handleCurrentVideo(video._id as string)}
            >
              <img
                src={
                  video.thumbnail ||
                  `https://img.youtube.com/vi/${
                    video.videoId || 'default'
                  }/hqdefault.jpg`
                }
                className="w-32 h-full rounded-l-lg object-cover flex-shrink-0"
                alt={`${video.name} thumbnail`}
              />
              <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
                <p
                  className="font-medium text-sm leading-tight overflow-hidden"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as any,
                    textOverflow: 'ellipsis',
                  }}
                >
                  {video.name}
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {video.notes}
                </p>
              </div>
            </CardContent>

            {/* Botão para abrir/fechar o menu */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu(video._id as string);
              }}
              className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>

            {/* Dropdown do menu para cada vídeo */}
            {openMenus[video._id as string] && (
              <div className="absolute right-0 z-10 top-10 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg">
                <ul className="py-1">
                  <li
                    className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 cursor-pointer text-sm"
                    onClick={() => {
                      handleEditVideo(video._id as string);
                      closeMenu(video._id as string);
                    }}
                  >
                    <Edit className="w-4 h-4 text-blue-600" />
                    <span>Editar</span>
                  </li>
                  <li
                    className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 cursor-pointer text-sm"
                    onClick={() => {
                      handleDeleteVideo(video._id as string);
                      closeMenu(video._id as string);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span>Excluir</span>
                  </li>
                </ul>
              </div>
            )}
          </Card>
        ))}
      </ScrollArea>
    </div>
  );
};

export default ListVideos;
