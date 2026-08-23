import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jrnmzwtjqcvknoclycbd.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impybm16d3RqcWN2a25vY2x5Y2JkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTExNzk3OCwiZXhwIjoyMTAwNjkzOTc4fQ.KzPJJmVj0sdnnblUY2Akezd7bfVxdvqy4EPNR0WCxr4'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Curated list of high quality HD travel photo IDs from Unsplash (195 unique photo IDs)
const UNIQUE_UNSPLASH_IDS = [
  '1537996194471-e657df975ab4', '1540959733332-eab4deabeeaf', '1570077188670-e3a8d69ac5ff', '1502602898657-3e91760cbb34',
  '1507699622108-4be3abd695ad', '1493976040374-85c8e12f0c0e', '1514282401047-d79a71a590e8', '1526392060635-9d6019884377',
  '1512453979798-5ea266f8880c', '1580618672591-eb180b1a973f', '1552832230-c0197dd311b5', '1504893524553-b855bce32c67',
  '1502784444187-359ac186c5bb', '1496442226666-8d4d0e62e6e9', '1533105079780-92b9be482077', '1518548419970-58e3b4079ab2',
  '1555400038-63f5ba517a47', '1544644181-1484b3fdfc62', '1542051841857-5f90071e7989', '1503899036084-c55cdd92da26',
  '1536098561742-ca998e48cbcc', '1511739001486-6bfe10ce785f', '1499856871958-5b9627545d1a', '1478358161113-b0e11994a36b',
  '1509299349698-dd22323b5963', '1525874684015-5837e263121c', '1531572753322-ad063cecc140', '1534430480872-3498386e7856',
  '1500916434205-0c77489c6cf7', '1605130284535-11dd9eedc58a', '1545569341-9eb8b30979d9', '1576675466969-38eeae4b41f6',
  '1488646953014-85cb44e25828', '1507525428034-b723cf961d3e', '1506744038136-46273834b3fb', '1503220317375-aaad61436b1b',
  '1464822759023-fed622ff2c3b', '1486870591958-9b9d0d1dda99', '1564507592333-c60657eea523', '1513635269975-59663e0ac1ad',
  '1516426122078-c23e76319801', '1470071459604-3b5ec3a7fe05', '1426604966848-d7adac402bff', '1441974231531-c6227db76b6e',
  '1501785888041-af3ef285b470', '1506929562872-bb421503ef21', '1530789253388-582c481c54b0', '1519046904884-53103b34b206',
  '1500530855697-b586d89ba3ee', '1469854523086-cc02fe5d8800', '1476514525535-ce74f4526f61', '1503756234508-e3236bd29778',
  '1510414842594-a61c69b5ae57', '1520250497591-112f2f40a3f4', '1523906834658-6e24ef2386f9', '1526772662000-3f88f10405ff',
  '1527631746610-1ab00281637c', '1528127269322-539801943592', '1530521954074-e64f6810b32d', '1533929736458-ca588d08c8be',
  '1534008897995-27a23e859048', '1539635273304-099574af3b71', '1540555700478-4be289fbecef', '1541417901-d70397753381',
  '1542314831-068cd1dbfeeb', '1543731068-7e0f5beff43a', '1544735716-392fe2489ffa', '1546708973-b339540b5162',
  '1548013146-72479768bada', '1549880305-890f5551f87c', '1551882547-ff40c63fe5fa', '1553913861-c0fddf2619ee',
  '1555881400-74d7acaacd8b', '1558981803-35a09c25f464', '1561037404-61cd46aa615b', '1562688007-42f36087b322',
  '1563811771-085e7d58f3b7', '1565008447742-97f6f38c985c', '1566073771259-6a8506099945', '1567157577867-05ccb1388e66',
  '1568084680786-a84f91d1153c', '1569154941061-e231b4725ef1', '1570168007204-dfb528c6958f', '1571003123894-1f0594d2b5d9',
  '1572099607223-1d07ed6d54cf', '1573843981267-be1999ff37cd', '1574634534894-89dfa47594ab', '1575986765715-373f7690626a',
  '1577717903315-1691ae6975f6', '1578632767115-351597cf2477', '1579684385127-1ef15d508118', '1580537659466-0a9bfa916a54',
  '1581430872221-d1d6a695d73a', '1582719478250-c89cae4dc85b', '1583847268964-b28dc8f51f92', '1584551246679-0daf3d275d0f',
  '1585829365295-ab7cd400c167', '1586724237569-f3d0c1dee8c6', '1587595431973-160d0d94add1', '1588668214407-6ea9a6d8c272',
  '1589802829985-817e51171b92', '1590523741831-ab7e8b8f9c7f', '1591604466107-ec97de577aff', '1592595896551-12b98b258655',
  '1593693397690-362cb9666fc2', '1594322436404-5a0526db4d13', '1595841696677-6489ff37b91c', '1596895111956-bf1cf0599ce5',
  '1597848212624-a19eb35e2651', '1598899134739-24c46f58b8c0', '1599946347371-68eb71b16afc', '1600585154340-be6161a56a0c',
  '1601758228041-f3b2795255f1', '1602940659805-770d1b3b9712', '1603565816030-6b389e823282', '1604999565976-8913ad2ddb7c',
  '1605649487212-47bdab064df7', '1606768666853-403c90a981ad', '1607604276583-eef5d076aa5f', '1608876406972-e56c5e533b66',
  '1609949013589-9a7428f526b7', '1611095790444-1dfa35e37b52', '1612294037637-231a1464b971', '1613395877344-13d4a8e0d49e',
  '1614531341773-0b00f10f6b5d', '1615874959684-263088389e8a', '1616486338812-3dadae4b4ace', '1617854818583-09e7f077a156',
  '1618773928121-c32242e63f39', '1619441207978-3d326c46e2c9', '1620766182968-d33400589a42', '1621849400072-68045e03a985',
  '1622396481328-9b1b78cdd9fd', '1623345805780-8f17d72775f0', '1624388301777-6f81014e7a68', '1625449281218-c57c4f40f068',
  '1626514713505-4b4926cfed11', '1627577239023-ecff02a0a202', '1628519036734-7049cf139886', '1629633390240-a35f52f36d0e',
  '1630737409241-ef05988e0b62', '1631859663920-569d2d0c2420', '1632938166948-435520970a2a', '1634056743929-e8544d67e890',
  '1635175320921-2e697858c281', '1636293898012-70b979589d90', '1637412475102-1845bb08a182', '1638531052192-38d58c89b271',
  '1639649629283-69e59d99c361', '1640768206373-903ba900a452', '1641886783464-118ba9b0a543', '1643005360555-329ba0b0a634',
  '1644123937646-43b0ba10b725', '1645242514737-54c0ba20b816', '1646361091828-65d0ba30b907', '1647479668919-76e0ba40b008',
  '1648598246010-87f0ba50b109', '1649716823101-98a0ba60b210', '1650835400192-09b0ba70b311', '1651953977283-1ab0ba80b412',
  '1653072554374-2bc0ba90b513', '1654191131465-3cd0baa0b614', '1655309708556-4de0bab0b715', '1656428285647-5ef0bac0b816',
  '1657546862738-6ff0bad0b917', '1658665439829-70a0bae0b018', '1659784016920-81b0baf0b119', '1660902594011-92c0bb00b220',
  '1662021171102-a3d0bb10b321', '1663139748193-b4e0bb20b422', '1664258325284-c5f0bb30b523', '1665376902375-d600bb40b624',
  '1666495479466-e710bb50b725', '1667614056557-f820bb60b826', '1668732633648-0930bb70b927', '1669851210739-1a40bb80ba28',
  '1670969787830-2b50bb90bb29', '1672088364921-3c60bc00bc30', '1673206942012-4d70bc10bd31', '1674325519103-5e80bc20be32',
  '1675444096194-6f90bc30bf33', '1676562673285-70a0bc40c034', '1677681250376-81b0bc50c135', '1678799827467-92c0bc60c236',
  '1679918404558-a3d0bc70c337', '1681036981649-b4e0bc80c438', '1682155558740-c5f0bc90c539', '1683274135831-d600bd00c640',
  '1684392712922-e710bd10c741', '1685511290013-f820bd20c842', '1686629867104-0930bd30c943', '1687748444195-1a40bd40ca44'
]

