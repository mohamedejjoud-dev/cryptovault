import { fetchCoinDetail, fetchCoinOhlc } from './cryptoApi';

describe('cryptoApi service', () => {
  it('throws an error if coinId is missing in fetchCoinDetail', async () => {
    await expect(fetchCoinDetail('')).rejects.toThrow('Coin ID is required.');
    await expect(fetchCoinDetail(null)).rejects.toThrow('Coin ID is required.');
    await expect(fetchCoinDetail(undefined)).rejects.toThrow('Coin ID is required.');
  });

  it('throws an error if coinId is missing in fetchCoinOhlc', async () => {
    await expect(fetchCoinOhlc('')).rejects.toThrow('Coin ID is required.');
    await expect(fetchCoinOhlc(null)).rejects.toThrow('Coin ID is required.');
    await expect(fetchCoinOhlc(undefined)).rejects.toThrow('Coin ID is required.');
  });
});
