import { describe, expect, it } from 'vitest'
import { resolveEPayApiUrl, resolveEPaySubmitUrl } from './epay'

describe('EPay endpoint URL resolution', function () {
  it.each([
    ['https://ttzf8.com', 'https://ttzf8.com/mapi.php'],
    ['https://ttzf8.com/', 'https://ttzf8.com/mapi.php'],
    [
      'https://ttzf8.com/api/epay',
      'https://ttzf8.com/api/epay/mapi.php',
    ],
    [
      'https://ttzf8.com/api/epay/',
      'https://ttzf8.com/api/epay/mapi.php',
    ],
    [
      'https://ttzf8.com/api/epay/mapi.php',
      'https://ttzf8.com/api/epay/mapi.php',
    ],
  ])('resolves API endpoint %s', function (endpoint, expected) {
    expect(resolveEPayApiUrl(endpoint).toString()).toBe(expected)
  })

  it.each([
    ['https://ttzf8.com', 'https://ttzf8.com/submit.php'],
    ['https://ttzf8.com/', 'https://ttzf8.com/submit.php'],
    [
      'https://ttzf8.com/api/epay',
      'https://ttzf8.com/api/epay/submit.php',
    ],
    [
      'https://ttzf8.com/api/epay/',
      'https://ttzf8.com/api/epay/submit.php',
    ],
    [
      'https://ttzf8.com/api/epay/mapi.php',
      'https://ttzf8.com/api/epay/submit.php',
    ],
  ])('resolves submit endpoint %s', function (endpoint, expected) {
    expect(resolveEPaySubmitUrl(endpoint).toString()).toBe(expected)
  })
})
