"""Merge heads

Revision ID: 99ed106a074e
Revises: f23456789abc, fix_dickensheet_urls_20260512
Create Date: 2026-05-13 05:06:34.260088

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '99ed106a074e'
down_revision: Union[str, Sequence[str], None] = ('f23456789abc', 'fix_dickensheet_urls_20260512')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
