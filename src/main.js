import './style.css'

const app = document.querySelector('#app')
const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

const photoRange = (folder, prefix, count, albumName, titlePrefix, place, ratios = {}, start = 1) =>
  Array.from({ length: count - start + 1 }, (_, index) => {
    const number = String(index + start).padStart(2, '0')

    return {
      type: 'photo',
      src: asset(`/picture/${folder}/${prefix}-${number}.jpg`),
      title: `${titlePrefix} ${number}`,
      place,
      albumName,
      ratio: ratios[number],
    }
  })

const berlinRatios = {
  '01': 2.14,
  '02': 2.25,
  '03': 1.7,
  '04': 1.88,
  '05': 1.74,
  '06': 1.85,
  '07': 1.5,
  '08': 1.5,
  '09': 1.5,
  10: 1.95,
  11: 2.45,
  12: 2.04,
  13: 0.67,
  14: 0.67,
  15: 0.67,
  16: 0.67,
  17: 0.67,
  18: 0.67,
  19: 0.57,
  20: 0.77,
}

const partyRatios = {
  '01': 1.33,
  '02': 1.5,
  '03': 1.5,
  '04': 2,
  '05': 1.96,
  '06': 1.3,
  '07': 1.43,
  '08': 1.5,
  '09': 1.5,
  10: 0.81,
  11: 0.71,
  12: 0.67,
  13: 0.67,
  14: 1.5,
  15: 1.5,
  16: 0.67,
  17: 0.67,
  18: 0.67,
  19: 0.75,
  20: 1.33,
}

function balanceByOrientation(items) {
  const wide = items.filter((item) => item.ratio >= 1.25)
  const portrait = items.filter((item) => item.ratio < 1.25)
  const ordered = []

  while (wide.length || portrait.length) {
    if (wide.length) ordered.push(wide.shift())
    if (wide.length) ordered.push(wide.shift())
    if (portrait.length) ordered.push(portrait.shift())
  }

  return ordered
}

const partyVideos = [
  ...Array.from({ length: 3 }, (_, index) => {
    const number = String(index + 1).padStart(2, '0')

    return {
      type: 'video',
      src: asset(`/picture/Weddingparty/party-video-${number}.mp4`),
      title: `相聚哈勒视频 ${number}`,
      place: '相聚哈勒',
      albumName: '相聚哈勒',
      poster: asset(`/picture/Weddingparty/party-${String(index + 1).padStart(2, '0')}.jpg`),
    }
  }),
]

const albums = [
  {
    id: 'memories',
    name: '在一起的记忆',
    note: '日常、旅行、纪念日和那些只有我们懂的瞬间',
    cover: asset('/picture/Ourmemory/memories-01.jpg'),
    media: [],
  },
  {
    id: 'berlin',
    name: '爱在柏林',
    note: '握着你的手，漫步在柏林博物馆岛。',
    cover: asset('/picture/Berlin-picture/berlin-16.jpg'),
    media: balanceByOrientation(
      photoRange('Berlin-picture', 'berlin', 20, '爱在柏林', '爱在柏林', 'Berlin', berlinRatios, 2),
    ),
  },
  {
    id: 'party',
    name: '相聚哈勒',
    note: '相遇相爱的地方，和朋友一起举杯。',
    cover: asset('/picture/Weddingparty/party-08.jpg'),
    media: balanceByOrientation(
      photoRange('Weddingparty', 'party', 20, '相聚哈勒', '相聚哈勒', '相聚哈勒', partyRatios),
    ),
  },
]

const visibleAlbums = albums.filter((album) => album.media.length > 0)
const allPhotos = visibleAlbums.flatMap((album) =>
  album.media.map((item) => ({
    ...item,
    albumId: album.id,
  })),
)
const totalMediaCount = allPhotos.length + partyVideos.length
const coverPhotoByAlbum = {
  berlin: asset('/picture/Berlin-picture/berlin-16.jpg'),
  party: asset('/picture/Weddingparty/party-08.jpg'),
}

function getLayoutClass(item, index) {
  if (index === 0 && item.ratio >= 1.8) {
    return 'feature-wide'
  }

  if (item.ratio >= 2) {
    return 'wide'
  }

  if (item.ratio >= 1.25) {
    return 'landscape'
  }

  if (item.ratio <= 0.8) {
    return 'portrait'
  }

  return 'square'
}

