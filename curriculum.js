"use strict";
const lesson = (title, topic, color, story, notes, example, practice, lab) =>
  ({title, topic, color, story, notes, example, practice, lab});
const q = (prompt, answer, why, hint, format = "number") =>
  ({prompt, answer: String(answer), why, hint, format});
const sectors = [
  lesson("The Listening Post","Signals & architecture","#76ecd1",
    "Dispatch: Before the blackout, the city heard the river through a pressure sensor. Trace that signal from the river to the floodgate.",
    ["An analog signal varies continuously. Digital logic works with discrete symbols. A binary signal encodes two states, often with ranges of physical voltage interpreted as HIGH and LOW.",
    "Sampling records a signal at selected times. Quantization assigns each sample to an available discrete level, which can be encoded in bits.",
    "Input brings data in. The CPU executes instructions. RAM holds instructions and working data. Storage retains data long term. Output delivers results. Buses or other interconnects carry information between units."],
    "A pressure sensor supplies an analog voltage. An ADC samples and digitizes it. The processor compares the encoded reading with a threshold and sends a command to the output controller.",
    [
      q("Which word describes the river sensor voltage before digitization: analog or digital?","analog","The underlying voltage varies continuously.","Think about whether values are continuous.","word"),
      q("Which unit executes program instructions? Enter CPU, RAM, or storage.","CPU","The CPU executes instructions. RAM holds working data and instructions.","Look for the processor.","word"),
      q("How many distinct quantization codes can 6 bits encode?",64,"Each of the six positions has two choices, giving 2⁶ = 64.","Multiply the number of choices per bit."),
      q("Which unit holds temporary working data? Enter CPU, RAM, or storage.","RAM","RAM is working memory for instructions and data.","Consider where a running program keeps its data.","word")
    ]),
  lesson("The Radix Archive","Place value","#ffcb85",
    "Dispatch: The archive printed one inventory in four bases. Recover the unit count before the supplies are sent to the wrong district.",
    ["Base b uses digits from 0 through b − 1. Decimal uses 0–9, binary 0–1, octal 0–7 and hexadecimal 0–9 plus A–F. Hex A through F represent 10 through 15.",
    "Starting just left of the radix point, positions have weights b⁰, b¹, b² and so on as you move left. To the right, use b⁻¹, b⁻² and so on.",
    "The most significant digit is the leftmost digit in the representation, and the least significant digit is the rightmost. Each bit is one binary digit."],
    "5217₈ = 5×512 + 2×64 + 1×8 + 7×1 = 2703₁₀. A correction to Module 5 slide 15: 1ACF₁₆ is 6863₁₀. The displayed result 23247 corresponds to 5ACF₁₆.",
    [
      q("Convert 100101101₂ to decimal.",301,"256 + 32 + 8 + 4 + 1 = 301.","Index bits from 0 at the right."),
      q("Convert 5217₈ to decimal.",2703,"5×512 + 2×64 + 8 + 7 = 2703.","Use powers of 8."),
      q("Convert 1ACF₁₆ to decimal.",6863,"4096 + 2560 + 192 + 15 = 6863.","The leading digit is 1."),
      q("Smallest legal base for the numeral 707?",8,"The digit 7 requires at least eight available symbols.","A digit must be strictly less than its base.")
    ]),
  lesson("The Remainder Lift","Decimal conversions","#aab2ff",
    "Dispatch: The lift reads its floor number from a binary register. The manual override is still labeled in decimal.",
    ["Divide the integer by the destination base. Record the remainder and repeat with the quotient until it reaches zero. Read the remainders from last to first.",
    "The first remainder gives the units digit. Write zero as 0. For hex, translate remainders 10–15 into A–F.",
    "Check by expanding the answer into positional weights. A positive n-bit unsigned integer is at most 2ⁿ − 1."],
    "250 ÷ 16 = 15 remainder 10. Then 15 ÷ 16 = 0 remainder 15. Read F then A, so 250₁₀ = FA₁₆.",
    [
      q("Convert 38₁₀ to binary.",100110,"38 = 32 + 4 + 2.","Divide repeatedly by 2."),
      q("Convert 185₁₀ to octal.",271,"185 = 2×64 + 7×8 + 1.","Read remainder digits in reverse."),
      q("Convert 943₁₀ to hexadecimal.","3AF","3×256 + 10×16 + 15 = 943.","Start by dividing 943 by 16."),
      q("Largest unsigned value in 9 bits, in decimal?",511,"Nine bits encode 512 values from 0 through 511.","Count zero as a value.")
    ]),
  lesson("Below the Point","Binary fractions","#7ce4ff",
    "Dispatch: The pumps are working, but the water-level display rounds every fractional reading down. Restore the fractional register.",
    ["Evaluate bits right of the binary point with weights ½, ¼, ⅛, 1⁄16, and so on.",
    "To encode a decimal fraction, multiply by 2, record its integer part, and repeat on the remaining fractional part. Read these digits in the order produced.",
    "Convert the integer part separately. A rational fraction in lowest terms terminates in binary precisely when its denominator is a power of two."],
    "For .375, the successive products are .75, 1.5 and 1.0 after carrying only the fractional part forward. Read the integer parts as .011₂.",
    [
      q("Convert 11100.1001₂ to decimal.",28.5625,"28 + ½ + 1⁄16 = 28.5625.","The fourth fractional bit weighs 1⁄16."),
      q("Convert 764.375₁₀ to binary.","1011111100.011","764 = 512 + 128 + 64 + 32 + 16 + 8 + 4. The fraction is ¼ + ⅛.","Handle integer and fractional parts separately."),
      q("Convert 100000.0111₂ to decimal.",32.4375,"32 + ¼ + ⅛ + 1⁄16 = 32.4375.","The first fractional bit is zero."),
      q("Does 0.1₁₀ terminate in binary? Enter yes or no.","no","1/10 in lowest terms has denominator 10, with a factor of 5.","Check the denominator's prime factors.","word")
    ]),
  lesson("The Nibble Bridge","Binary, octal & hex","#ff8ead",
    "Dispatch: The bridge controller reports sensor values in octal. Its replacement board speaks hex. Neither side can use the other's digits.",
    ["One octal digit represents three bits. One hexadecimal digit represents four bits. Expand each source digit separately and preserve its full group width.",
    "When grouping binary, work outward from the radix point. Pad the integer end on the left and the fraction end on the right.",
    "To convert octal directly to hex, expand to binary groups of three, then regroup into groups of four."],
    "23.AB₁₆ → 0010 0011 . 1010 1011₂. For 101.11₂, pad to 0101.1100₂, giving 5.C₁₆.",
    [
      q("Convert 10110101₂ to hex.","B5","1011 = B and 0101 = 5.","Group four bits at a time."),
      q("Convert 1101.10101₂ to hex.","D.A8","1101 . 1010 1000 becomes D.A8.","Pad on the right of the fraction."),
      q("Convert 356.4₈ to hex.","EE.8","011 101 110 . 100 groups as 1110 1110 . 1000.","Use binary as the bridge."),
      q("Convert 1101010111₂ to octal.",1527,"001 101 010 111 maps to 1 5 2 7.","Pad the left side to a multiple of three.")
    ]),
  lesson("The Gate Foundry","Logic gates","#77ebaf",
    "Dispatch: Six gate modules came back from repair with their labels switched. Test their inputs and re-identify the circuits.",
    ["AND is 1 when both inputs are 1. OR is 1 when either or both are 1. XOR is 1 when inputs differ. NOT flips a bit. A buffer passes it through unchanged.",
    "NAND = NOT(AND), NOR = NOT(OR), and XNOR = NOT(XOR). When a symbol has a bubble at its output, invert that output.",
    "For rows 00, 01, 10, 11, AND produces 0001, OR produces 0111 and XOR produces 0110. Complement those columns to derive the inverse gates."],
    "When A=B=1, OR gives 1 while XOR gives 0. NAND gives 0 because AND gives 1.",
    [
      q("Which gate has output column 1110 in row order 00,01,10,11?","NAND","Its only 0 is where AND produces 1.","Complement the column.","word"),
      q("Give the full XNOR column in row order 00,01,10,11.","1001","XNOR is high for equal bits.","Identify the matching pairs.","bits"),
      q("Give the full NOR column in row order 00,01,10,11.","1000","OR is zero only at 00. Invert each output.","Check what happens when any input is high.","bits"),
      q("Which gate outputs A unchanged? Enter BUFFER or NOT.","BUFFER","A buffer produces the same logical value as its input.","A NOT gate inverts the bit.","word")
    ],"gate"),
  lesson("The Quorum Chamber","Boolean expressions","#f5b3ff",
    "Dispatch: Three districts vote to restart the grid. The relay must close whenever at least two districts vote yes.",
    ["A truth table for n binary inputs has 2ⁿ rows. Choose a fixed order, usually ascending binary, and evaluate the internal signals for each row.",
    "For a sum of products, take each row where F=1. In that row's product use a plain variable for each 1 and its complement for each 0, then OR the products.",
    "A three-input majority is AB + AC + BC. Exactly two needs A·B·NOT(C) + A·NOT(B)·C + NOT(A)·B·C. Parentheses and complements change the function.",
    "De Morgan’s laws give NOT(A·B) = NOT(A) + NOT(B) and NOT(A+B) = NOT(A)·NOT(B)."],
    "For F=(A XOR B)·C at 101, A XOR B is 1 and C is 1, so F=1.",
    [
      q("Output column for AB + AC + BC from 000 through 111?", "00010111","Rows 011, 101, 110 and 111 meet the quorum.","111 has at least two ones.","bits"),
      q("Output column for exactly two highs from 000 through 111?", "00010110","Rows 011, 101 and 110 qualify. Row 111 does not.","Compare with the majority table.","bits"),
      q("Output column for (A XOR B) AND NOT(C) from 000 through 111?", "00101000","Only 010 and 100 have different A and B and a low C.","Start by finding rows where C=0.","bits"),
      q("Using De Morgan, NOT(A OR B) combines the inverted inputs using which gate?","AND","The complement of OR is AND of the complements.","The operation swaps.","word")
    ]),
  lesson("The Carry Forge","Half adders","#ffb079",
    "Dispatch: The power meter has two active inputs, yet its sum light goes out. Find where the second unit is stored.",
    ["An adder is a combinational circuit. A half adder adds two one-bit inputs with no incoming carry. It produces two bits: sum S and carry C.",
    "S = A XOR B and C = A AND B. The numeric total is 2C + S, so write C before S in a binary answer.",
    "When you add multi-bit numbers by hand, each column must account for the previous column’s carry. A full adder accepts that third input."],
    "A=B=1 yields S=0 and C=1, so CS=10₂. For 1011₂ + 0110₂, the result is 10001₂.",
    [
      q("For A=B=1, enter the half-adder output in the order carry, sum.","10","Two is represented by one carry and a zero sum.","Carry uses AND.","bits"),
      q("For A=1, B=0, give carry then sum.","01","Only one input is high, so S=1 and C=0.","Keep both output bits.","bits"),
      q("Add 110101₂ and 101111₂. Give the result in binary.","1100100","53 + 47 = 100, which is 64 + 32 + 4.","Track carries from right to left."),
      q("Give the half-adder carry column in row order 00,01,10,11.","0001","Carry occurs only with both inputs set.","Use AND for carry.","bits")
    ],"adder"),
  lesson("Signal Junction","Multiplexers","#7ce4ff",
    "Dispatch: Four rooftop antennas report on the incoming storm. Route the chosen antenna to the single receiver.",
    ["A multiplexer routes one of several inputs to a single output. With n select bits, a fully populated MUX selects among 2ⁿ inputs.",
    "For the deck’s 4-to-1 MUX, B is the most significant select bit and A is the least significant. BA=00, 01, 10, 11 selects D0, D1, D2, D3.",
    "A 2-to-1 MUX with select S computes Y = NOT(S)·D0 + S·D1. A 4-to-1 MUX ORs four products, one enabled by each two-bit select code."],
    "For D0,D1,D2,D3 = 1,1,0,1 and BA=10, the selected input is D2, so Y=0.",
    [
      q("BA=10 selects which input index in a 4-to-1 MUX?",2,"The binary selector 10₂ represents index 2.","B is the high bit."),
      q("For D0..D3 = 0,1,0,1, give the output column for BA = 00,01,10,11.","0101","Each row takes its corresponding D input.","Read the entries in input-index order.","bits"),
      q("How many select lines does a 32-to-1 MUX need?",5,"2⁵ = 32 selectable indices.","Find the exponent."),
      q("A 2-to-1 MUX has D0=NOT(A), D1=A, S=B. Give Y in AB order 00,01,10,11.","1001","At B=0, Y=NOT(A). At B=1, Y=A. This is XNOR.","Evaluate the selected data for each row.","bits")
    ],"mux"),
  lesson("The Dispatch Array","DEMUX, encoders & decoders","#f3a3ad",
    "Dispatch: The warning beacon has one source and four districts. Route it to the correct district, then decode the district identifier on the console.",
    ["A DEMUX routes a single data input X to the selected output. Unselected outputs are 0 in this active-high model.",
    "For BA=10, D2=X. In general D2=B·NOT(A)·X. A 1-to-2ⁿ DEMUX uses n select bits.",
    "A standard one-hot encoder maps one active input line to its binary index. A priority encoder resolves multiple asserted inputs using a priority rule. An active-high decoder asserts the output indexed by the input code.",
    "A DEMUX whose data input is held at 1 can act as an active-high decoder."],
    "With BA=01 and X=1, D0 D1 D2 D3 are 0100. With X=0, all outputs are 0.",
    [
      q("For X=1 and BA=10, enter D0 D1 D2 D3.","0010","Index 2 is the third position when D0 is printed first.","The output bits are listed in ascending index order.","bits"),
      q("For X=0 and BA=11, enter D0 D1 D2 D3.","0000","The selected line carries the input value 0.","Selection does not force a high output.","bits"),
      q("A 3-to-8 active-high decoder receives 101. Enter the high output index.",5,"Binary 101 represents decimal 5.","Decode the input as an index."),
      q("An 8-to-3 one-hot encoder sees only line 6 high. Enter its 3-bit output.","110","The encoder emits the binary index for line 6.","Use weights 4, 2, 1.","bits")
    ],"demux"),
  lesson("The Clock Tower","Sequential logic","#d1b4ff",
    "Dispatch: The gate controller needs to remember whether the bridge was already open before the current signal arrived.",
    ["Combinational output is determined by the current inputs. Sequential circuits store state. Their output can depend on previous inputs through that state.",
    "A rising-edge D flip-flop samples D on each active edge. Q holds its previous value between active edges. A register stores multiple bits. A counter steps through states.",
    "For an unsigned n-bit wrapping up-counter, the next value after 2ⁿ − 1 is 0."],
    "Starting Q=0, D rises to 1 between edges. Q remains 0 until an active edge samples D=1. Then Q holds 1 until another edge changes it.",
    [
      q("Which type stores state? Enter sequential or combinational.","sequential","Sequential circuits use stored state.","A flip-flop belongs to this category.","word"),
      q("D values at three active edges are 1,0,1. Give Q immediately after each edge.","101","Each active edge transfers D into Q.","Use only the values at the edges.","bits"),
      q("A 3-bit wrapping up-counter starts at 6. What decimal value follows 5 increments?",3,"6 → 7 → 0 → 1 → 2 → 3.","Work modulo 8."),
      q("Q starts at 1. D changes to 0 without a rising edge. What is Q?",1,"Q retains the previously stored bit.","The edge is required.")
    ],"clock"),
  lesson("The Integrity Vault","Bitwise operations & security","#80f1ca",
    "Dispatch: The vault’s control word has independent flags for sensors, doors, and alarms. Repair the alarm flag while preserving the others.",
    ["Bitwise operators apply gate logic to matching positions. AND with a mask keeps selected bits. OR sets selected bits. XOR toggles selected bits.",
    "Clear bits with AND and a complemented mask. Use the specified width when complementing a word. In hexadecimal, 8-bit NOT(0F) = F0.",
    "Logical shifts move bit positions; shifted-out bits are discarded at fixed width. Logical right shifts fill from the left with zeros.",
    "Security depends on the hardware that enforces isolation and boot verification. An error in gate logic or stored state can defeat a control. XOR parity detects odd numbers of bit flips; an even number can escape detection."],
    "Set the 0x20 flag in 0x85 using OR to get A5. Then clear 0x80 using AND with 7F to get 25. Checking whether 0x20 is set uses (word AND 0x20) ≠ 0.",
    [
      q("8-bit hex result of A6 AND 3D?","24","10100110 AND 00111101 = 00100100, which is 24.","Compute matching positions."),
      q("8-bit hex result of toggling 3C’s 0x12 mask?","2E","3C XOR 12 = 2E.","XOR with 1 flips a bit."),
      q("Clear mask 0x24 from byte FF. Give hex.","DB","8-bit complement of 24 is DB. FF AND DB is DB.","Complement the mask at 8 bits."),
      q("Can even parity miss two bit flips? Enter yes or no.","yes","Two flips preserve the XOR of all bits.","Think about what happens when parity changes twice.","word")
    ],"mask")
];

