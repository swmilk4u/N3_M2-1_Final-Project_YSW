import {escapeHtml} from './domain.js';

// youtubeUrl에 소개 영상 주소를 넣으면 포스터 대신 유튜브 플레이어를 표시합니다.
export const heroMediaConfig = {
  youtubeUrl: '',
  posterSrc: '/brand-poster.png',
  posterAlt: '나도사장 — 사업 아이디어 저장소. 파란 재킷을 입은 CEO 너구리가 사업계획서를 소개합니다.',
};

export function getYouTubeEmbedUrl(input) {
  if (typeof input !== 'string' || !input.trim()) return null;
  let id = input.trim();
  if (!/^[\w-]{11}$/.test(id)) {
    let url;
    try { url = new URL(id); } catch { return null; }
    const hosts = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be', 'youtube-nocookie.com', 'www.youtube-nocookie.com'];
    if (url.protocol !== 'https:' || !hosts.includes(url.hostname)) return null;
    const parts = url.pathname.split('/').filter(Boolean);
    if (url.hostname.endsWith('youtu.be')) id = parts[0];
    else if (['embed', 'shorts', 'live'].includes(parts[0])) id = parts[1];
    else if (url.pathname === '/watch') id = url.searchParams.get('v');
    else return null;
  }
  return /^[\w-]{11}$/.test(id || '') ? `https://www.youtube.com/embed/${id}?playsinline=1` : null;
}

export function heroMedia(config = heroMediaConfig) {
  const embed = getYouTubeEmbedUrl(config.youtubeUrl);
  if (embed) {
    return `<figure class="hero-media is-video" aria-label="나도사장 소개 영상"><iframe src="${embed}" title="나도사장 소개 영상" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></figure>`;
  }
  return `<figure class="hero-media" aria-label="나도사장 브랜드 포스터"><img src="${escapeHtml(config.posterSrc || heroMediaConfig.posterSrc)}" alt="${escapeHtml(config.posterAlt || heroMediaConfig.posterAlt)}" width="1672" height="941" fetchpriority="high" decoding="async"></figure>`;
}
