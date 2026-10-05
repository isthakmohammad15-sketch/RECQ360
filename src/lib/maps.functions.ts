/**
 * Returns the Google Maps *browser* key for the Maps JavaScript API.
 * The key itself never lives in source control — it is read from the
 * project environment (VITE_GOOGLE_MAPS_API_KEY).
 */
export const getMapsBrowserKey = async (): Promise<{ key: string }> => {
  const key =
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_GOOGLE_MAPS_API_KEY"]) ||
    (typeof process !== "undefined" && process.env?.["VITE_GOOGLE_MAPS_API_KEY"]) ||
    "";
  return { key };
};
