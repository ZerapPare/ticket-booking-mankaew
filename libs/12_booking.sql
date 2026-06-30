-- =============================================================
-- 12_booking.sql — ให้โซนยืน (book_tickets) มี hold 10 นาทีเหมือนโซนที่นั่ง
-- รันต่อจาก 11
--
-- redefine book_tickets() ของ 02_functions.sql โดยเพิ่มการเซ็ต hold_expires_at
-- เพื่อให้ออเดอร์โซนยืน (ga) หมดเวลาแล้วถูก release_expired_seats() คืนโควต้าได้
-- (ตรรกะอื่นเหมือนเดิมทุกอย่าง)
-- =============================================================
create or replace function public.book_tickets(
  p_buyer_id       uuid,
  p_ticket_type_id uuid,
  p_quantity       integer,
  p_seat_labels    text[] default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_tt        public.ticket_types;
  v_event_id  uuid;
  v_remaining integer;
  v_txn_id    uuid;
  v_serial    text;
  v_prefix    text;
  i           integer;
begin
  if p_quantity is null or p_quantity < 1 then
    raise exception 'INVALID_QUANTITY: จำนวนตั๋วต้องมากกว่า 0';
  end if;

  -- ล็อกแถว ticket_type กันจองชนกัน
  select * into v_tt from public.ticket_types where id = p_ticket_type_id for update;
  if not found then raise exception 'TICKET_TYPE_NOT_FOUND'; end if;

  if p_quantity > v_tt.max_per_order then
    raise exception 'EXCEEDS_MAX_PER_ORDER: จองได้สูงสุด % ใบต่อออเดอร์', v_tt.max_per_order;
  end if;

  v_remaining := v_tt.quantity_total - v_tt.quantity_sold;
  if p_quantity > v_remaining then
    raise exception 'SOLD_OUT: เหลือ % ที่ แต่ขอจอง %', v_remaining, p_quantity;
  end if;

  v_event_id := v_tt.event_id;
  if not exists (select 1 from public.events where id = v_event_id and status = 'published') then
    raise exception 'EVENT_NOT_AVAILABLE: อีเวนต์นี้ยังไม่เปิดขาย';
  end if;

  -- สร้าง transaction (pending) + ตั้ง hold 10 นาที
  insert into public.transactions (buyer_id, event_id, status, total_amount, hold_expires_at)
  values (p_buyer_id, v_event_id, 'pending', v_tt.price * p_quantity, now() + interval '10 minutes')
  returning id into v_txn_id;

  v_prefix := upper(substr(replace(v_event_id::text, '-', ''), 1, 6));

  for i in 1 .. p_quantity loop
    v_serial := v_prefix || '-' || to_char(now(), 'YYMM') || '-'
                || lpad((v_tt.quantity_sold + i)::text, 6, '0');
    insert into public.tickets (
      ticket_type_id, transaction_id, owner_id, serial_no, qr_code, seat_label, status
    ) values (
      p_ticket_type_id, v_txn_id, p_buyer_id, v_serial,
      encode(gen_random_bytes(16), 'hex'),
      case when p_seat_labels is not null and array_length(p_seat_labels, 1) >= i
           then p_seat_labels[i] else null end,
      'reserved'
    );
  end loop;

  update public.ticket_types
  set quantity_sold = quantity_sold + p_quantity
  where id = p_ticket_type_id;

  return v_txn_id;
end; $$;
