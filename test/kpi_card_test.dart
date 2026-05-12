import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/research/widgets/kpi_card.dart';

void main() {
  testWidgets('KpiCard displays correct title and value', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: KpiCard(
            title: 'Test Title',
            value: '42',
            icon: Icons.star,
            color: Colors.blue,
          ),
        ),
      ),
    );

    expect(find.text('Test Title'), findsOneWidget);
    expect(find.text('42'), findsOneWidget);
    expect(find.byIcon(Icons.star), findsOneWidget);
  });
}
