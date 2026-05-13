import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'dart:ui';
import '../../../models/item_model.dart';

class ItemTile extends StatelessWidget {
  final AuctionItem item;

  const ItemTile({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    final estimatedVal = item.estimatedValue ?? 0.0;
    final profit = estimatedVal - item.currentBid;
    final isHighRoi = profit > 200;

    return GestureDetector(
      onTap: () {
        context.push('/item', extra: item);
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.65),
                border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(8),
                      image: item.imageUrl != null 
                        ? DecorationImage(
                            image: NetworkImage(item.imageUrl!),
                            fit: BoxFit.cover,
                          )
                        : null,
                    ),
                    child: item.imageUrl == null ? const Icon(Icons.image_not_supported, color: Colors.grey) : null,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.title,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF0F172A),
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Current Bid', style: TextStyle(fontSize: 12, color: Colors.grey)),
                                Text('\$${item.currentBid.toStringAsFixed(2)}', 
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                const Text('Est. Value', style: TextStyle(fontSize: 12, color: Colors.grey)),
                                Text('\$${estimatedVal.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold, 
                                    fontSize: 16,
                                    color: isHighRoi ? const Color(0xFF10B981) : Colors.black,
                                  )),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
