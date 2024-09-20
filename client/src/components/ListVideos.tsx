import { VideoProps } from '@/lib/types';
import axios from 'axios';
import { Card, CardContent } from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';

interface ListVideosProps {
  setCurrentVideo: React.Dispatch<
    React.SetStateAction<[string, string, string[]]>
  >;
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
  const handleCurrentVideo = (id: string) => {
    axios
      .get(`http://localhost:5000/api/videos/${id}`)
      .then((response) => {
        const video = response.data;
        const tagNames = video.collectionTags.map(
          (tag: { name: string }) => tag.name
        );
        setCurrentVideo([video.name, video.url, tagNames]);
      })
      .catch((error) => {
        console.error('Error fetching video:', error);
      });
  };

  const handleEditVideo = (id: string) => {
    setIsOpen(true);

    setCurrentId(id);
  };

  const handleDeleteVideo = (id: string) => {
    axios
      .delete(`http://localhost:5000/api/videos/${id}`)
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.error('Error deleting video:', error);
      });
  };

  return (
    <ScrollArea className="h-[80vh] w-[330px] flex flex-col rounded-sm border bg-card p-2">
      {videos.map((video) => (
        <Card
          className="relative w-[300px] mb-1 cursor-pointer"
          key={video._id}
        >
          <CardContent
            className="flex p-0 max-h-14"
            onClick={() => handleCurrentVideo(video._id as string)}
          >
            <img
              src={`https://img.youtube.com/vi/${video.url}/hqdefault.jpg`}
              width={100}
              className="rounded-s-lg object-cover"
              alt={`${video.name} thumbnail`}
            />
            <p className="truncate m-auto ml-2">{video.name}</p>
          </CardContent>
          <Popover>
            <PopoverTrigger className="absolute top-2.5 end-0 rotate-90 text-2xl">
              ...
            </PopoverTrigger>
            <PopoverContent>
              <ul className="space-y-2 cursor-pointer">
                <>
                  <li onClick={() => handleEditVideo(video._id as string)}>
                    ✏️
                  </li>
                  <li onClick={() => handleDeleteVideo(video._id as string)}>
                    🗑️
                  </li>
                </>
              </ul>
            </PopoverContent>
          </Popover>
        </Card>
      ))}
    </ScrollArea>
  );
};

export default ListVideos;
