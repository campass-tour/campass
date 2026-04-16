import { getLocations as _getLocations, getLocationById as _getLocationById, getLocationAssetsById } from '../lib/dataSources';

export const LOCATIONS = _getLocations();

export const getLocationData = (id: string) => {
  const location = _getLocationById(id);
  if (!location) return null;

  const assets = getLocationAssetsById(id);

  return {
    id: location.id,
    locationName: location.name,
    mascotName: (assets && assets.mascotName) || `${location.name} Mascot`,
    lv: location.lv || 1,
    // asset filenames (may be null) - resolve to URLs elsewhere using import.meta.glob
    image: assets?.image || null,
    icon: assets?.icon || null,
    model: assets?.model || null,
    birdModel: assets?.birdModel || null,
    buildingOffset: assets?.buildingOffset || null,
  };
};
