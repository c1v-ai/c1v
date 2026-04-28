tell application "Microsoft Excel"
    activate
    set wb to open workbook workbook file name (POSIX file "/Users/davidancor/Projects/c1v/system-design/module-6-qfd/c1v_QFD.xlsx" as string)
    delay 2
    set ws to sheet "QFD Template" of wb
    set value of cell "B2" of ws to "c1v Dual-Mode Platform — House of Quality"
    set value of cell "B4" of ws to "David Ancor (Bond)"
    set value of cell "B6" of ws to "2026-04-20"
    set value of cell "B33" of ws to "The system shall impose minimal overhead on customer production systems it observes."
    set value of cell "C33" of ws to "Non-invasiveness"
    set value of cell "D33" of ws to 0.2
    set value of cell "B34" of ws to "The system shall deliver recommendations quickly after a metric deviation is detected."
    set value of cell "C34" of ws to "Feedback Latency"
    set value of cell "D34" of ws to 0.2
    set value of cell "B35" of ws to "The system shall back every tech-stack recommendation with a verifiable metric citation."
    set value of cell "C35" of ws to "Traceback Coverage"
    set value of cell "D35" of ws to 0.2
    set value of cell "B36" of ws to "The system shall generate a reviewable spec shortly after idea submission."
    set value of cell "C36" of ws to "Spec Gen Time"
    set value of cell "D36" of ws to 0.16
    set value of cell "B37" of ws to "The system shall emit the CLI bundle quickly after spec approval."
    set value of cell "C37" of ws to "CLI Emission"
    set value of cell "D37" of ws to 0.12
    set value of cell "B38" of ws to "The system shall feel responsive during founder intake conversation."
    set value of cell "C38" of ws to "Intake Response"
    set value of cell "D38" of ws to 0.12
    set value of cell "E30" of ws to "Probe frequency"
    set value of cell "E31" of ws to "↓"
    set value of cell "F30" of ws to "Aggregation window"
    set value of cell "F31" of ws to "↓"
    set value of cell "G30" of ws to "Metric payload size"
    set value of cell "G31" of ws to "↓"
    set value of cell "H30" of ws to "Probe batch size"
    set value of cell "H31" of ws to "↑"
    set value of cell "I30" of ws to "LLM routing granularity"
    set value of cell "I31" of ws to "target"
    set value of cell "J30" of ws to "Parallel agent dispatch count"
    set value of cell "J31" of ws to "↑"
    set value of cell "K30" of ws to "Prompt-cache hit rate"
    set value of cell "K31" of ws to "↑"
    set value of cell "L30" of ws to "Context tokens per agent call"
    set value of cell "L31" of ws to "↓"
    set value of cell "M30" of ws to "Traceback cache TTL"
    set value of cell "M31" of ws to "target"
    set value of cell "N30" of ws to "Citation completeness floor"
    set value of cell "N31" of ws to "↑"
    set value of cell "O30" of ws to "Vendor-doc refresh cadence"
    set value of cell "O31" of ws to "↓"
    set value of cell "P30" of ws to "Spec artifact format count"
    set value of cell "P31" of ws to "↓"
    set value of cell "Q30" of ws to "Quick Start step count"
    set value of cell "Q31" of ws to "↓"
    set value of cell "R30" of ws to "CLI bundle size"
    set value of cell "R31" of ws to "↓"
    set value of cell "S30" of ws to "Founder intake turn budget"
    set value of cell "S31" of ws to "↓"
    set value of cell "T30" of ws to "Streaming UI chunk cadence"
    set value of cell "T31" of ws to "↓"
    set value of cell "U30" of ws to "Credential rotation cadence"
    set value of cell "U31" of ws to "↓"
    set value of cell "V30" of ws to "Audit log retention"
    set value of cell "V31" of ws to "target"
    set value of cell "E33" of ws to 2
    set value of cell "F33" of ws to -1
    set value of cell "G33" of ws to 2
    set value of cell "H33" of ws to 1
    set value of cell "E34" of ws to -2
    set value of cell "F34" of ws to 2
    set value of cell "G34" of ws to 1
    set value of cell "H34" of ws to -1
    set value of cell "J34" of ws to 1
    set value of cell "K34" of ws to 1
    set value of cell "L34" of ws to 1
    set value of cell "N34" of ws to -1
    set value of cell "O34" of ws to -1
    set value of cell "I35" of ws to -1
    set value of cell "K35" of ws to -1
    set value of cell "L35" of ws to -2
    set value of cell "M35" of ws to 2
    set value of cell "N35" of ws to 2
    set value of cell "O35" of ws to 1
    set value of cell "I36" of ws to 1
    set value of cell "J36" of ws to 2
    set value of cell "K36" of ws to 2
    set value of cell "L36" of ws to 1
    set value of cell "N36" of ws to -1
    set value of cell "P36" of ws to 2
    set value of cell "Q36" of ws to 1
    set value of cell "P37" of ws to 1
    set value of cell "R37" of ws to 2
    set value of cell "U37" of ws to -1
    set value of cell "I38" of ws to -1
    set value of cell "J38" of ws to 1
    set value of cell "K38" of ws to 2
    set value of cell "L38" of ws to 2
    set value of cell "S38" of ws to 2
    set value of cell "T38" of ws to 2
    set value of cell "E4" of ws to -1
    set value of cell "F6" of ws to -1
    set value of cell "G6" of ws to 1
    set value of cell "I8" of ws to -1
    set value of cell "J9" of ws to 1
    set value of cell "J10" of ws to 1
    set value of cell "K10" of ws to 1
    set value of cell "K17" of ws to 1
    set value of cell "L17" of ws to 1
    set value of cell "M13" of ws to -2
    set value of cell "N13" of ws to 1
    set value of cell "P15" of ws to 1
    set value of cell "P16" of ws to 2
    set value of cell "S18" of ws to 2
    set value of cell "AE33" of ws to 3
    set value of cell "AF33" of ws to 5
    set value of cell "AG33" of ws to 4
    set value of cell "AH33" of ws to 5
    set value of cell "AI33" of ws to 5
    set value of cell "AE34" of ws to 3
    set value of cell "AF34" of ws to 4
    set value of cell "AG34" of ws to 3
    set value of cell "AH34" of ws to 1
    set value of cell "AI34" of ws to 1
    set value of cell "AE35" of ws to 5
    set value of cell "AF35" of ws to 5
    set value of cell "AG35" of ws to 5
    set value of cell "AH35" of ws to 2
    set value of cell "AI35" of ws to 2
    set value of cell "AE36" of ws to 2
    set value of cell "AF36" of ws to 4
    set value of cell "AG36" of ws to 3
    set value of cell "AH36" of ws to 2
    set value of cell "AI36" of ws to 3
    set value of cell "AE37" of ws to 3
    set value of cell "AF37" of ws to 5
    set value of cell "AG37" of ws to 4
    set value of cell "AH37" of ws to 1
    set value of cell "AI37" of ws to 1
    set value of cell "AE38" of ws to 2
    set value of cell "AF38" of ws to 4
    set value of cell "AG38" of ws to 3
    set value of cell "AH38" of ws to 2
    set value of cell "AI38" of ws to 5
    set value of cell "C46" of ws to "Devin (Cognition)"
    set value of cell "C47" of ws to "Cursor (Anysphere)"
    set value of cell "E45" of ws to "probes/min"
    set value of cell "E46" of ws to "N/A"
    set value of cell "E47" of ws to "N/A"
    set value of cell "E48" of ws to "≤60/min"
    set value of cell "E49" of ws to 6
    set value of cell "E53" of ws to 2
    set value of cell "E54" of ws to 2
    set value of cell "F45" of ws to "min"
    set value of cell "F46" of ws to "N/A"
    set value of cell "F47" of ws to "N/A"
    set value of cell "F48" of ws to "≤60 min"
    set value of cell "F49" of ws to 60
    set value of cell "F53" of ws to 2
    set value of cell "F54" of ws to 1
    set value of cell "G45" of ws to "KB"
    set value of cell "G46" of ws to "N/A"
    set value of cell "G47" of ws to "N/A"
    set value of cell "G48" of ws to "—"
    set value of cell "G49" of ws to 4
    set value of cell "G53" of ws to 2
    set value of cell "G54" of ws to 1
    set value of cell "H45" of ws to "events/batch"
    set value of cell "H46" of ws to "N/A"
    set value of cell "H47" of ws to "N/A"
    set value of cell "H48" of ws to "—"
    set value of cell "H49" of ws to 50
    set value of cell "H53" of ws to 2
    set value of cell "H54" of ws to 1
    set value of cell "I45" of ws to "scale 1-3"
    set value of cell "I46" of ws to "1 (per-org) Est."
    set value of cell "I47" of ws to "1 (per-org) Est."
    set value of cell "I48" of ws to "≥2"
    set value of cell "I49" of ws to 2
    set value of cell "I53" of ws to 3
    set value of cell "I54" of ws to 3
    set value of cell "J45" of ws to "agents"
    set value of cell "J46" of ws to "3 Est."
    set value of cell "J47" of ws to "1 Est."
    set value of cell "J48" of ws to "—"
    set value of cell "J49" of ws to 5
    set value of cell "J53" of ws to 3
    set value of cell "J54" of ws to 4
    set value of cell "K45" of ws to "%"
    set value of cell "K46" of ws to "50 Est."
    set value of cell "K47" of ws to "60 Est."
    set value of cell "K48" of ws to "—"
    set value of cell "K49" of ws to 70
    set value of cell "K53" of ws to 3
    set value of cell "K54" of ws to 2
    set value of cell "L45" of ws to "tokens"
    set value of cell "L46" of ws to "16000 Est."
    set value of cell "L47" of ws to "4000 Est."
    set value of cell "L48" of ws to "≤200000 (Sonnet)"
    set value of cell "L49" of ws to 8000
    set value of cell "L53" of ws to 2
    set value of cell "L54" of ws to 1
    set value of cell "M45" of ws to "hours"
    set value of cell "M46" of ws to "N/A"
    set value of cell "M47" of ws to "N/A"
    set value of cell "M48" of ws to "—"
    set value of cell "M49" of ws to 24
    set value of cell "M53" of ws to 3
    set value of cell "M54" of ws to 2
    set value of cell "N45" of ws to "%"
    set value of cell "N46" of ws to "30 Est."
    set value of cell "N47" of ws to "20 Est."
    set value of cell "N48" of ws to "≥100"
    set value of cell "N49" of ws to 100
    set value of cell "N53" of ws to 4
    set value of cell "N54" of ws to 3
    set value of cell "O45" of ws to "days"
    set value of cell "O46" of ws to "N/A"
    set value of cell "O47" of ws to "N/A"
    set value of cell "O48" of ws to "≤30"
    set value of cell "O49" of ws to 7
    set value of cell "O53" of ws to 3
    set value of cell "O54" of ws to 3
    set value of cell "P45" of ws to "formats"
    set value of cell "P46" of ws to "N/A"
    set value of cell "P47" of ws to "N/A"
    set value of cell "P48" of ws to "≥1"
    set value of cell "P49" of ws to 1
    set value of cell "P53" of ws to 1
    set value of cell "P54" of ws to 1
    set value of cell "Q45" of ws to "steps"
    set value of cell "Q46" of ws to "N/A"
    set value of cell "Q47" of ws to "N/A"
    set value of cell "Q48" of ws to "—"
    set value of cell "Q49" of ws to 5
    set value of cell "Q53" of ws to 2
    set value of cell "Q54" of ws to 2
    set value of cell "R45" of ws to "MB"
    set value of cell "R46" of ws to "N/A"
    set value of cell "R47" of ws to "N/A"
    set value of cell "R48" of ws to "≤50"
    set value of cell "R49" of ws to 5
    set value of cell "R53" of ws to 3
    set value of cell "R54" of ws to 2
    set value of cell "S45" of ws to "ms"
    set value of cell "S46" of ws to "3000 Est."
    set value of cell "S47" of ws to "800 Est."
    set value of cell "S48" of ws to "≤2000"
    set value of cell "S49" of ws to 2000
    set value of cell "S53" of ws to 3
    set value of cell "S54" of ws to 2
    set value of cell "T45" of ws to "ms"
    set value of cell "T46" of ws to "100 Est."
    set value of cell "T47" of ws to "20 Est."
    set value of cell "T48" of ws to "—"
    set value of cell "T49" of ws to 50
    set value of cell "T53" of ws to 3
    set value of cell "T54" of ws to 2
    set value of cell "U45" of ws to "days"
    set value of cell "U46" of ws to "N/A"
    set value of cell "U47" of ws to "N/A"
    set value of cell "U48" of ws to "≤90"
    set value of cell "U49" of ws to 90
    set value of cell "U53" of ws to 2
    set value of cell "U54" of ws to 2
    set value of cell "V45" of ws to "days"
    set value of cell "V46" of ws to "N/A"
    set value of cell "V47" of ws to "N/A"
    set value of cell "V48" of ws to "≥30"
    set value of cell "V49" of ws to 90
    set value of cell "V53" of ws to 1
    set value of cell "V54" of ws to 2
    save wb
    close wb saving no
    return "Wrote 264 cells."
end tell