const renderPreview = (item, className = '') => {
  if (item.type === 'video') {
    return `
      <video class="${className}" muted playsinline preload="metadata" poster="${item.poster || ''}">
        <source src="${item.src}" type="${item.src.endsWith('.mov') ? 'video/quicktime' : 'video/mp4'}" />
      </video>
    `
  }

  return `<img class="${className}" src="${item.src}" alt="${item.title}" loading="lazy" />`
}

const renderAlbumSection = (album) => `
  <section class="album-section" id="album-${album.id}">
    <div class="section-head">
      <div>
        <p class="eyebrow">${album.id === 'berlin' ? 'Berlin' : 'Halle'}</p>
        <h2>${album.name}</h2>
      </div>
      <p>${album.note}</p>
    </div>
    <div class="gallery album-gallery">
      ${(album.id === 'party' ? [...album.media, ...partyVideos] : album.media)
        .filter((item) => item.src !== coverPhotoByAlbum[album.id])
        .map(
          (item, index) => `
            <button class="media-tile ${item.type === 'video' ? 'video-tile landscape' : getLayoutClass(item, index)}" type="button" data-media-id="${album.id}-${index}" style="--ratio: ${item.ratio || 1.5}">
              ${renderPreview(item)}
              <span class="photo-fallback">${item.albumName}</span>
              ${item.type === 'video' ? '<span class="video-badge">Video</span>' : ''}
              <span class="photo-caption">
                <strong>${item.type === 'video' ? item.title : item.albumName}</strong>
                <small>${item.place}</small>
              </span>
            </button>
          `,
        )
        .join('')}
    </div>
  </section>
`

app.innerHTML = `
  <main class="page">
    <section class="hero">
      <div class="hero-top">
        <div class="hero-copy">
          <h1 class="hero-title">
            <span class="hero-title-cn">我们的婚礼记忆</span>
            <span class="hero-title-en">Our Wedding Memory</span>
          </h1>
        </div>
        <p class="subtitle poem">
          <span>风能吹动云朵，</span>
          <span>雨会打湿头发，</span>
          <span>太阳东升西落，</span>
          <span>相爱至死不渝。</span>
        </p>
      </div>
      <div class="hero-frame" aria-label="精选照片预览">
        <img src="${asset('/picture/Berlin-picture/berlin-01.jpg')}" alt="爱在柏林精选" />
        <div class="hero-fallback">
          <span>Berlin Wedding</span>
          <strong>爱在柏林精选</strong>
        </div>
      </div>
    </section>

    <section class="intro-strip" aria-label="素材统计">
      <div>
        <strong>${visibleAlbums.length}</strong>
        <span>组相册</span>
      </div>
      <div>
        <strong>${totalMediaCount}</strong>
        <span>个回忆</span>
      </div>
      <div>
        <strong>${partyVideos.length}</strong>
        <span>个视频</span>
      </div>
    </section>

    <section class="albums" id="albums">
      ${visibleAlbums
        .map(
          (album) => `
            <article class="album-card" data-target="album-${album.id}">
              <img src="${album.cover}" alt="${album.name}" />
              <div class="album-fallback">${album.name}</div>
              <div class="album-info">
                <p>${album.media.length} photos</p>
                <h2>${album.name}</h2>
                <span>${album.note}</span>
              </div>
            </article>
          `,
        )
        .join('')}
    </section>

    ${visibleAlbums.map(renderAlbumSection).join('')}

    <section class="video-section" id="films">
      <div class="section-head">
        <div>
          <p class="eyebrow">Film</p>
          <h2>婚礼短片</h2>
        </div>
        <p>预留给之后制作的 5 分钟婚礼短片，婚礼现场也可以播放。</p>
      </div>
      <div class="film-placeholder">
        <span>Wedding Film</span>
        <strong>5 分钟婚礼短片预留位</strong>
        <small>之后把成片放到 /public/wedding-film.mp4</small>
      </div>
    </section>
  </main>

  <aside class="music-player" aria-label="背景音乐播放器">
    <button class="music-toggle" type="button" aria-label="播放背景音乐">
      <span class="music-icon">♪</span>
      <span class="music-text">
        <strong>Lucky Me</strong>
        <small>点击播放</small>
      </span>
    </button>
    <audio class="background-music" loop preload="metadata">
      <source src="${asset('/music/wedding-music.mp3')}" type="audio/mpeg" />
    </audio>
  </aside>

  <dialog class="lightbox" aria-label="素材预览">
    <button class="close-lightbox" type="button" aria-label="关闭">x</button>
    <button class="lightbox-nav previous" type="button" aria-label="上一张">‹</button>
    <img src="" alt="" />
    <video controls playsinline preload="metadata"></video>
    <button class="lightbox-nav next" type="button" aria-label="下一张">›</button>
    <div>
      <strong></strong>
      <span></span>
    </div>
  </dialog>
`

