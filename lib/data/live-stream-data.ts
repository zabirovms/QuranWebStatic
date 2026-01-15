export interface LiveStream {
  id: string;
  title: string;
  url: string;
  description: string;
  badge?: string;
}

export function getAllLiveStreams(): LiveStream[] {
  return [
    {
      id: 'saudi-quran-tv',
      title: 'Quran TV – Makkah Live',
      url: 'https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8',
      description: '24/7 live from Masjid al-Haram',
      badge: 'HD',
    },
    {
      id: 'saudi-sunnah-tv',
      title: 'Sunnah TV – Madinah Live',
      url: 'https://cdn-globecast.akamaized.net/live/eds/saudi_sunnah/hls_roku/index.m3u8',
      description: 'Live from Masjid an-Nabawi',
      badge: 'HD',
    },
    {
      id: 'quran-radio-ksa',
      title: 'Quran Radio – KSA',
      url: 'https://live.kwikmotion.com/sbrksaquranradiolive/srpksaquranradio/playlist.m3u8',
      description: 'Continuous Quran recitation',
      badge: 'Radio',
    },
    {
      id: 'iqraa-quran',
      title: 'Iqraa Quran',
      url: 'https://playlist.fasttvcdn.com/pl/dlkqw1ftuvuuzkcb4pxdcg/Iqraafasttv2/playlist.m3u8',
      description: 'Iqraa TV Quran channel',
      badge: 'HD',
    },
    {
      id: 'holy-quran-nablus',
      title: 'Holy Quran Nablus',
      url: 'http://streaming.zaytonatube.com:8080/holyquran/holyquran/video.m3u8',
      description: 'Holy Quran TV (Nablus)',
      badge: 'Live',
    },
  ];
}

export function getLiveStreamById(id: string): LiveStream | undefined {
  return getAllLiveStreams().find(stream => stream.id === id);
}


