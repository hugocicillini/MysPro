// Utilitários para trabalhar com URLs do YouTube

export const extractVideoId = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

export const isValidYouTubeUrl = (url: string): boolean => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}/;
  return youtubeRegex.test(url);
};

export const generateThumbnailUrl = (videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'medium'): string => {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    standard: 'sddefault',
    maxres: 'maxresdefault'
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
};

// Função para extrair dados básicos do YouTube (sem API)
export const extractBasicYouTubeData = (url: string) => {
  const videoId = extractVideoId(url);
  
  if (!videoId) {
    throw new Error('URL do YouTube inválida');
  }

  return {
    videoId,
    thumbnail: generateThumbnailUrl(videoId),
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`
  };
};
