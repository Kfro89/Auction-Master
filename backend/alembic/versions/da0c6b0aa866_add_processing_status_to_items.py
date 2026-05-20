"""add processing_status to items

Revision ID: da0c6b0aa866
Revises: 35ac5ad1bfad
Create Date: 2026-05-16 19:17:10.876846

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'da0c6b0aa866'
down_revision: Union[str, Sequence[str], None] = '35ac5ad1bfad'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('items', sa.Column('processing_status', sa.String(), nullable=True, server_default='pending_enrichment'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('items', 'processing_status')
