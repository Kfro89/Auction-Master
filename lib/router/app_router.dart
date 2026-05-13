import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'main_shell.dart';
import '../features/research/screens/research_screen.dart';
import '../features/cars/screens/cars_screen.dart';
import '../features/watchlist/screens/watchlist_screen.dart';
import '../features/bids/screens/bids_screen.dart';
import '../features/work_queue/screens/work_queue_screen.dart';
import '../features/store/screens/store_screen.dart';
import '../features/research/screens/item_detail_screen.dart';
import '../models/item_model.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/research',
    routes: [
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainShell(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/research',
                builder: (context, state) => const ResearchScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/cars',
                builder: (context, state) => const CarsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/watchlist',
                builder: (context, state) => const WatchlistScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/bids',
                builder: (context, state) => const BidsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/work-queue',
                builder: (context, state) => const WorkQueueScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/store',
                builder: (context, state) => const StoreScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/item',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => ItemDetailScreen(item: state.extra as AuctionItem),
      ),
    ],
  );
});
