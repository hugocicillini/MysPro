import axios from 'axios';
import { useEffect, useState } from 'react';
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

interface NavbarProps {
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  status: string;
  search: string;
}

const Navbar = ({ setSearch, setStatus, status, search }: NavbarProps) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusOnCreate, setStatusOnCreate] = useState('');

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/tags')
      .then((response) => {
        setTags(response.data.map((tag: { name: string }) => tag.name));
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const createVideo = (e: any) => {
    e.preventDefault();

    const getYoutubeId = (url: string) => {
      let urlTrimmed = url
        .replace('https://www.youtube.com/watch?v=', '')
        .replace('https://youtu.be/', '')
        .split('&')[0];

      return urlTrimmed;
    };

    axios
      .post('http://localhost:5000/api/videos/create', {
        name,
        url: getYoutubeId(url),
        collectionTags: selectedTags,
        status: statusOnCreate,
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="flex justify-evenly p-4 items-center">
      <div className="space-x-2">
        <Button variant="outline" onClick={() => setStatus('learning')}>
          Aprendendo
        </Button>
        <Button variant="outline" onClick={() => setStatus('later')}>
          Futuros
        </Button>
        <Button variant="outline" onClick={() => setStatus('watched')}>
          Realizados
        </Button>
        <span
          className={`p-1 rounded-full ${
            status
              ? 'hover:scale-105 cursor-pointer bg-slate-200'
              : 'cursor-not-allowed'
          } transition-all`}
          onClick={() => {
            setStatus('');
          }}
        >
          ❌
        </span>
      </div>
      <div className="flex items-center">
        <Input
          placeholder="Insira o nome ou a tag"
          className="w-[300px] mr-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span
          className={`p-1 rounded-full ${
            search
              ? 'hover:scale-105 cursor-pointer bg-slate-200'
              : 'cursor-not-allowed'
          } transition-all`}
          onClick={() => {
            setSearch('');
          }}
        >
          ❌
        </span>
      </div>
      <Dialog>
        <DialogTrigger className="bg-gray-100 shadow-md rounded-md p-2 hover:scale-105 transition-all">
          Criar ➕
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">Adicionar Vídeo</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <form onSubmit={createVideo} className="space-y-4">
              <Input
                placeholder="Insira o nome do vídeo"
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Insira o link do vídeo"
                onChange={(e) => setUrl(e.target.value)}
              />
              <div className="flex flex-col h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                {tags.map((tagName) => (
                  <label
                    key={tagName}
                    className="flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-200"
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
              </div>
              <Select onValueChange={(value) => setStatusOnCreate(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="learning">Aprendendo</SelectItem>
                  <SelectItem value="watched">Realizados</SelectItem>
                  <SelectItem value="later">Futuros</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit">Adicionar</Button>
            </form>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Navbar;
