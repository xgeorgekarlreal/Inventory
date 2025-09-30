/*
  # Fix Batch Matching Logic to Use Expiry Date

  1. Changes
    - Update record_purchase_receipt function to match batches by expiry_date instead of lot_number
    - Auto-generate lot_number based on product_id, expiry_date, and timestamp
    - Ensure products with same expiry_date reuse existing batch
    - Ensure products with different expiry_date create new batch
    - For items without expiry_date, create separate batch for each receipt

  2. Behavior
    - When expiry_date is provided: Search for existing batch with same product_id and expiry_date
    - If matching batch exists: Reuse that batch_id
    - If no match: Create new batch with auto-generated lot_number
    - When no expiry_date: Create new batch for each purchase receipt

  3. Security
    - Maintains SECURITY DEFINER for proper permissions
    - Validates user authentication
    - Ensures quantity is positive
*/

CREATE OR REPLACE FUNCTION public.record_purchase_receipt(
    p_product_id bigint, 
    p_location_id bigint, 
    p_quantity integer, 
    p_lot_number text DEFAULT NULL::text, 
    p_expiry_date date DEFAULT NULL::date, 
    p_notes text DEFAULT NULL::text, 
    p_reference_id text DEFAULT NULL::text
)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_user_id uuid;
    v_batch_id bigint := NULL;
    v_current_stock_on_hand_id bigint;
    v_current_quantity integer;
    v_generated_lot_number text;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT FALSE, 'User not authenticated';
        RETURN;
    END IF;

    IF p_quantity <= 0 THEN
        RETURN QUERY SELECT FALSE, 'Quantity must be positive';
        RETURN;
    END IF;

    -- Handle batch creation/retrieval based on expiry_date
    IF p_expiry_date IS NOT NULL THEN
        -- Search for existing batch with same product_id and expiry_date
        SELECT batch_id INTO v_batch_id
        FROM inv_expiring_batches
        WHERE product_id = p_product_id 
          AND expiry_date = p_expiry_date;

        IF v_batch_id IS NULL THEN
            -- Generate lot number: PROD{product_id}-EXP{expiry_date}-{timestamp}
            v_generated_lot_number := 'PROD' || p_product_id || '-EXP' || 
                                       TO_CHAR(p_expiry_date, 'YYYYMMDD') || '-' || 
                                       TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS');
            
            -- Create new batch with generated lot number
            INSERT INTO inv_expiring_batches (product_id, lot_number, expiry_date, received_date, user_id)
            VALUES (p_product_id, v_generated_lot_number, p_expiry_date, CURRENT_DATE, v_user_id)
            RETURNING batch_id INTO v_batch_id;
        END IF;
    ELSE
        -- No expiry date: create new batch for each purchase receipt with auto-generated lot number
        v_generated_lot_number := 'PROD' || p_product_id || '-NOEXP-' || 
                                   TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS');
        
        INSERT INTO inv_expiring_batches (product_id, lot_number, expiry_date, received_date, user_id)
        VALUES (p_product_id, v_generated_lot_number, NULL, CURRENT_DATE, v_user_id)
        RETURNING batch_id INTO v_batch_id;
    END IF;

    -- Record transaction
    INSERT INTO inv_transactions (
        product_id, location_id, batch_id, transaction_type, quantity_change, reference_id, notes, user_id
    ) VALUES (
        p_product_id, p_location_id, v_batch_id, 'PURCHASE_RECEIPT', p_quantity, p_reference_id, p_notes, v_user_id
    );

    -- Update or insert into inv_stock_on_hand
    SELECT stock_on_hand_id, quantity INTO v_current_stock_on_hand_id, v_current_quantity
    FROM inv_stock_on_hand
    WHERE product_id = p_product_id 
      AND location_id = p_location_id 
      AND batch_id = v_batch_id;

    IF v_current_stock_on_hand_id IS NOT NULL THEN
        UPDATE inv_stock_on_hand
        SET quantity = v_current_quantity + p_quantity, last_updated = now(), user_id = v_user_id
        WHERE stock_on_hand_id = v_current_stock_on_hand_id;
    ELSE
        INSERT INTO inv_stock_on_hand (product_id, location_id, batch_id, quantity, user_id)
        VALUES (p_product_id, p_location_id, v_batch_id, p_quantity, v_user_id);
    END IF;

    RETURN QUERY SELECT TRUE, 'Purchase receipt recorded successfully';
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, SQLERRM;
END;
$function$;
