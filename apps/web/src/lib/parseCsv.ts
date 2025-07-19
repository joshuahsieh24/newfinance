// apps/web/src/lib/parseCsv.ts

export type Transaction = {
    date: string;
    description: string;
    amount: number;
    isAnomoly?: boolean;
  };
  
  export function parseCsv(text: string): Transaction[] {
    // Split CSV text by line and remove any leading/trailing whitespace
    const lines = text.trim().split("\n");
  
    const rows: Transaction[] = [];
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
  
      // Skip blank lines
      if (!line) continue;
  
      // Split the row by comma and strip quotes
      const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
  
      // If this is a header row (first row with "date"), skip it
      if (i === 0 && values[0].toLowerCase().includes("date")) {
        continue;
      }
  
      // Destructure and validate
      const [date, description, amountStr] = values;
      const amount = parseFloat(amountStr.replace(/[^0-9.-]/g, "")); // strip $/commas/etc
  
      if (!date || !description || isNaN(amount)) continue;
  
      rows.push({
        date,
        description,
        amount,
      });
    }
  
    return rows;
  }

  export function markAnomalies(data: Transaction[]): Transaction[] {
    return data.map((tx) => ({
      ...tx,
      isAnomaly: Math.abs(tx.amount) > 1000,
    }));
  }
  