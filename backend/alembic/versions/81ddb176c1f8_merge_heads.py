"""Merge heads

Revision ID: 81ddb176c1f8
Revises: 2e2bc7f336c1
Create Date: 2026-05-13 05:06:45.023188

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '81ddb176c1f8'
down_revision: Union[str, Sequence[str], None] = '2e2bc7f336c1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
