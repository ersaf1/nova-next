import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function enableRealtime() {
  // Enable realtime for Booking table via supabase_realtime publication
  let error: unknown = null
  try {
    const result = await supabase.rpc('exec_sql' as any, {
      sql_query: `ALTER PUBLICATION supabase_realtime ADD TABLE "Booking";`
    })
    error = result.error
  } catch (e) {
    error = e
  }

  if (error) {
    console.log('Note: Enable realtime manually in Supabase Dashboard > Database > Replication > supabase_realtime publication > Add table Booking')
    console.log('Or run: ALTER PUBLICATION supabase_realtime ADD TABLE "Booking";')
  } else {
    console.log('✓ Realtime enabled for Booking table')
  }
}

enableRealtime()
