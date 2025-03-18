import { initEdgeStore } from '@edgestore/server';
import { createEdgeStoreNextHandler } from '@edgestore/server/adapters/next/app';

const es = initEdgeStore.create();

/**
 * This is the main router for the Edge Store buckets.
 */
export const edgeStoreRouter = es.router({
  publicFiles: es.fileBucket({
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: ['application/pdf', 'text/markdown', 'text/plain', 'application/x-latex'],
  }),
});

export type EdgeStoreRouter = typeof edgeStoreRouter;

const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
});

export { handler as GET, handler as POST };