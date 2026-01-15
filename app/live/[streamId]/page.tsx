'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getLiveStreamById } from '@/lib/data/live-stream-data';

export default function LiveStreamPage({
  params,
}: {
  params: { streamId: string };
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [stream, setStream] = useState(getLiveStreamById(params.streamId));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!stream) return;

    const video = videoRef.current;
    if (!video) return;

    // Check if HLS is supported
    const loadHLS = async () => {
      try {
        // Dynamically import hls.js
        const Hls = (await import('hls.js')).default;

        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
          });

          hls.loadSource(stream.url);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            setError(null);
            video.play().catch((err) => {
              console.error('Error playing video:', err);
              setError('Хатоги дар пахши видео');
            });
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error('Network error, trying to recover...');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error('Media error, trying to recover...');
                  hls.recoverMediaError();
                  break;
                default:
                  console.error('Fatal error, destroying HLS instance');
                  hls.destroy();
                  setError('Хатоги дар пахши видео');
                  setIsLoading(false);
                  break;
              }
            }
          });

          hlsRef.current = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          video.src = stream.url;
          video.addEventListener('loadedmetadata', () => {
            setIsLoading(false);
            setError(null);
            video.play().catch((err) => {
              console.error('Error playing video:', err);
              setError('Хатоги дар пахши видео');
            });
          });
        } else {
          setError('Браузери шумо видеоро дастгирӣ намекунад');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading HLS:', err);
        setError('Хатоги дар боргирии видео');
        setIsLoading(false);
      }
    };

    loadHLS();

    // Handle fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Auto-hide controls
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const handleMouseLeave = () => {
      setShowControls(false);
    };

    video.addEventListener('mousemove', handleMouseMove);
    video.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      video.removeEventListener('mousemove', handleMouseMove);
      video.removeEventListener('mouseleave', handleMouseLeave);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [stream]);

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if ((video as any).webkitRequestFullscreen) {
        (video as any).webkitRequestFullscreen();
      } else if ((video as any).mozRequestFullScreen) {
        (video as any).mozRequestFullScreen();
      } else if ((video as any).msRequestFullscreen) {
        (video as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  if (!stream) {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>
            Пахш ёфт нашуд
          </h1>
          <button
            onClick={() => router.back()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#4a90e2',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Бозгашт
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#000',
      paddingBottom: '80px',
    }}>
      <div style={{
        padding: '16px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <div>
            <h1 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              marginBottom: '4px',
              color: '#fff',
            }}>
              {stream.title}
            </h1>
            {stream.description && (
              <p style={{
                fontSize: '0.875rem',
                color: '#ccc',
              }}>
                {stream.description}
              </p>
            )}
          </div>
          <button
            onClick={() => router.back()}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          position: 'relative',
          paddingBottom: '56.25%', // 16:9 aspect ratio
          height: 0,
          backgroundColor: '#000',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          {isLoading && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#fff',
              zIndex: 10,
            }}>
              Боргирӣ карда истодааст...
            </div>
          )}

          {error && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#fff',
              textAlign: 'center',
              zIndex: 10,
            }}>
              <p style={{ marginBottom: '16px' }}>{error}</p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4a90e2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Боз кӯшиш кунед
              </button>
            </div>
          )}

          <video
            ref={videoRef}
            controls={showControls}
            autoPlay
            playsInline
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          />

          {/* Custom fullscreen button */}
          <button
            onClick={toggleFullscreen}
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              padding: '8px 12px',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              zIndex: 20,
              opacity: showControls ? 1 : 0,
              transition: 'opacity 0.3s',
            }}
          >
            {isFullscreen ? '⤓' : '⤢'}
          </button>
        </div>
      </div>
    </div>
  );
}
