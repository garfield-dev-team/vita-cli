import { IYApiResponseDataType } from "./types";
import { restoreCache, updateCache } from "./utils";

/**
 * 通过接口文档最近更新时间，判断缓存是否有效
 * @param collection
 * @returns
 */
export const validateCache = async (collection: IYApiResponseDataType[]) => {
  const cache = await restoreCache();

  let hit = true;

  collection.forEach(({ _id, up_time }) => {
    const isValid = cache[_id] && cache[_id] === up_time;
    if (!isValid) {
      cache[_id] = up_time;
      hit = false;
    }
  });

  if (!hit) {
    // 缓存过期，回写缓存
    await updateCache(cache);
  }

  return hit;
};
