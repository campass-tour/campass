import { getMessages, getMessagesByLocation as _getMessagesByLocation } from '../lib/dataSources';

export const MESSAGES = getMessages();
export const getMessagesByLocation = _getMessagesByLocation;
