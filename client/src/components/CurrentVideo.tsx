import { Badge } from './ui/badge';
import { Card } from './ui/card';

const CurrentVideo = ({
  currentVideo,
  setSearch,
}: {
  currentVideo: [string, string, string[]];
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [videoTitle, videoUrl, tags] = currentVideo;

  return (
    <div className="flex-1">
      <Card className="h-[80vh] shadow-none rounded-sm">
        {videoTitle ? (
          <>
            <iframe
              width="100%"
              height="80%"
              src={`https://www.youtube.com/embed/${videoUrl}?controls=1`}
              allowFullScreen
              title={videoTitle}
            ></iframe>
            <div className="p-4 flex flex-col gap-4">
              <h1>{videoTitle}</h1>
              <aside className="flex gap-2">
                {tags.map((tag, index) => (
                  <Badge key={tag + index} onClick={() => setSearch(tag)}>
                    {tag}
                  </Badge>
                ))}
              </aside>
            </div>
          </>
        ) : (
          <img src="/no-video.png" alt="Nenhum vídeo selecionado" />
        )}
      </Card>
    </div>
  );
};

export default CurrentVideo;
