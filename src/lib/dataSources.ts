import messagesData from '../data/messages.json';
import locationsData from '../data/locations.json';
import loresData from '../data/lores.json';
import userPositionData from '../data/userPosition.json';
import locationAssetsData from '../data/locationAssets.json';
import type { Message, Location, LocationLore, UserPosition } from '../types';
import { convertGpsToImageCoordinates } from './mapConverter';

const messages = messagesData as unknown as Message[];
const locationsData_raw = locationsData as unknown as Location[];
const lores = loresData as unknown as LocationLore[];
const userPositionData_raw = userPositionData as unknown as UserPosition;
const locationAssets = locationAssetsData as unknown as Array<{
  id: string;
  icon?: string | null;
  image?: string | null;
  model?: string | null;
  birdModel?: string | null;
  mascotName?: string | null;
  buildingOffset?: [number, number, number] | null;
}>;

// 将 GPS 坐标转换为图片百分比坐标
const locations = locationsData_raw.map((loc) => {
  // Prefer explicit x/y when provided. Only convert GPS when x or y is undefined.
  if (loc.gps && (loc.x === undefined || loc.y === undefined)) {
    const imageCoords = convertGpsToImageCoordinates(loc.gps);
    return {
      ...loc,
      x: imageCoords?.xPercent ?? 50,
      y: imageCoords?.yPercent ?? 50,
    };
  }
  return {
    ...loc,
    x: loc.x ?? 50,
    y: loc.y ?? 50,
  };
});

const userPosition = (() => {
  if (userPositionData_raw.gps && (userPositionData_raw.x === undefined || userPositionData_raw.y === undefined)) {
    const imageCoords = convertGpsToImageCoordinates(userPositionData_raw.gps);
    return {
      ...userPositionData_raw,
      x: imageCoords?.xPercent ?? 50,
      y: imageCoords?.yPercent ?? 50,
    };
  }
  return {
    ...userPositionData_raw,
    x: userPositionData_raw.x ?? 50,
    y: userPositionData_raw.y ?? 50,
  };
})();

export function getMessages(): Message[] {
  return messages;
}

export function getMessagesByLocation(locationId: string): Message[] {
  return messages.filter((m) => m.locationId === locationId);
}

export function getLocations(): Location[] {
  return locations;
}

export function getLocationById(id: string): Location | undefined {
  return locations.find((l) => l.id === id);
}

export function getLoreById(id: string): LocationLore | undefined {
  return lores.find((l) => l.id === id);
}

export function getUserPosition(): UserPosition {
  return userPosition;
}

export function getLocationAssetsById(id: string) {
  return locationAssets.find((a) => a.id === id);
}

export default {
  getMessages,
  getMessagesByLocation,
  getLocations,
  getLocationById,
  getLoreById,
  getUserPosition,
  getLocationAssetsById,
};
