import { CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import React from 'react';
import { Button } from './ui/button';

interface StatusFilterProps {
  status: string;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ status, setStatus }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
        <Button
          variant={status === 'learning' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setStatus(status === 'learning' ? '' : 'learning')}
          className="h-8 px-3"
        >
          <PlayCircle className="h-4 w-4 mr-1" />
          Aprendendo
        </Button>
        <Button
          variant={status === 'later' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setStatus(status === 'later' ? '' : 'later')}
          className="h-8 px-3"
        >
          <Clock className="h-4 w-4 mr-1" />
          Futuros
        </Button>
        <Button
          variant={status === 'watched' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setStatus(status === 'watched' ? '' : 'watched')}
          className="h-8 px-3"
        >
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Realizados
        </Button>
      </div>
    </div>
  );
};

export default StatusFilter;
