"use strict";

// Each work order includes a commissioning test and a field note.
const work = (name, brief, principle, kind, spec) => ({name, brief, principle, kind, spec});
const pipe = (name, brief, principle, parts, route) => work(name,brief,principle,"route",{parts,route});
const load = (name, brief, base, target, width, fractional = 0) =>
  work(name,brief,"Each socket contributes its digit × its place value. Compare the live total against the calibrated instrument.","load",{base,target,width,fractional});
const divide = (name, brief, value, base) =>
  work(name,brief,"Divide to peel off the least significant digit first. The output rack fills from right to left.","machine",{value,base,mode:"divide"});
const multiply = (name, brief, numerator, denominator, base) =>
  work(name,brief,"Multiply the remaining fraction by the destination base. Send the integer part to the next socket on the right.","machine",{value:numerator,denominator,base,mode:"multiply"});
const group = (name, brief, binary, base) =>
  work(name,brief,"Group outward from the point. Add zero padding at the outside ends so the original place values stay fixed.","group",{binary,base});
const circuit = (name, brief, principle, inputs, slots, outputs) =>
  work(name,brief,principle,"circuit",{inputs,slots,outputs});
const memory = (name, brief, initial, events, desired) =>
  work(name,brief,"Changing D changes the input wire immediately. The stored Q only changes on a clock edge, when it copies D.","memory",{initial,events,desired});
const mask = (name, brief, start, target, allowed, budget) =>
  work(name,brief,"AND keeps bits, OR sets bits, XOR toggles bits. Inspect the intermediate byte after each instruction.","mask",{start,target,allowed,budget});
const mapping = (name, brief, principle, source, target, mode) =>
  work(name,brief,principle,"mapping",{source,target,mode});