const digits = (value, base) => value.toString(base).toUpperCase();
const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = array => array[rand(0, array.length - 1)];
const bits = (value, width) => digits(value, 2).padStart(width, "0");
const gate = {
  AND: (a,b) => a & b, OR: (a,b) => a | b, XOR: (a,b) => a ^ b,
  NAND: (a,b) => 1 ^ (a & b), NOR: (a,b) => 1 ^ (a | b), XNOR: (a,b) => 1 ^ (a ^ b),
  NOT: a => 1 ^ a, BUFFER: a => a
};

function generate(index, hard = false) {
  const n = rand(hard ? 300 : 12, hard ? 4095 : 255);
  const base = pick([2,8,16]);
  const row = rand(0,3);
  const data = Array.from({length:4}, () => rand(0,1));
  switch (index) {
    case 0: {
      const count = rand(4,hard ? 16 : 10);
      return q(`A sensor digitizer uses ${count} bits. How many sample levels can it encode?`,2**count,`There are 2^${count} possible codes.`,"Each bit doubles the number of codes.");
    }
    case 1:
      return q(`Convert ${digits(n,base)} (base ${base}) to decimal.`,n,`Expand each digit using powers of ${base}. The sum is ${n}.`,"Start with exponent zero at the right.");
    case 2:
      return q(`Convert ${n} decimal to base ${base}.`,digits(n,base),`Repeated division by ${base} yields ${digits(n,base)} when you reverse the remainders.`,"Divide until the quotient is zero.");
    case 3: {
      const width = hard ? 8 : 5;
      const part = rand(1,2**width-1);
      const fraction = part / 2**width;
      return q(`Convert ${n + fraction} decimal to binary.`,`${bits(n,1)}.${bits(part,width)}`,`${n} → ${bits(n,1)}. The fraction ${part}/${2**width} uses the ${width}-bit numerator ${bits(part,width)}.`,"Repeatedly multiply the fractional remainder by two.");
    }
    case 4: {
      const part = rand(1,255);
      return q(`Convert ${digits(n,8)}.${digits(part*2,8).padStart(3,"0")} octal to hex.`,`${digits(n,16)}.${digits(part,16).padStart(2,"0")}`,`Expand in groups of 3, regroup by 4. The fractional value is ${part}/256.`,"Pad on the outside edges as needed.");
    }
    case 5: {
      const name = pick(Object.keys(gate).filter(key => !["NOT","BUFFER"].includes(key)));
      const outer = pick(["AND","NOR","XOR","XNOR"]);
      const values = [0,1,2,3].map(i => {
        const a = i >> 1, b = i & 1;
        const value = gate[name](a,b);
        return hard ? gate[outer](value,1 ^ b) : value;
      });
      return q(`Give the output column in AB order 00,01,10,11 for ${hard ? `(A ${name} B) ${outer} NOT(B)` : `A ${name} B`}.`,values.join(""),`Evaluate each inner result first. The four outputs are ${values.join(", ")}.`,"Build a column for each operation.","bits");
    }
    case 6: {
      const hi = pick([1,2,3,4,5,6]), lo = rand(0,hi-1);
      const excluded = rand(0,1);
      const rowList = m => bits(m,3);
      const rule = hard ? `(row is ${rowList(lo)} or ${rowList(hi)}) XOR (C=${excluded})` : `row is ${rowList(lo)} or ${rowList(hi)}`;
      const col = Array.from({length:8}, (_,i) => Number(i===lo || i===hi) ^ Number(hard && (i&1)===excluded)).join("");
      return q(`Give F in order 000 through 111, with A the high bit. F is 1 when ${rule}.`,col,`Mark the listed rows, then ${hard ? "toggle rows where C matches. " : "read the outputs in order. "}The column is ${col}.`,"C is the lowest bit.","bits");
    }
    case 7: {
      const other = rand(7,hard ? 2047 : 63);
      return q(`Add ${bits(n,1)}₂ and ${bits(other,1)}₂. Give binary.`,bits(n+other,1),`The decimal operands are ${n} and ${other}; their sum is ${n+other}, or ${bits(n+other,1)}₂.`,"Write down each carry in the next column.");
    }
    case 8: {
      return q(`MUX inputs D0..D3 are ${data.join(",")}. Select BA=${bits(row,2)}${hard ? ", then XOR Y with the high select bit B" : ""}. What bit results?`,data[row] ^ (hard ? row>>1 : 0),`The MUX selects D${row}=${data[row]}.${hard ? ` XOR this with B=${row>>1}.` : ""}`,"Read BA as a two-bit number.");
    }
    case 9: {
      const x = hard ? data[0] ^ data[1] : 1;
      const result = data.map((_,i) => i===row ? x : 0).join("");
      return q(`DEMUX selects BA=${bits(row,2)}. X is ${hard ? `${data[0]} XOR ${data[1]}` : x}. Give D0 D1 D2 D3.`,result,`X=${x} is routed to D${row}; all other outputs are zero.`,"Compute X before routing it.","bits");
    }
    case 10: {
      const width = rand(3,hard ? 5 : 4), start = rand(0,2**width-1), steps = rand(3,hard ? 90 : 18);
      return q(`A ${width}-bit up-counter starts at ${start}. It increments once per rising edge. Give its decimal reading after ${steps} edges.`,(start+steps)%2**width,`(${start} + ${steps}) modulo ${2**width} gives the reading.`,"Discard full cycles.");
    }
    case 11: {
      const [a,b,c] = Array.from({length:3}, () => rand(17,255));
      const hex = v => digits(v,16).padStart(2,"0");
      const value = hard ? (((a^b)&(255^c))>>>1) : a^b;
      return q(hard ? `8-bit hex: compute ((${hex(a)} XOR ${hex(b)}) AND NOT(${hex(c)})) then logically shift right one place.` : `Compute ${hex(a)} XOR ${hex(b)}. Give hex.`,hex(value),hard ? `XOR gives ${hex(a^b)}, the complemented mask is ${hex(255^c)}, AND gives ${hex((a^b)&(255^c))}, then divide by 2 and round down.` : `The bits differ at the positions set in ${hex(value)}.`,"Write each byte as two groups of four.");
    }
  }
}

