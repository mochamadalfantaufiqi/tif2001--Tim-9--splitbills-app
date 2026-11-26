-- ============================================================
-- 002_create_bills.sql
-- Sprint 2 – Pekan 10
-- ============================================================

CREATE TABLE IF NOT EXISTS bills (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          VARCHAR(120) NOT NULL,
  venue_name     VARCHAR(120),
  bill_date      DATE         NOT NULL DEFAULT CURRENT_DATE,
  tax_mode       VARCHAR(10)  NOT NULL DEFAULT 'percent'
                   CHECK (tax_mode IN ('percent','nominal')),
  tax_value      NUMERIC(12,2) NOT NULL DEFAULT 10 CHECK (tax_value >= 0),
  service_mode   VARCHAR(10)  NOT NULL DEFAULT 'percent'
                   CHECK (service_mode IN ('percent','nominal')),
  service_value  NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (service_value >= 0),
  service_split  VARCHAR(15)  NOT NULL DEFAULT 'proportional'
                   CHECK (service_split IN ('proportional','equal')),
  status         VARCHAR(12)  NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','finalized')),
  receipt_url    TEXT,
  share_code     VARCHAR(12)  UNIQUE,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bills_owner_created ON bills(owner_id, created_at DESC);

CREATE TABLE IF NOT EXISTS participants (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id    UUID        NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  name       VARCHAR(80) NOT NULL,
  sort_order INT         NOT NULL DEFAULT 0,
  UNIQUE (bill_id, name)
);

CREATE TABLE IF NOT EXISTS bill_items (
  id      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID         NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  name    VARCHAR(100) NOT NULL,
  price   BIGINT       NOT NULL CHECK (price >= 0),   -- rupiah, bilangan bulat
  qty     INT          NOT NULL DEFAULT 1 CHECK (qty > 0)
);

CREATE TABLE IF NOT EXISTS item_assignments (
  item_id        UUID NOT NULL REFERENCES bill_items(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, participant_id)
);
