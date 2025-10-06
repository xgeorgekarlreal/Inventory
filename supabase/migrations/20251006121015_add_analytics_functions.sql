/*
  # Add Analytics Functions

  1. New Functions
    - `get_inventory_analytics` - Returns key inventory metrics
    - `get_transaction_analytics` - Returns transaction trends and stats
    - `get_category_analytics` - Returns inventory breakdown by category
    - `get_location_analytics` - Returns inventory breakdown by location
  
  2. Purpose
    - Provide real-time analytics for the Reports dashboard
    - Enable data-driven decision making
    - Track inventory performance and trends
*/

-- Get overall inventory analytics
CREATE OR REPLACE FUNCTION get_inventory_analytics()
RETURNS TABLE(
  total_products BIGINT,
  total_stock_quantity BIGINT,
  total_inventory_value NUMERIC,
  low_stock_items BIGINT,
  out_of_stock_items BIGINT,
  expiring_soon_items BIGINT,
  expired_items BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT p.product_id)::BIGINT as total_products,
    COALESCE(SUM(s.quantity), 0)::BIGINT as total_stock_quantity,
    COALESCE(SUM(s.quantity * s.purchase_price), 0) as total_inventory_value,
    COUNT(DISTINCT CASE WHEN s.quantity > 0 AND s.quantity <= p.reorder_level THEN s.product_id END)::BIGINT as low_stock_items,
    COUNT(DISTINCT CASE WHEN COALESCE(s.quantity, 0) = 0 THEN p.product_id END)::BIGINT as out_of_stock_items,
    COUNT(DISTINCT CASE 
      WHEN b.expiry_date IS NOT NULL 
      AND b.expiry_date >= CURRENT_DATE 
      AND b.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
      AND s.quantity > 0
      THEN s.stock_on_hand_id 
    END)::BIGINT as expiring_soon_items,
    COUNT(DISTINCT CASE 
      WHEN b.expiry_date IS NOT NULL 
      AND b.expiry_date < CURRENT_DATE
      AND s.quantity > 0
      THEN s.stock_on_hand_id 
    END)::BIGINT as expired_items
  FROM inv_products p
  LEFT JOIN inv_stock_on_hand s ON p.product_id = s.product_id
  LEFT JOIN inv_expiring_batches b ON s.batch_id = b.batch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get transaction analytics for the last 30 days
CREATE OR REPLACE FUNCTION get_transaction_analytics()
RETURNS TABLE(
  total_transactions BIGINT,
  total_purchases BIGINT,
  total_sales BIGINT,
  total_transfers BIGINT,
  total_adjustments BIGINT,
  purchase_value NUMERIC,
  sales_value NUMERIC,
  transactions_today BIGINT,
  transactions_this_week BIGINT,
  transactions_this_month BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_transactions,
    COUNT(CASE WHEN transaction_type = 'PURCHASE_RECEIPT' THEN 1 END)::BIGINT as total_purchases,
    COUNT(CASE WHEN transaction_type = 'SALE' THEN 1 END)::BIGINT as total_sales,
    COUNT(CASE WHEN transaction_type IN ('TRANSFER_IN', 'TRANSFER_OUT') THEN 1 END)::BIGINT as total_transfers,
    COUNT(CASE WHEN transaction_type IN ('ADJUSTMENT_ADD', 'ADJUSTMENT_SUB') THEN 1 END)::BIGINT as total_adjustments,
    COALESCE(SUM(CASE WHEN transaction_type = 'PURCHASE_RECEIPT' THEN ABS(quantity_change) * COALESCE(purchase_price, 0) END), 0) as purchase_value,
    COALESCE(SUM(CASE WHEN transaction_type = 'SALE' THEN ABS(quantity_change) * COALESCE(selling_price, 0) END), 0) as sales_value,
    COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END)::BIGINT as transactions_today,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END)::BIGINT as transactions_this_week,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END)::BIGINT as transactions_this_month
  FROM inv_transactions
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get category analytics
CREATE OR REPLACE FUNCTION get_category_analytics()
RETURNS TABLE(
  category_id BIGINT,
  category_name TEXT,
  product_count BIGINT,
  total_quantity BIGINT,
  total_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(c.category_id, 0) as category_id,
    COALESCE(c.name, 'Uncategorized') as category_name,
    COUNT(DISTINCT p.product_id)::BIGINT as product_count,
    COALESCE(SUM(s.quantity), 0)::BIGINT as total_quantity,
    COALESCE(SUM(s.quantity * s.purchase_price), 0) as total_value
  FROM inv_products p
  LEFT JOIN inv_categories c ON p.category_id = c.category_id
  LEFT JOIN inv_stock_on_hand s ON p.product_id = s.product_id
  GROUP BY c.category_id, c.name
  ORDER BY total_value DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get location analytics
CREATE OR REPLACE FUNCTION get_location_analytics()
RETURNS TABLE(
  location_id BIGINT,
  location_name TEXT,
  product_count BIGINT,
  total_quantity BIGINT,
  total_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.location_id,
    l.name as location_name,
    COUNT(DISTINCT s.product_id)::BIGINT as product_count,
    COALESCE(SUM(s.quantity), 0)::BIGINT as total_quantity,
    COALESCE(SUM(s.quantity * s.purchase_price), 0) as total_value
  FROM inv_locations l
  LEFT JOIN inv_stock_on_hand s ON l.location_id = s.location_id
  WHERE l.is_active = true
  GROUP BY l.location_id, l.name
  ORDER BY total_value DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get daily transaction trends for the last 30 days
CREATE OR REPLACE FUNCTION get_transaction_trends()
RETURNS TABLE(
  transaction_date DATE,
  purchases INT,
  sales INT,
  adjustments INT,
  transfers INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at) as transaction_date,
    COUNT(CASE WHEN transaction_type = 'PURCHASE_RECEIPT' THEN 1 END)::INT as purchases,
    COUNT(CASE WHEN transaction_type = 'SALE' THEN 1 END)::INT as sales,
    COUNT(CASE WHEN transaction_type IN ('ADJUSTMENT_ADD', 'ADJUSTMENT_SUB') THEN 1 END)::INT as adjustments,
    COUNT(CASE WHEN transaction_type IN ('TRANSFER_IN', 'TRANSFER_OUT') THEN 1 END)::INT / 2 as transfers
  FROM inv_transactions
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY DATE(created_at)
  ORDER BY transaction_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;