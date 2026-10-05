import { createServerFn } from '@tanstack/react-start';

/**
 * Returns the Google Maps *browser* key for the Maps JavaScript API.
 * The key itself never lives in source control — it is read from the
 * project environment (VITE_GOOGLE_MAPS_API_KEY, or the GOOGLE_API_KEY secret).
 */
export const getMapsBrowserKey = createServerFn({ method: 'GET' }).handler(async () => {
  const key =
    process.env['VITE_GOOGLE_MAPS_API_KEY'] ||
    process.env['GOOGLE_MAPS_API_KEY'] ||
    process.env['GOOGLE_API_KEY'] ||
    '';
  return { key };
});
