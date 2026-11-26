import { describe, expect, it } from 'vitest'
import { IMAGE_SIZES, imageUrl } from './imageUrl.js'

describe('imageUrl', () => {
  it('builds base URL + size + file_path', () => {
    expect(imageUrl('/abc.jpg', 'w500')).toBe('https://image.tmdb.org/t/p/w500/abc.jpg')
  })

  it('uses the card poster size by default', () => {
    expect(imageUrl('/abc.jpg')).toBe(`https://image.tmdb.org/t/p/${IMAGE_SIZES.posterCard}/abc.jpg`)
  })

  it.each([null, undefined, ''])('returns null when TMDB has no image (%s)', (path) => {
    expect(imageUrl(path)).toBeNull()
  })
})
