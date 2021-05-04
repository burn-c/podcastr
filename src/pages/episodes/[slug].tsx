import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { GetStaticPaths, GetStaticProps } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { usePlayer } from '../../contexts/PlayerContext'
import { api } from '../../services/api'
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString'

import styles from './episode.module.scss'

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  members: string;
  durationAsString: string;
  duration: number;
  url: string;
  publishedAt: string;
}

type EpisodeProps = {
  episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {
  const { title, description, members, thumbnail, publishedAt, durationAsString } = episode

  const { play } = usePlayer();

  return (
    <div className={styles.episode}>
      <div className={styles.thumbnailContainer}>
        <Link href='/'>
          <button type='button'>
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>
        <Image
          width={700}
          height={160}
          src={thumbnail}
          objectFit="cover"
        />
        <button>
          <img src="/play.svg" alt="Tocar episódio" onClick={() => play(episode)} />
        </button>
      </div>

      <header>
        <h1>{title}</h1>
        <span>{members}</span>
        <span>{publishedAt}</span>
        <span>{durationAsString}</span>
      </header>

      <div className={styles.description} dangerouslySetInnerHTML={{ __html: description }} />
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 2,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  const paths = data.map(episode => {
    return {
      params: {
        slug: episode.id
      }
    }
  })

  return {
    paths,
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params

  const { data } = await api.get(`/episodes/${slug}`)

  const episode = {
    ...data,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    url: data.file.url
  }

  return {
    props: {
      episode
    },
    revalidate: 60 * 60 * 24
  }
}
