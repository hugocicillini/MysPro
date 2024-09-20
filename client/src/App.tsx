import axios from 'axios';
import { useEffect, useState } from 'react';
import CurrentVideo from './components/CurrentVideo';
import ListVideos from './components/ListVideos';
import Navbar from './components/Navbar';
import { Separator } from './components/ui/separator';
import { VideoProps } from './lib/types';
import ModalEdit from './components/ModalEdit';

function App() {
  const [videos, setVideos] = useState<VideoProps[]>([]);
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [currentId, setCurrentId] = useState<string>('');
  const [currentVideo, setCurrentVideo] = useState<[string, string, string[]]>([
    '',
    '',
    [''],
  ]);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/videos')
      .then((response) => {
        const searchString = search.trim().toLowerCase();
        const tagString = status ? status.trim().toLowerCase() : '';

        if (status) {
          setSearch('');
        }

        console.log(search, status);

        if (!searchString && !tagString) {
          setVideos(response.data);
          return;
        }

        const filteredVideos = response.data.filter((video: VideoProps) => {
          const nameMatches = video.name.toLowerCase().includes(searchString);
          const tagMatches =
            Array.isArray(video.collectionTags) &&
            video.collectionTags.some((tag) => {
              return tag.name.toLowerCase().includes(searchString);
            });

          const statusMatches = !searchString
            ? video.status && video.status.toLowerCase() === tagString
            : true;

          return (nameMatches || tagMatches) && statusMatches;
        });

        setVideos(filteredVideos);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [search, status]);

  return (
    <div className="w-[80vw] border-gray-100 border rounded-lg shadow-md mt-12 mx-auto">
      <Navbar
        setSearch={setSearch}
        setStatus={setStatus}
        status={status}
        search={search}
      />
      <Separator />
      <div className="flex p-4 gap-2">
        <ListVideos
          setCurrentVideo={setCurrentVideo}
          setIsOpen={setIsOpen}
          setCurrentId={setCurrentId}
          videos={videos}
        />
        <CurrentVideo currentVideo={currentVideo} setSearch={setSearch} />
        {isOpen && <ModalEdit currentId={currentId} setIsOpen={setIsOpen} />}
      </div>
    </div>
  );
}

export default App;
