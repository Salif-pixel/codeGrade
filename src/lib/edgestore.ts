'use client';

import { createEdgeStoreProvider } from '@edgestore/react';
import { EdgeStoreRouter } from '../../app/api/edgestore/[...edgestore]/route';

const { EdgeStoreProvider, useEdgeStore } =
  createEdgeStoreProvider<EdgeStoreRouter>();

export { EdgeStoreProvider, useEdgeStore };