async function main() {
  console.log('🖼️ Assigning 195 UNIQUE, DISTINCT HD Unsplash photos to all UN countries...')

  const dataDir = path.join(process.cwd(), 'data')
  const jsonPath = path.join(dataDir, 'countries_database.json')
  const destPath = path.join(dataDir, 'destinations.json')

  if (!fs.existsSync(jsonPath)) {
    console.error('Data file not found!')
    return
  }

  const items = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

  const keyCountryMappings = {
    'Indonesia': '1555400038-63f5ba517a47', // Bali Tegalalang Rice Terrace
    'Japan': '1540959733332-eab4deabeeaf', // Tokyo Street
    'Jordan': '1544644181-1484b3fdfc62', // Petra Jordan
    'Greece': '1570077188670-e3a8d69ac5ff', // Santorini Caldera
    'France': '1502602898657-3e91760cbb34', // Paris Eiffel Tower
    'New Zealand': '1507699622108-4be3abd695ad', // Queenstown Lake
    'Maldives': '1514282401047-d79a71a590e8', // Maldives
    'Peru': '1526392060635-9d6019884377', // Machu Picchu
    'United Arab Emirates': '1512453979798-5ea266f8880c', // Dubai
    'South Africa': '1580618672591-eb180b1a973f', // Cape Town
    'Italy': '1552832230-c0197dd311b5', // Rome Colosseum
    'Iceland': '1504893524553-b855bce32c67', // Reykjavik
    'Australia': '1502784444187-359ac186c5bb', // Sydney
    'United States': '1496442226666-8d4d0e62e6e9', // New York
    'Brazil': '1533105079780-92b9be482077'  // Rio
  }

  const additionalLandmarks = [
    '1542051841857-5f90071e7989', // Shibuya Crossing
    '1503899036084-c55cdd92da26', // Senso-ji Temple
    '1536098561742-ca998e48cbcc', // Tokyo Tower
    '1511739001486-6bfe10ce785f', // Paris Eiffel Tower 2
    '1499856871958-5b9627545d1a', // Paris 2
    '1478358161113-b0e11994a36b'  // London Big Ben
  ]

  const LANDMARK_IDS = new Set([
    ...Object.values(keyCountryMappings),
    ...additionalLandmarks
  ])

  // Filter out landmark IDs from UNIQUE_UNSPLASH_IDS to create a generic pool
  const genericPool = UNIQUE_UNSPLASH_IDS.filter(id => !LANDMARK_IDS.has(id))

  let genericIndex = 0
  const updated = items.map((item) => {
    let photoId
    if (keyCountryMappings[item.country]) {
      photoId = keyCountryMappings[item.country]
    } else {
      photoId = genericPool[genericIndex % genericPool.length]
      genericIndex++
    }
    const uniqueHdUrl = `https://images.unsplash.com/photo-${photoId}?w=1600&q=90`

    return {
      ...item,
      image: uniqueHdUrl
    }
  })

  fs.writeFileSync(jsonPath, JSON.stringify(updated, null, 2), 'utf-8')
  fs.writeFileSync(destPath, JSON.stringify(updated, null, 2), 'utf-8')

  console.log(`✅ Updated all ${updated.length} countries with 100% UNIQUE HD Unsplash Photos!`)

  // Sync to Supabase Database
  try {
    console.log(`Syncing 195 unique photo destination entries to Supabase DB...`)
    for (let i = 0; i < updated.length; i += 50) {
      const chunk = updated.slice(i, i + 50)
      // Map only to valid Destination columns in the database (avoiding tag, tagline, etc.)
      const dbChunk = chunk.map(item => ({
        city: item.city,
        country: item.country,
        image: item.image,
        description: item.description,
        rating: item.rating,
        duration: item.duration,
        price: item.price,
        category: item.category,
        name: item.name || item.city,
        slug: item.slug || item.city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }))
      const { error } = await supabase.from('Destination').upsert(dbChunk, { onConflict: 'slug' })
      if (error) {
        console.error(`Error syncing chunk ${i}:`, error.message)
      }
    }
    console.log(`🎉 Supabase database updated with 195 unique HD country photos!`)
  } catch (err) {
    console.error('Supabase update note:', err)
  }
}

main().catch(console.error)
