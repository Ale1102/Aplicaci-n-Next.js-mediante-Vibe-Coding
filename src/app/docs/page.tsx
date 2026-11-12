'use client';

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

// Versión fija de Swagger UI servida desde CDN (no añade dependencias al bundle)
const SWAGGER_VERSION = '5.17.14';
const CDN = `https://unpkg.com/swagger-ui-dist@${SWAGGER_VERSION}`;

interface SwaggerWindow extends Window {
  SwaggerUIBundle?: (config: Record<string, unknown>) => unknown;
}

export default function DocsPage() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = `${CDN}/swagger-ui.css`;

    const script = document.createElement('script');
    script.src = `${CDN}/swagger-ui-bundle.js`;
    script.async = true;
    script.onload = () => {
      const w = window as SwaggerWindow;
      if (!w.SwaggerUIBundle) return setStatus('error');
      w.SwaggerUIBundle({
        url: '/api/openapi',
        dom_id: '#swagger-ui',
        deepLinking: true,
        docExpansion: 'list',
        tryItOutEnabled: true,
      });
      setStatus('ready');
    };
    script.onerror = () => setStatus('error');

    document.head.appendChild(css);
    document.body.appendChild(script);
    return () => {
      css.remove();
      script.remove();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
          Documentación interactiva • OpenAPI 3.0
        </span>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-white sm:text-3xl">
          <BookOpen className="h-7 w-7 text-emerald-400" />
          API Reference (Swagger)
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Prueba los endpoints con “Try it out”. La especificación en JSON está en{' '}
          <a
            href="/api/openapi"
            className="text-emerald-400 underline underline-offset-2"
          >
            /api/openapi
          </a>
          .
        </p>
      </div>

      {status === 'loading' && (
        <p className="text-sm text-slate-400" role="status">
          Cargando Swagger UI...
        </p>
      )}
      {status === 'error' && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
          No se pudo cargar Swagger UI desde el CDN (revisa tu conexión). Puedes
          consultar la especificación directamente en{' '}
          <a href="/api/openapi" className="underline">
            /api/openapi
          </a>
          .
        </div>
      )}

      <div
        id="swagger-ui"
        className={`overflow-hidden rounded-2xl bg-white p-2 text-slate-900 ${
          status === 'ready' ? '' : 'hidden'
        }`}
      />
    </div>
  );
}