document.querySelectorAll('img').forEach((image) => {
  image.addEventListener('error', () => {
    image.classList.add('is-missing')
    image.parentElement?.classList.add('has-missing-image')
  })
})

document.querySelectorAll('video').forEach((video) => {
  video.addEventListener('error', () => {
    video.classList.add('is-missing')
    video.parentElement?.classList.add('has-missing-image')
  })
})

const music = document.querySelector('.background-music')
const musicButton = document.querySelector('.music-toggle')
const musicStatus = document.querySelector('.music-text small')
const lightbox = document.querySelector('.lightbox')
const lightboxImage = lightbox.querySelector('img')
const lightboxVideo = lightbox.querySelector('video')
const lightboxTitle = lightbox.querySelector('strong')
const lightboxPlace = lightbox.querySelector('span')
const previousButton = document.querySelector('.lightbox-nav.previous')
const nextButton = document.querySelector('.lightbox-nav.next')
let currentPhotoSet = []
let currentPhotoIndex = 0

function updateMusicState(isPlaying) {
  musicButton.classList.toggle('is-playing', isPlaying)
  musicButton.setAttribute('aria-label', isPlaying ? '暂停背景音乐' : '播放背景音乐')
  musicStatus.textContent = isPlaying ? '正在播放' : '点击播放'
}

function openLightbox(item, photoSet = [], photoIndex = 0) {
  currentPhotoSet = photoSet.filter((media) => media.type === 'photo')
  currentPhotoIndex = Math.max(
    0,
    currentPhotoSet.findIndex((media) => media.src === item.src),
  )
  lightboxImage.hidden = item.type !== 'photo'
  lightboxVideo.hidden = item.type !== 'video'
  lightboxVideo.pause()
  lightboxVideo.removeAttribute('src')
  lightboxVideo.removeAttribute('poster')
  lightboxVideo.load()

  if (item.type === 'photo') {
    lightboxImage.src = item.src
    lightboxImage.alt = item.title
  } else {
    music.pause()
    updateMusicState(false)
    lightboxVideo.src = item.src
    lightboxVideo.poster = item.poster || ''
  }

  previousButton.hidden = item.type !== 'photo' || currentPhotoSet.length < 2
  nextButton.hidden = item.type !== 'photo' || currentPhotoSet.length < 2
  lightboxTitle.textContent = item.type === 'video' ? item.title : item.albumName
  lightboxPlace.textContent = `${item.albumName} · ${item.place}`
  lightbox.showModal()
}

function showSiblingPhoto(direction) {
  if (!currentPhotoSet.length) {
    return
  }

  currentPhotoIndex = (currentPhotoIndex + direction + currentPhotoSet.length) % currentPhotoSet.length
  openLightbox(currentPhotoSet[currentPhotoIndex], currentPhotoSet, currentPhotoIndex)
}

document.querySelectorAll('.album-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.getElementById(card.dataset.target)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  })
})

document.querySelectorAll('.media-tile').forEach((tile) => {
  tile.addEventListener('click', () => {
    const [albumId, index] = tile.dataset.mediaId.split('-')
    const album = visibleAlbums.find((item) => item.id === albumId)
    const mediaSet = (album.id === 'party' ? [...album.media, ...partyVideos] : album.media).filter(
      (item) => item.src !== coverPhotoByAlbum[album.id],
    )
    const mediaIndex = Number(index)
    openLightbox(mediaSet[mediaIndex], mediaSet, mediaIndex)
  })
})

previousButton.addEventListener('click', () => showSiblingPhoto(-1))
nextButton.addEventListener('click', () => showSiblingPhoto(1))

document.addEventListener('keydown', (event) => {
  if (!lightbox.open || lightboxImage.hidden) {
    return
  }

  if (event.key === 'ArrowLeft') {
    showSiblingPhoto(-1)
  }

  if (event.key === 'ArrowRight') {
    showSiblingPhoto(1)
  }
})

document.querySelector('.close-lightbox').addEventListener('click', () => {
  lightboxVideo.pause()
  lightbox.close()
})

lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) {
    lightboxVideo.pause()
    lightbox.close()
  }
})

musicButton.addEventListener('click', async () => {
  if (music.paused) {
    try {
      await music.play()
      updateMusicState(true)
    } catch {
      musicStatus.textContent = '请先放入音乐文件'
    }
  } else {
    music.pause()
    updateMusicState(false)
  }
})
