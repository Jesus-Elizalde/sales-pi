export interface BatchItem {
  qty: number
  name: string
  price: number
}

export interface Batch {
  id: string
  date: string
  cashTotal: number
  cardTotal: number
  totalAmount: number
  items: BatchItem[]
}

// Generate random items for a batch
function generateItems(count: number): BatchItem[] {
  const items: BatchItem[] = []
  const productNames = [
    "Premium Widget",
    "Standard Widget",
    "Economy Widget",
    "Deluxe Package",
    "Basic Package",
    "Premium Service",
    "Standard Service",
    "Custom Solution",
    "Enterprise License",
    "Personal License",
    "Maintenance Plan",
    "Support Package",
  ]

  for (let i = 0; i < count; i++) {
    const qty = Math.floor(Math.random() * 5) + 1
    const name = productNames[Math.floor(Math.random() * productNames.length)]
    const price = Number.parseFloat((Math.random() * 200 + 50).toFixed(2))

    items.push({ qty, name, price })
  }

  return items
}

// Generate a batch with random data
function generateBatch(id: string, date: string): Batch {
  const items = generateItems(Math.floor(Math.random() * 6) + 3)

  // Calculate totals
  let totalAmount = 0
  items.forEach((item) => {
    totalAmount += item.qty * item.price
  })

  // Randomly split between cash and card
  const cashRatio = Math.random()
  const cashTotal = Number.parseFloat((totalAmount * cashRatio).toFixed(2))
  const cardTotal = Number.parseFloat((totalAmount - cashTotal).toFixed(2))

  return {
    id,
    date,
    cashTotal,
    cardTotal,
    totalAmount,
    items,
  }
}

// Generate batch data for 2025
export const batchData: Batch[] = [
  // January
  generateBatch("A101", "2025-01-05"),
  generateBatch("A102", "2025-01-12"),
  generateBatch("A103", "2025-01-19"),
  generateBatch("A104", "2025-01-26"),

  // February
  generateBatch("B101", "2025-02-02"),
  generateBatch("B102", "2025-02-09"),
  generateBatch("B103", "2025-02-16"),
  generateBatch("B104", "2025-02-23"),

  // March
  generateBatch("C101", "2025-03-02"),
  generateBatch("C102", "2025-03-09"),
  generateBatch("C103", "2025-03-16"),
  generateBatch("C104", "2025-03-23"),
  generateBatch("C105", "2025-03-30"),

  // April
  generateBatch("D101", "2025-04-06"),
  generateBatch("D102", "2025-04-13"),
  generateBatch("D103", "2025-04-20"),
  generateBatch("D104", "2025-04-27"),

  // May
  generateBatch("E101", "2025-05-04"),
  generateBatch("E102", "2025-05-11"),
  generateBatch("E103", "2025-05-18"),
  generateBatch("E104", "2025-05-25"),

  // June
  generateBatch("F101", "2025-06-01"),
  generateBatch("F102", "2025-06-08"),
  generateBatch("F103", "2025-06-15"),
  generateBatch("F104", "2025-06-22"),
  generateBatch("F105", "2025-06-29"),

  // July
  generateBatch("G101", "2025-07-06"),
  generateBatch("G102", "2025-07-13"),
  generateBatch("G103", "2025-07-20"),
  generateBatch("G104", "2025-07-27"),

  // August
  generateBatch("H101", "2025-08-03"),
  generateBatch("H102", "2025-08-10"),
  generateBatch("H103", "2025-08-17"),
  generateBatch("H104", "2025-08-24"),
  generateBatch("H105", "2025-08-31"),

  // September
  generateBatch("I101", "2025-09-07"),
  generateBatch("I102", "2025-09-14"),
  generateBatch("I103", "2025-09-21"),
  generateBatch("I104", "2025-09-28"),

  // October
  generateBatch("J101", "2025-10-05"),
  generateBatch("J102", "2025-10-12"),
  generateBatch("J103", "2025-10-19"),
  generateBatch("J104", "2025-10-26"),

  // November
  generateBatch("K101", "2025-11-02"),
  generateBatch("K102", "2025-11-09"),
  generateBatch("K103", "2025-11-16"),
  generateBatch("K104", "2025-11-23"),
  generateBatch("K105", "2025-11-30"),

  // December
  generateBatch("L101", "2025-12-07"),
  generateBatch("L102", "2025-12-14"),
  generateBatch("L103", "2025-12-21"),
  generateBatch("L104", "2025-12-28"),
]
