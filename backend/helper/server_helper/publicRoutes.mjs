export function isPublicRoute(url, publicRoutes) {
    return publicRoutes.some(route => {
        if (url.startsWith("/swaggerUI/")) return true; 
        const regex = new RegExp(`^${route.replace(/:\w+/g, "[^/]+")}$`);
        return regex.test(url);
    });
}
