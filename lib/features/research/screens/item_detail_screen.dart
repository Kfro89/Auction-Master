import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../models/item_model.dart';
import '../../../services/api_client.dart';
import '../widgets/kpi_card.dart';

class ItemDetailScreen extends ConsumerStatefulWidget {
  final AuctionItem item;

  const ItemDetailScreen({super.key, required this.item});

  @override
  ConsumerState<ItemDetailScreen> createState() => _ItemDetailScreenState();
}

class _ItemDetailScreenState extends ConsumerState<ItemDetailScreen> {
  late bool isWatched;

  @override
  void initState() {
    super.initState();
    isWatched = widget.item.isWatched;
  }

  Future<void> _toggleWatch() async {
    final api = ref.read(apiServiceProvider);
    try {
      await api.toggleWatchStatus(widget.item.id, !isWatched);
      setState(() {
        isWatched = !isWatched;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(isWatched ? 'Added to watchlist' : 'Removed from watchlist')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update watchlist: $e')),
        );
      }
    }
  }

  Future<void> _launchUrl() async {
    if (widget.item.url != null) {
      final uri = Uri.parse(widget.item.url!);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.inAppBrowserView);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Could not open auction page.')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final estValue = widget.item.estimatedValue ?? 0.0;
    final profit = estValue - widget.item.currentBid;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Item Details'),
        actions: [
          IconButton(
            icon: Icon(isWatched ? Icons.favorite : Icons.favorite_border),
            color: isWatched ? Colors.red : null,
            onPressed: _toggleWatch,
          ),
          if (widget.item.url != null)
            IconButton(
              icon: const Icon(Icons.open_in_new),
              onPressed: _launchUrl,
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
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (widget.item.imageUrl != null)
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    widget.item.imageUrl!,
                    height: 250,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stack) {
                      return Container(
                        height: 250,
                        color: Colors.grey[300],
                        child: const Icon(Icons.broken_image, size: 60, color: Colors.grey),
                      );
                    },
                  ),
                ),
              const SizedBox(height: 16),
              Text(
                widget.item.title,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 8),
              if (widget.item.lotNumber != null)
                Text('Lot #${widget.item.lotNumber}', style: const TextStyle(fontSize: 16, color: Colors.grey)),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: KpiCard(
                      title: 'Current Bid',
                      value: '\$${widget.item.currentBid.toStringAsFixed(2)}',
                      icon: Icons.gavel,
                      color: const Color(0xFF3B82F6),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: KpiCard(
                      title: 'Est. Value',
                      value: '\$${estValue.toStringAsFixed(2)}',
                      icon: Icons.monetization_on,
                      color: const Color(0xFF10B981),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: KpiCard(
                      title: 'Est. Profit',
                      value: '\$${profit.toStringAsFixed(2)}',
                      icon: Icons.trending_up,
                      color: profit > 0 ? const Color(0xFF10B981) : Colors.red,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: KpiCard(
                      title: 'Ends',
                      value: widget.item.endTime != null 
                        ? '${widget.item.endTime!.month}/${widget.item.endTime!.day} ${widget.item.endTime!.hour}:${widget.item.endTime!.minute.toString().padLeft(2, '0')}'
                        : 'Unknown',
                      icon: Icons.access_time,
                      color: const Color(0xFFF59E0B),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              const Text('Auction Information', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              _buildInfoRow('House', widget.item.auctionHouseKey ?? 'Unknown'),
              _buildInfoRow('Status', widget.item.status ?? 'Active'),
              if (widget.item.vin != null) ...[
                const SizedBox(height: 24),
                const Text('Vehicle Information', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                _buildInfoRow('VIN', widget.item.vin!),
                _buildInfoRow('Make', widget.item.vehicleMake ?? ''),
                _buildInfoRow('Model', widget.item.vehicleModel ?? ''),
                _buildInfoRow('Year', widget.item.vehicleYear?.toString() ?? ''),
              ],
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _launchUrl,
                icon: const Icon(Icons.open_in_browser),
                label: const Text('View on Auction Site'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: () {
                  // Stub for requesting a new valuation
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Valuation requested. Please wait...')),
                  );
                },
                icon: const Icon(Icons.calculate),
                label: const Text('Request Valuation'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 100, child: Text(label, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.grey))),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 16))),
        ],
      ),
    );
  }
}
