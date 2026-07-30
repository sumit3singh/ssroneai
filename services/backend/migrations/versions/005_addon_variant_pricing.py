"""005_addon_variant_pricing

Revision ID: 005_addon_variant_pricing
Revises: 004_pos_indexes_and_fixes
Create Date: 2026-07-27 12:05:00.000000

"""
from alembic import op
import sqlalchemy as sqa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '005_addon_variant_pricing'
down_revision = '004_pos_indexes_and_fixes'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('menu_addon_options', sqa.Column('variant_prices', postgresql.JSONB(astext_type=sqa.Text()), nullable=True, server_default='{}'))

def downgrade() -> None:
    op.drop_column('menu_addon_options', 'variant_prices')
