# Zendeal Status

Página pública de estado en [status.zendeal.io](https://status.zendeal.io).

Repo **independiente** de `pasarela-pago`. Comprueba automáticamente:

| Componente | Cómo |
|---|---|
| Web | `GET https://zendeal.io` |
| API | `GET https://api.zendeal.io/v1/health` |
| Enlaces cortos | `GET https://zdeal.link/` |
| Base de datos | campo `checks.mongo` del health de la API |
| Caché | campo `checks.redis` del health de la API |

## API pública

```http
GET /api/status
```

Respuesta (ejemplo):

```json
{
  "overall": "operational",
  "updatedAt": "2026-10-24T16:00:00.000Z",
  "components": [
    { "id": "web", "name": "Web", "status": "operational", "latencyMs": 120 }
  ]
}
```

`overall`: `operational` | `degraded` | `outage`

CORS abierto para que el footer de zendeal.io pueda consultarlo.

## Desarrollo

```bash
npm install
npm run dev
```

## Deploy (Vercel)

1. Importa este repo en Vercel.
2. Framework: Next.js (detectado solo).
3. Añade el dominio `status.zendeal.io`.
4. DNS: CNAME `status` → `cname.vercel-dns.com` (o el que indique Vercel).

Variables opcionales: ver `.env.example`.

## Nota sobre Mongo / Redis

No hace falta poner credenciales de DB aquí. El backend de Zendeal expone el estado en `/v1/health`.
