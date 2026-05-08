"""Add valuation models

Revision ID: 82283db44c7b
Revises: 
Create Date: 2026-05-08 00:09:15.122774

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '82283db44c7b'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('ebay_sample_cache',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('item_id', sa.Integer(), nullable=False),
        sa.Column('query_signature', sa.String(), nullable=False),
        sa.Column('sample_size', sa.Integer(), nullable=True),
        sa.Column('trimmed_median', sa.Float(), nullable=True),
        sa.Column('iqr', sa.Float(), nullable=True),
        sa.Column('mean', sa.Float(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('fetched_at', sa.DateTime(), nullable=True),
        sa.Column('ttl', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['item_id'], ['items.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ebay_sample_cache_id'), 'ebay_sample_cache', ['id'], unique=False)
    op.create_index(op.f('ix_ebay_sample_cache_item_id'), 'ebay_sample_cache', ['item_id'], unique=False)
    op.create_index(op.f('ix_ebay_sample_cache_query_signature'), 'ebay_sample_cache', ['query_signature'], unique=False)

    op.create_table('valuations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('item_id', sa.Integer(), nullable=False),
        sa.Column('sample_cache_id', sa.Integer(), nullable=True),
        sa.Column('est_market_value', sa.Float(), nullable=True),
        sa.Column('market_adjustment_factor_applied', sa.Float(), nullable=True),
        sa.Column('max_bid_for_target_roi', sa.Float(), nullable=True),
        sa.Column('target_roi_pct', sa.Float(), nullable=True),
        sa.Column('computed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['item_id'], ['items.id'], ),
        sa.ForeignKeyConstraint(['sample_cache_id'], ['ebay_sample_cache.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_valuations_id'), 'valuations', ['id'], unique=False)
    op.create_index(op.f('ix_valuations_item_id'), 'valuations', ['item_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_valuations_item_id'), table_name='valuations')
    op.drop_index(op.f('ix_valuations_id'), table_name='valuations')
    op.drop_table('valuations')
    
    op.drop_index(op.f('ix_ebay_sample_cache_query_signature'), table_name='ebay_sample_cache')
    op.drop_index(op.f('ix_ebay_sample_cache_item_id'), table_name='ebay_sample_cache')
    op.drop_index(op.f('ix_ebay_sample_cache_id'), table_name='ebay_sample_cache')
    op.drop_table('ebay_sample_cache')
