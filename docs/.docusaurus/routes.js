import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/blog',
    component: ComponentCreator('/blog', '98b'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '1aa'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '578'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', '6b5'),
            routes: [
              {
                path: '/docs/api/auth',
                component: ComponentCreator('/docs/api/auth', 'c40'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/api/vehicles',
                component: ComponentCreator('/docs/api/vehicles', '4db'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/category/api-reference',
                component: ComponentCreator('/docs/category/api-reference', '789'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/category/data-flow',
                component: ComponentCreator('/docs/category/data-flow', '78a'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/category/getting-started',
                component: ComponentCreator('/docs/category/getting-started', 'd48'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/category/modules',
                component: ComponentCreator('/docs/category/modules', '47b'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/category/state-management',
                component: ComponentCreator('/docs/category/state-management', '4f4'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/data-flow/http-websocket',
                component: ComponentCreator('/docs/data-flow/http-websocket', '84a'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/data-flow/socket-events',
                component: ComponentCreator('/docs/data-flow/socket-events', '55f'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/getting-started/architecture',
                component: ComponentCreator('/docs/getting-started/architecture', '3bb'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/getting-started/installation',
                component: ComponentCreator('/docs/getting-started/installation', 'f1f'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/getting-started/overview',
                component: ComponentCreator('/docs/getting-started/overview', '659'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/modules/inspections',
                component: ComponentCreator('/docs/modules/inspections', '2c5'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/modules/parkings',
                component: ComponentCreator('/docs/modules/parkings', 'fa3'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/modules/reservations',
                component: ComponentCreator('/docs/modules/reservations', 'e47'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/parser/acara-parser',
                component: ComponentCreator('/docs/parser/acara-parser', '622'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/state-management/architecture',
                component: ComponentCreator('/docs/state-management/architecture', '432'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/state-management/hooks',
                component: ComponentCreator('/docs/state-management/hooks', 'fd8'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/state-management/slices',
                component: ComponentCreator('/docs/state-management/slices', '0af'),
                exact: true,
                sidebar: "docsSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', 'e5f'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
