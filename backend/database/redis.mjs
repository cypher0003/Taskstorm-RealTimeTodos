import Redis from "ioredis";

const redisPublisher = new Redis();  
const redisSubscriber = new Redis();

redisPublisher.on('connect', () => console.log('✅ Redis Publisher verbunden.'));
redisSubscriber.on('connect', () => console.log('✅ Redis Subscriber verbunden.'));

/**
 * Setzt den Online-Status eines Benutzers in Redis
 */
export async function setUserOnline(userId) {
    await redisPublisher.set(`user:${userId}:status`, "online", "EX", 600); // 10 Minuten Timeout
}

/**
 * Setzt den Benutzer auf "offline"
 */
export async function setUserOffline(userId) {
    await redisPublisher.del(`user:${userId}:status`);
}

/**
 * Holt den Status eines Benutzers aus Redis
 */
export async function isUserOnline(userId) {
    const status = await redisPublisher.get(`user:${userId}:status`);
    return status === "online";
}

/**
 * Speichert Benutzerprofil-Daten für schnellen Zugriff
 */
export async function cacheUserProfile(user) {
    await redisPublisher.set(`user:${user.id}:profile`, JSON.stringify(user), "EX", 1800); // 30 Minuten Cache
}

/**
 * Holt Benutzerprofil aus Redis
 */
export async function getCachedUserProfile(userId) {
    const user = await redisPublisher.get(`user:${userId}:profile`);
    return user ? JSON.parse(user) : null;
}

/**
 * Speichert Todos eines Workspaces in Redis
 */
export async function cacheWorkspaceTodos(workspaceId, userId ,todo) {
    const cacheKey = `user:${userId}:workspace:${workspaceId}:todos`
    await redisPublisher.lpush(cacheKey, JSON.stringify(todo));
}


/**
 * Holt Todos aus dem Redis-Cache
 */
export async function getCachedWorkspaceTodos(workspaceId) {
    const cachedTodos = await redisPublisher.lrange(`workspace:${workspaceId}:todos`, 0 , -1);
    return cachedTodos ? JSON.parse(cachedTodos) : [];
}

/**
 * Speichert Mitglieder eines Workspaces in Redis
 */
export async function cacheWorkspaceMembers(workspaceId, members) {
    await redisPublisher.set(`workspace:${workspaceId}:members`, JSON.stringify(members), "EX", 600);
}

/**
 * Holt Mitglieder eines Workspaces aus Redis
 */
export async function getCachedWorkspaceMembers(workspaceId) {
    const cachedMembers = await redisPublisher.get(`workspace:${workspaceId}:members`);
    return cachedMembers ? JSON.parse(cachedMembers) : [];
}

export { redisPublisher, redisSubscriber };