const operations = [
  [
    pipe("Find the river relay","The first dispatch reached you as static. Reconnect the river sensor to the observation panel.","A transducer turns a physical quantity into an electrical signal. The ADC translates that signal into discrete codes.",["Display","ADC","Pressure sensor","Processor"],["Pressure sensor","ADC","Processor","Display"]),
    pipe("Restore the measuring instrument","The screen is still reporting voltage as if it were a water height. Reassemble the digitization chain.","Sampling chooses when to take measurements. Quantization chooses the nearest available level. Binary encoding assigns a code.",["Binary encoder","Quantizer","Sampler"],["Sampler","Quantizer","Binary encoder"]),
    load("Four code lines","Send level 11 to the display. The four wires carry one bit each.",2,11,4),
    pipe("Boot the relay","Bring the control program from long-term storage into working memory and execute it.","Storage persists across power loss. RAM holds a program's working data. The processor executes the loaded instructions.",["Processor","RAM","Storage","Alarm"],["Storage","RAM","Processor","Alarm"]),
    pipe("Audit the protection chain","A privileged maintenance command arrived from outside the station. Build the defensive path and send only verified commands to the controller.","Input validation checks form. Authentication checks identity. Authorization checks whether that identity may act.",["Authorization","Controller","Input validation","Authentication"],["Input validation","Authentication","Authorization","Controller"]),
    load("Restore the telemetry bus","The reserve controller has a six-bit unsigned bus. Drive the bus to encode level 46.",2,46,6)
  ],
  [
    load("Decimal counterweights","Set the inventory total to 3,501 using the archive’s decimal counterweights.",10,3501,4),
    load("Shelves of two","The archive switched to binary after the outage. Match the audited total of 301.",2,301,9),
    load("Octal crates","Set the octal counter to match the recorded decimal stock count of 2,703.",8,2703,4),
    load("Hex drawers","The inventory audit gives 6,863 decimal. Balance the four hex drawers to match.",16,6863,4),
    load("The missing half step","Repair a decimal scale that must represent 35.51 exactly. Use the two fractional sockets.",10,35.51,2,2),
    load("Reconcile the archive","A final cart reads 43,981 decimal. Configure the four-digit hexadecimal stamp.",16,43981,4)
  ],
  [
    divide("Freight lift drive","Turn the decimal floor address 38 into binary by operating the divider and transferring each remainder.",38,2),
    divide("Change the gearbox","The replacement lift reads octal. Encode 185 in its new register.",185,8),
    divide("Install the hex controller","The workshop sent command 250 decimal. Load it into the controller's hex register.",250,16),
    divide("Find the service deck","The lift's service address is 943 decimal. Run the hex conversion from start to finish.",943,16),
    divide("Recover the high-rise address","Drive the binary register with the address 764 from the maintenance log.",764,2),
    divide("Maximum-capacity shakedown","Produce the eight-bit address for 255 decimal and observe what happens to every remainder.",255,2)
  ],
  [
    load("The first reading","Match a depth of 0.625 on the binary fractional instrument.",2,0.625,1,3),
    load("The pump head","The calibrated measurement is 28.5625. Set the integer and fractional weights.",2,28.5625,5,4),
    multiply("Encode the valve opening","The valve is open 3/8 of the way. Use the fraction machine to log its binary opening.",3,8,2),
    multiply("Calibrate the precision pump","Convert an exact measurement of 13/32 by cycling the fraction multiplier.",13,32,2),
    load("The runoff meter","Set the captured depth of 32.4375 from a mixture of whole and fractional binary weights.",2,32.4375,6,4),
    multiply("The nonterminating gauge","The last valve opens by exactly 1/10. Capture eight binary fractional places, then record that the remainder persists.",1,10,2)
  ],
  [
    group("Replace the bridge coupler","Translate 10110101₂ to the bridge's hexadecimal connector. Install each socket by reading its bits.","10110101",16),
    group("Reverse the cable","The cable carries 1101010111₂. Refit it to the octal diagnostic port.","1101010111",8),
    group("Both sides of the point","Patch 1101.10101₂ into a hex display. Place the padding carefully.","1101.10101",16),
    group("Recover the old octal signal","An octal packet 356.4 expands to 011101110.100₂. Repack it for the hex receiver.","011101110.100",16),
    group("Split a hex transmission","The source is 23.AB₁₆, already expanded as 00100011.10101011₂. Patch it into an octal port.","00100011.10101011",8),
    group("Commission the mixed link","Fit a hex coupler to 11001011110.0010111₂. Both ends need padding.","11001011110.0010111",16)
  ],
  [
    circuit("Dual interlock","Commission a safety relay that lights only when both interlocks are high.","AND requires every input to be high.",["A","B"],[["AND","OR","XOR"]],[["Ready",1]]),
    circuit("Any open door","Raise an alarm if either door switch is high, including when both are high.","OR remains high when both inputs are high. XOR drops in that row.",["A","B"],[["AND","OR","XOR"]],[["Alarm",7]]),
    circuit("Disagreeing sensors","Signal a fault exactly when the two sensors disagree.","XOR detects disagreement. XNOR indicates agreement.",["A","B"],[["XOR","XNOR","NAND"]],[["Fault",6]]),
    circuit("Dead-man switch","Drive a low output while A is held high, and a high output when A goes low.","A NOT has one input. A NAND with both inputs tied together is also an inverter.",["A"],[["NOT","NAND","BUFFER"]],[["Enable",2]]),
    circuit("Fail-closed latch input","The reset line must stay high unless both permission bits are high.","NAND complements AND across every input row.",["A","B"],[["NAND","NOR","XNOR"]],[["Reset",14]]),
    circuit("Silence detector","Test whether two microphones are both low using two invertible stages. Wire a gate, then invert its output.","De Morgan's law allows NOR to be built using OR followed by NOT.",["A","B"],[["AND","OR","XOR"],["NOT"]],[["Quiet",8]])
  ],
  [
    circuit("Two-district quorum","Build a relay that goes high when A and B vote yes, or whenever C sends an emergency override.","AB + C can be evaluated by producing AB, then ORing that wire with C.",["A","B","C"],[["AND","OR"],["AND","OR"]],[["Pass",87]]),
    circuit("Majority council","Three districts each have a vote. Restart when at least two vote yes.","Build pairwise AND terms AB, AC, BC and OR them. The all-high row passes too.",["A","B","C"],[["AND"],["AND"],["AND"],["OR"],["OR"]],[["Quorum",23]]),
    circuit("Override suppressor","Report a mismatch between A and B only while the override C is low.","Generate A XOR B and NOT(C) separately, then combine the two wires.",["A","B","C"],[["XOR","OR"],["NOT"],["AND","OR"]],[["Fault",40]]),
    circuit("Exactly two votes","There must be exactly two high votes. Use the existing majority and all-high sensor wires.","A majority alone accepts all three. Use a NAND-derived exclusion or invert the all-high wire.",["Majority","AllHigh"],[["NOT"],["AND","XOR"]],[["Pass",2]]),
    circuit("Equivalent wiring","The maintenance manual describes NOR. Build it using separate inverters on A and B and one final gate.","De Morgan: NOT(A OR B) equals NOT(A) AND NOT(B).",["A","B"],[["NOT"],["NOT"],["AND","OR"]],[["Quiet",8]]),
    circuit("Emergency perimeter","Open only if at least one of A or B agrees and C is low, or if A and B are both high even during C. Use separate intermediate signals.","Create (A OR B) AND NOT(C), then combine it with A AND B.",["A","B","C"],[["AND","OR"],["NOT"],["AND"],["AND","OR"],["OR"]],[["Open",43]])
  ],
  [
    circuit("Sum lamp","Install the sum line for adding two one-bit inputs.","The low bit is high for 01 and 10. The sum line is XOR.",["A","B"],[["XOR","OR","AND"]],[["Sum",6]]),
    circuit("Carry lamp","Install the carry line separately so the panel catches the 1 + 1 case.","A carry happens only at 11 and is implemented by AND.",["A","B"],[["AND","XOR","OR"]],[["Carry",1]]),
    circuit("Half-adder assembly","Build and wire a two-output half adder. Both meters must be correct for all four combinations.","Read the two outputs in carry, sum order to recover the numerical total.",["A","B"],[["AND","OR","XOR"],["AND","OR","XOR"]],[["Carry",1],["Sum",6]]),
    circuit("Incoming carry","Prototype the sum line for a full adder. The third input C is the carry arriving from the previous column.","The sum is the parity of all three inputs: (A XOR B) XOR C.",["A","B","C"],[["XOR","AND"],["XOR","OR"]],[["Sum",105]]),
    circuit("Carry chain","Compute the full adder's carry. Propagate C when exactly one of A or B is high, or generate a carry when both are high.","A XOR B detects propagation. A AND B generates the carry. Combine generated and propagated carries with OR.",["A","B","C"],[["XOR"],["AND"],["AND"],["OR"]],[["Carry",23]]),
    circuit("Bench acceptance","The lift controller needs a complete full adder. Wire both ports and pass all eight input tests.","Reuse the A XOR B intermediate for both the sum and the propagated carry.",["A","B","C"],[["XOR"],["XOR"],["AND"],["AND"],["OR"]],[["Sum",105],["Carry",23]])
  ],
  [
    mapping("Patch the receiver","Connect each one-bit selector setting to the antenna it addresses.", "With one select bit, the MUX has two inputs and a single output.",["Roof","Ground"],[0,1],"mux"),
    mapping("Four rooftops","Route the service receiver to all four roof antennas by their binary addresses.","B is the most significant select bit. Codes 00 through 11 address D0 through D3.",["North","East","South","West"],[0,1,2,3],"mux"),
    mapping("Salvage harness","The replacement harness swaps two cables per the site plan. Map each channel to its listed source in the briefing.","The select wires choose a socket. The data signal from that socket then appears on the one shared output.",["West","South","East","North"],[3,2,1,0],"mux"),
    circuit("Build the two-way switch","Route A for S=0 and B for S=1. Construct the switch from gates.","A MUX can be built with NOT(S)·A + S·B.",["S","A","B"],[["NOT"],["AND"],["AND"],["OR"]],[["Y",53]]),
    mapping("Eight-channel relay","The maintenance schedule addresses the eight inputs in standard binary order.","Three select bits address eight sockets. Keep the leading zeros when reading the panel.",["Boiler","Lift","Bridge","Pumps","Doors","Tower","Vault","Dock"],[0,1,2,3,4,5,6,7],"mux"),
    mapping("Audience relay","Rewire the city-wide receiver for the new dispatch schedule shown in the channel map.","Changing the select code picks a different source. It does not change any source's value.",["Boiler","Lift","Bridge","Pumps","Doors","Tower","Vault","Dock"],[5,0,7,2,6,3,1,4],"mux")
  ],
  [
    mapping("Warning beacons","Wire a single alert input to the selected output according to its one-bit address.","DEMUX has one data input and selects which output receives it.",["Lower beacon","Upper beacon"],[0,1],"demux"),
    mapping("District sirens","Route a warning to one of four district sirens. Unselected lines must stay low.","Holding X high turns this DEMUX into a one-hot decoder.",["North","East","South","West"],[0,1,2,3],"demux"),
    mapping("Panel encoder","A keyboard asserts one key wire at a time. Wire each physical key to its required two-bit code.","An encoder assigns a binary code to the active input line. This panel assumes one active input.",["Key 0","Key 1","Key 2","Key 3"],[0,1,2,3],"encoder"),
    mapping("Emergency dispatch","Reconnect the siren harness for the new dispatch order. Use the cable manifest next to the controls.","With X=0, every output stays low even though one destination is selected.",["North","East","South","West"],[2,0,3,1],"demux"),
    circuit("Build a DEMUX branch","Build output D2 of an active-high DEMUX with input X and selector BA. D2 carries data only at BA=10.","Decode BA=10 with B AND NOT(A), then AND the decoded line with X.",["B","A","X"],[["NOT"],["AND"],["AND"]],[["D2",4]]),
    mapping("Display decoder","The damaged display uses eight output lines. Connect each code to its matching lamp in the manifest.","The decoder activates a line based on the input code. The active-high output is one-hot.",["L0","L1","L2","L3","L4","L5","L6","L7"],[0,1,2,3,4,5,6,7],"demux")
  ],
  [
    memory("Store the request", "Latch a high request on the first rising edge, keep it through the silent interval, then clear it.",0,[1,0,1],[1,1,0]),
    memory("Repair the clock loss","The clock is absent in steps 1 and 3. Match the target trace by choosing the D wire before each step.",1,[0,1,0,1],[1,0,0,1]),
    memory("Bridge interlock","Hold the bridge state while the clock line is silent. Save each new request on the next edge.",0,[0,1,0,1,1,0],[0,1,1,0,1,1]),
    memory("Hold through noise","A maintenance trace has three consecutive silent intervals. Preserve the last committed bit until the next rising edge.",0,[1,0,0,0,1,1],[1,1,1,1,0,1]),
    work("Wrapping counter","The tower counter is at 6 and its alert is on state 3. Fit the correct counter width and advance exactly five rising edges.","An n-bit wrapping up-counter has 2ⁿ states. It rolls from 2ⁿ − 1 to 0.", "counter",{start:6,edges:5,target:3,widths:[3,4,5]}),
    work("Night-shift counter","The night clock starts at 13. Commission a counter that reaches state 8 after 11 pulses.","On wrap, discard complete cycles. State is (start + pulses) modulo 2ⁿ.", "counter",{start:13,edges:11,target:8,widths:[4,5,6]})
  ],
  [
    mask("Unlock maintenance","The current word is 85 hex. Bring the maintenance flag 20 high while preserving the other bits.",0x85,0xA5,[0x20,0x80,0x05],1),
    mask("Disable a failed sensor","Clear the high flag 80 in A5 to make 25. Preserve the low seven bits.",0xA5,0x25,[0x7F,0x80,0x20],1),
    mask("Toggle the stuck lights","The console reads 3C. Flip exactly the lights specified by mask 12 to reach 2E.",0x3C,0x2E,[0x12,0x0F,0xF0],1),
    mask("Filter and arm","The word starts at B7. First restrict signals to the high nibble, then arm the low-bit indicator for B1.",0xB7,0xB1,[0xF0,0x01,0x20],2),
    mask("Shift the authorization field","The packed byte is AC. Shift the field right once, then isolate the low nibble to recover 06.",0xAC,0x06,[0x0F,0xF0,0x20],2),
    mask("Rebuild the boot word","Starting at EE, clear the high nibble, toggle low flags 03 and set the heartbeat bit 80. The accepted configuration is 8D.",0xEE,0x8D,[0x0F,0x03,0x80],3)
  ]
];

const capstones = [
  group("Uplink translation","The uplink arrives as 101101.10000000₂. Configure the hex receiver and recover its operation code.","101101.10000000",16),
  circuit("Uplink safety interlock","Route a high output whenever exactly one address input is high, then gate that signal by C. Both conditions must pass to commit a transmission.","XOR detects one of A or B; AND with C authorizes the resulting signal.",["A","B","C"],[["XOR","XNOR","OR"],["AND","XOR","NOR"]],[["Commit",20]]),
  mapping("Dispatch the result","Patch every address on the repaired uplink to the final city distribution map.","One input is delivered to one active output at a time. The manifest assigns nonstandard outlet positions.",["Power","River","Road","Radio","Medical","Lift","Tower","Control"],[7,1,4,0,6,5,2,3],"demux"),
  memory("Store the night dispatch","Acknowledge the handover on rising edges and hold the signal across clock outages.",0,[0,1,0,1,0,1,1,0],[0,1,1,0,0,1,0,0]),
  mask("Commission the city grid","Word D3 contains diagnostic flags. Strip its high nibble, toggle 0A, then set the high ready bit. Commission only at 89.",0xD3,0x89,[0x0F,0x0A,0x80],3)
];
