"""add ps integration models

Revision ID: 001_ps_integration
Revises:
Create Date: 2026-05-11
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '001_ps_integration'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Public Surplus category seed data
PS_CATEGORIES = [
    (22, "Airport"), (24, "Animals and Livestock"), (19, "Aviation"),
    (10, "Building"), (16, "Clothing"), (18, "Collectibles"),
    (1, "Computers"), (2, "Electronics"), (8, "Food Supply"),
    (28, "For Children"), (14, "Furniture"), (17, "Heavy Equipment"),
    (29, "Heavy Equipment Parts"), (27, "Housewares"), (6, "Industrial Equipment"),
    (11, "Jewelry"), (20, "Marine"), (23, "Medical"),
    (4, "Motor Pool"), (21, "Motor Pool Parts"), (13, "Music and Arts"),
    (3, "Office Equipment"), (12, "Outdoor Equipment"), (15, "Real Estate"),
    (9, "School Supplies"), (25, "Scrap"), (5, "Sporting Goods"), (26, "Storage"),
]


def upgrade() -> None:
    # --- Create auction_houses table ---
    op.create_table(
        'auction_houses',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(), nullable=False, unique=True),
        sa.Column('website_key', sa.String(), nullable=False, unique=True),
        sa.Column('base_url', sa.String(), nullable=False),
        sa.Column('buyer_premium_pct', sa.Float(), nullable=False),
        sa.Column('cash_discount_pct', sa.Float(), server_default='0.0'),
        sa.Column('tax_rate', sa.Float(), server_default='0.0'),
        sa.Column('terms_url', sa.String(), nullable=True),
    )
    op.create_index('ix_auction_houses_website_key', 'auction_houses', ['website_key'])
    op.create_index('ix_auction_houses_id', 'auction_houses', ['id'])

    # --- Create auctions table ---
    op.create_table(
        'auctions',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('auction_house_id', sa.Integer(), sa.ForeignKey('auction_houses.id'), nullable=False),
        sa.Column('external_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('start_time', sa.DateTime(), nullable=True),
        sa.Column('end_time', sa.DateTime(), nullable=True),
        sa.Column('location_address', sa.String(), nullable=True),
        sa.Column('location_city', sa.String(), nullable=True),
        sa.Column('location_state', sa.String(), nullable=True),
        sa.Column('location_zip', sa.String(), nullable=True),
    )
    op.create_index('ix_auctions_external_id', 'auctions', ['external_id'])
    op.create_index('ix_auctions_id', 'auctions', ['id'])

    # --- Create items table ---
    op.create_table(
        'items',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('auction_house_id', sa.Integer(), sa.ForeignKey('auction_houses.id'), nullable=False),
        sa.Column('auction_id', sa.Integer(), sa.ForeignKey('auctions.id'), nullable=True),
        sa.Column('external_id', sa.String(), nullable=False),
        sa.Column('lot_number', sa.String(), nullable=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('current_bid', sa.Float(), server_default='0.0'),
        sa.Column('bid_count', sa.Integer(), server_default='0'),
        sa.Column('end_time', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('url', sa.String(), nullable=True),
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('first_seen_at', sa.DateTime(), nullable=True),
        sa.Column('last_seen_at', sa.DateTime(), nullable=True),
        sa.Column('raw_condition', sa.String(), nullable=True),
        sa.Column('normalized_condition_id', sa.String(), nullable=True),
        sa.Column('brand', sa.String(), nullable=True),
        sa.Column('mpn', sa.String(), nullable=True),
        # PS-specific columns
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('agency_name', sa.String(), nullable=True),
        sa.Column('location_state', sa.String(), nullable=True),
        sa.Column('pickup_address', sa.String(), nullable=True),
        sa.Column('pickup_city', sa.String(), nullable=True),
        sa.Column('pickup_zip', sa.String(), nullable=True),
        sa.Column('pickup_name', sa.String(), nullable=True),
        sa.Column('is_dutch_auction', sa.Boolean(), server_default='false'),
        sa.Column('may_extend', sa.Boolean(), server_default='false'),
        sa.Column('detail_scraped_at', sa.DateTime(), nullable=True),
    )
    op.create_index('ix_items_external_id', 'items', ['external_id'])
    op.create_index('ix_items_id', 'items', ['id'])

    # --- Create condition_map table ---
    op.create_table(
        'condition_map',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('auction_house_id', sa.Integer(), sa.ForeignKey('auction_houses.id'), nullable=False),
        sa.Column('raw_pattern', sa.String(), nullable=False),
        sa.Column('ebay_condition_id', sa.String(), nullable=False),
    )
    op.create_index('ix_condition_map_id', 'condition_map', ['id'])

    # --- Create categories table ---
    op.create_table(
        'categories',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('ps_cat_id', sa.Integer(), nullable=False, unique=True),
        sa.Column('name', sa.String(), nullable=False, unique=True),
    )
    op.create_index('ix_categories_id', 'categories', ['id'])

    # --- Create user_settings table ---
    op.create_table(
        'user_settings',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('ps_zip_code', sa.String(), server_default=''),
        sa.Column('ps_radius_miles', sa.Integer(), server_default='200'),
        sa.Column('ps_region', sa.String(), server_default=''),
        sa.Column('ps_enabled', sa.Boolean(), server_default='true'),
        sa.Column('ps_end_hours', sa.Integer(), server_default='240'),
        sa.Column('ps_category_id', sa.Integer(), server_default='-1'),
    )

    # --- Create watchlist_items table ---
    op.create_table(
        'watchlist_items',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('item_id', sa.Integer(), sa.ForeignKey('items.id'), nullable=False, unique=True),
        sa.Column('added_at', sa.DateTime(), nullable=False),
        sa.Column('notes', sa.String(), server_default=''),
    )
    op.create_index('ix_watchlist_items_id', 'watchlist_items', ['id'])

    # --- Seed data ---

    # Seed categories
    categories_table = sa.table(
        'categories',
        sa.column('ps_cat_id', sa.Integer),
        sa.column('name', sa.String),
    )
    op.bulk_insert(categories_table, [
        {"ps_cat_id": cat_id, "name": name} for cat_id, name in PS_CATEGORIES
    ])

    # Seed Public Surplus auction house
    houses_table = sa.table(
        'auction_houses',
        sa.column('name', sa.String),
        sa.column('website_key', sa.String),
        sa.column('base_url', sa.String),
        sa.column('buyer_premium_pct', sa.Float),
        sa.column('cash_discount_pct', sa.Float),
        sa.column('tax_rate', sa.Float),
    )
    op.bulk_insert(houses_table, [
        {
            "name": "Public Surplus",
            "website_key": "ps",
            "base_url": "https://www.publicsurplus.com",
            "buyer_premium_pct": 0.0,
            "cash_discount_pct": 0.0,
            "tax_rate": 0.0,
        }
    ])

    # Seed default settings
    settings_table = sa.table(
        'user_settings',
        sa.column('id', sa.Integer),
        sa.column('ps_zip_code', sa.String),
        sa.column('ps_radius_miles', sa.Integer),
        sa.column('ps_region', sa.String),
        sa.column('ps_enabled', sa.Boolean),
        sa.column('ps_end_hours', sa.Integer),
        sa.column('ps_category_id', sa.Integer),
    )
    op.bulk_insert(settings_table, [
        {
            "id": 1,
            "ps_zip_code": "",
            "ps_radius_miles": 200,
            "ps_region": "",
            "ps_enabled": True,
            "ps_end_hours": 240,
            "ps_category_id": -1,
        }
    ])


def downgrade() -> None:
    op.drop_table('watchlist_items')
    op.drop_table('user_settings')
    op.drop_table('categories')
    op.drop_table('condition_map')
    op.drop_table('items')
    op.drop_table('auctions')
    op.drop_table('auction_houses')
