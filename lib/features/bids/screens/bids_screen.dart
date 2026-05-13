import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../research/widgets/item_tile.dart';
import '../../../models/item_model.dart';
import '../../../services/api_client.dart';

final bidsProvider = FutureProvider((ref) async {
  final api = ref.read(apiServiceProvider);
  final data = await api.getItems();
  // Filter for user bids
  return data
      .map((json) => AuctionItem.fromJson(json))
      .where((item) => item.isUserBidding)
      .toList();
});

class BidsScreen extends ConsumerWidget {
  const BidsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bidsAsync = ref.watch(bidsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Bids'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.refresh(bidsProvider),
          ),
        ],
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.topCenter,
            radius: 1.5,
            colors: [Color(0xFFFFFFFF), Color(0xFFF3F4F6)],
          ),
        ),
        child: bidsAsync.when(
          data: (items) => items.isEmpty
              ? const Center(child: Text('No active bids found'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16.0),
                  itemCount: items.length,
                  itemBuilder: (context, index) {
                    return ItemTile(item: items[index]);
                  },
                ),
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, stack) => Center(child: Text('Error: $error')),
        ),
      ),
    );
  }
}
