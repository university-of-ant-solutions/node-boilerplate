import mongoose from 'mongoose';

const { Types: { ObjectId } } = mongoose;

/**
 * NOTE:
 * https://github.com/Automattic/mongoose/issues/2853
 * https://github.com/mongodb/js-bson/issues/112
 */
export function toObjectId(idStr) {
  let id = null;
  try {
    id = ObjectId(idStr);
  } catch (err) {}
  return id;
}

export function isObjectId(id) {
  return id instanceof ObjectId;
}
