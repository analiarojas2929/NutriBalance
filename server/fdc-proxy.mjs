import { createServer } from 'node:http';

const apiKey = process.env.FDC_API_KEY;
const port = Number(process.env.FDC_PROXY_PORT || 8787);
const allowedOrigin = process.env.FDC_ALLOWED_ORIGIN || 'http://localhost:8082';
const upstreamUrl = 'https://api.nal.usda.gov/fdc/v1/foods/search';
const requestWindowMs = 60_000;
const requestLimit = 30;
const clientRequests = new Map();

if (!apiKey) {
  console.error('FDC_API_KEY no está definido. Añádelo a .env.server; no lo pongas en EXPO_PUBLIC_* ni en la app.');
  process.exit(1);
}

function sendJson(response, status, body, origin) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  });
  response.end(JSON.stringify(body));
}

function isRateLimited(clientId) {
  const now = Date.now();
  const recent = (clientRequests.get(clientId) ?? []).filter((timestamp) => now - timestamp < requestWindowMs);
  if (recent.length >= requestLimit) {
    clientRequests.set(clientId, recent);
    return true;
  }
  recent.push(now);
  clientRequests.set(clientId, recent);
  return false;
}

const server = createServer(async (request, response) => {
  const origin = request.headers.origin;
  if (origin && origin !== allowedOrigin) {
    sendJson(response, 403, { message: 'Origen no permitido.' });
    return;
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      Vary: 'Origin',
    });
    response.end();
    return;
  }

  if (request.method !== 'POST' || request.url !== '/foods/search') {
    sendJson(response, 404, { message: 'Ruta no encontrada.' }, origin);
    return;
  }

  const clientId = request.socket.remoteAddress || 'unknown';
  if (isRateLimited(clientId)) {
    sendJson(response, 429, { message: 'Límite local de búsquedas alcanzado. Espera un minuto.' }, origin);
    return;
  }

  try {
    let body = '';
    for await (const chunk of request) {
      body += chunk;
      if (body.length > 4096) {
        sendJson(response, 413, { message: 'La solicitud es demasiado grande.' }, origin);
        return;
      }
    }

    const input = JSON.parse(body);
    const query = typeof input.query === 'string' ? input.query.trim() : '';
    if (query.length < 2 || query.length > 100) {
      sendJson(response, 400, { message: 'La búsqueda debe tener entre 2 y 100 caracteres.' }, origin);
      return;
    }

    const upstream = await fetch(`${upstreamUrl}?api_key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, pageSize: 20 }),
      signal: AbortSignal.timeout(15_000),
    });
    const result = await upstream.json();
    sendJson(response, upstream.status, result, origin);
  } catch {
    sendJson(response, 502, { message: 'No se pudo consultar FoodData Central.' }, origin);
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Proxy FoodData Central disponible en http://localhost:${port}`);
  console.log(`Origen web permitido: ${allowedOrigin}`);
});