const synthesis = [
  q("A sensor sends 2D.8₁₆. Compute the decimal value, multiply by 2 to remove the fractional part exactly, then give that integer in octal.",133,"2D.8₁₆ = 45.5. Double to get 91. 91 = 64 + 24 + 3, so 133₈.","Keep the .8 hex fraction until after doubling."),
  q("Build a NAND-only inverter by tying both inputs to A. Feed this signal and B into a NOR. Give its column in AB order 00,01,10,11.","0010","NAND(A,A)=NOT(A). NOR(NOT(A),B)=A AND NOT(B). Only 10 qualifies.","Simplify the inner NAND first.","bits"),
  q("A 2-to-1 MUX uses select A, D0=B and D1=NOT(B). Its output feeds X of a 1-to-4 DEMUX selected by BA. An alarm is D1 OR D2. Give alarm column in AB order 00,01,10,11.","0110","MUX gives A XOR B. When the inputs differ, BA selects index 1 or 2 and routes a 1 to the alarm.","Carefully distinguish AB row order and BA select order.","bits"),
  q("A half adder receives A and B. A 2-to-1 MUX selects sum at C=0 and carry at C=1. Give Y in ABC order 000 through 111.","00101001","For AB=00,01,10,11 the corresponding sum/carry pairs are 00,10,10,01. Concatenate in that order.","Each AB pair consumes two truth-table rows.","bits"),
  q("An 8-bit counter reads FF hex. One clock edge increments it, then a separate controller sets flags 0x81 and toggles mask 0x03. Give final hex.","82","FF wraps to 00; OR with 81 gives 81; XOR with 03 gives 82.","Complete the wrap before the flag operations."),
  q("Eight data bits 10110111 are stored with a single bit chosen to give even parity. What value is the parity bit?",0,"The data has six ones already. Adding 0 preserves even parity.","Count all ones, not runs of ones."),
  q("A 4-to-1 MUX implements a 3-input majority gate. Select BA with B as MSB. Each Di is 0, 1, C or !C. Enter D0,D1,D2,D3 in order.","0 C C 1","For BA=00, C alone cannot meet quorum. For 01 and 10, C decides. For 11 the quorum is already met.","Split the truth table by the two select bits.","tokens"),
  q("Every rising edge, a D flip-flop samples Q XOR T. Starting Q=1, T at the next five rising edges is 1,0,1,1,0. Give the five successive Q values.","00100","XOR toggles Q when T=1. The successive states are 0,0,1,0,0.","Recompute using the previous Q at each edge.","bits")
];

function normalize(value, format) {
  const text = String(value).trim().toUpperCase();
  if (format === "tokens") return text.split(/[\s,]+/).join(" ");
  if (format === "bits") return text.replace(/[\s,]+/g, "");
  if (format === "word") return text;
  return text.replace(/\s+/g, "").replace(/^0+(?=[\dA-F])/, "").replace(/(\.[\dA-F]*?)0+$/, "$1").replace(/\.$/, "").replace(/^\./, "0.");
}
const matches = (value, question) =>
  String(value).trim() !== "" && normalize(value, question.format) === normalize(question.answer, question.format);
