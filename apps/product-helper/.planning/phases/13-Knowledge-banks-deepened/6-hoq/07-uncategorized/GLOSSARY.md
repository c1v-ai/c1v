# QFD Glossary
> Alphabetical reference of all QFD terms. Cross-references indicate which instruction file introduces each term.

---

**Absolute Marks Number** -- The absolute value of a relationship matrix cell's numeric equivalent. Used to calculate imputed importance. {xx→2, x→1, blank→0, +→1, ++→2}. See Phase 6.

**Asymmetric Relationship** -- An EC-to-EC relationship in the roof where the effect in one direction differs from the other. Notated with a slash: "column_effect/row_effect" (e.g., "-1/+1"). See Phase 5.

**Back Porch** -- The right side of the House of Quality containing competitive performance scores: normalized and weighted ratings for your system and competitors on each performance criterion. See Phase 2.

**Basement** -- The area below the main floor of the House of Quality. Contains: imputed importance, positive/negative imputed importance, measurement units, competitor EC values, requirement thresholds, technical difficulty, estimated cost, and design targets. See Phases 6, 7, 8, 9.

**Battery Capacity** -- (Rover example) The size and energy storage of onboard batteries. Higher capacity enables longer runtime but increases weight. See Phase 3 example.

**Competitive Analysis** -- The process of rating your system and competitors on performance criteria to identify strengths, weaknesses, and opportunities. Performed on the back porch. See Phase 2.

**Controls Quality** -- (Rover example) How well the system reacts to quick changes in commands or maintains desired output despite disturbances (e.g., keeping straight when going over a bump). See Phase 3 example.

**Cost Score** -- A 1-5 rating of the financial cost associated with developing or changing an engineering characteristic. Recorded in the basement. See Phase 8.

**CPU** -- (Rover example) The main processing unit handling complex computations like sensor data interpretation and path planning algorithms. See Phase 3 example.

**Decision Matrix** -- A structured table for comparing options across criteria. The back porch of the QFD is essentially a decision matrix. The professionally preferred visualization for competitive scoring. See Phase 2.

**Design Target** -- The intended or desired value for an engineering characteristic in the final design. The ultimate output of the QFD process. See Phase 0, Phase 9.

**Direction of Change** -- An up (↑) or down (↓) arrow assigned to each EC that frames the question asked in the relationship matrix. Up means "What if we increase this?"; down means "What if we decrease this?" Rule of thumb: point in the direction believed to have a positive effect. See Phase 3.

**Engineering Characteristic (EC)** -- Any property of your system that you have control over -- a "knob" you can tweak. Examples: speed, weight, cost, algorithm complexity, sensor accuracy. ECs are what you control; PCs are what customers care about. See Phase 0, Phase 3.

**External Requirement Threshold** -- A minimum or maximum allowable value for an EC imposed by regulation, contract, customer, or management. Minimums are underlined; maximums are bold. See Phase 7.

**Frame Strength** -- (Rover example) The amount of force the robot can withstand before performance-affecting damage occurs. See Phase 3 example.

**Front Porch** -- The left side of the House of Quality containing performance criteria names and their importance weights. See Phase 1.

**House of Quality** -- The common name for the QFD matrix, named for its house-like shape. Contains six sections: front porch, back porch, second floor, main floor, roof, and basement. See Phase 0.

**Imputed Importance** -- A calculated value summarizing how much influence an EC has on overall system performance. Equals the sum of (absolute marks × PC weight) across all PCs for that EC. Traditionally expressed as a percentage (max possible: 200%). See Phase 6.

**Initialization & Calibration Time** -- (Rover example) Time to prepare the robot and all its sensors, algorithms, etc. for use in new operating conditions. See Phase 3 example.

**Internal Criteria** -- Performance criteria important to the company but not directly to the customer (e.g., manufacturing time, profit margin). Listed in italics below customer criteria. See Phase 1.

**Linked House of Quality** -- A series of chained QFD matrices where the second floor of one becomes the front porch of the next. Enables tracing from production requirements back to performance criteria. See Phase 10.

**Lower Triangle** -- The portion of the roof matrix below-left of the diagonal. This is where EC-to-EC interrelationship values are recorded (not the upper triangle). See Phase 5, TEMPLATE_CELL-MAP.

**Main Body / Main Floor** -- The center matrix of the House of Quality where EC columns intersect PC rows. Each cell rates how adjusting an EC affects a PC on the -2 to +2 scale. See Phase 4.

**Marks Number** -- See "Absolute Marks Number."

**Max Payload Size** -- (Rover example) The space available to securely carry a payload, separate from the sensor bay. See Phase 3 example.

**Max Payload Weight** -- (Rover example) The maximum additional weight (beyond the robot itself) that can be carried without degrading performance. See Phase 3 example.

**Microcontroller** -- (Rover example) Smaller, specialized electronics boards handling simpler computational tasks and direct I/O commands (reading sensors, controlling motor voltage). See Phase 3 example.

**N/A (Non-Applicable)** -- Used when an EC does not apply to a competitor, has no relevant unit, or has no external threshold. Distinct from 0, which means the capability exists but scores zero. See Phase 7.

**Navigation Sensors Quality** -- (Rover example) How accurately the robot detects its surroundings. Higher quality typically means larger, more numerous sensors requiring more computational support. See Phase 3 example.

**Negative Imputed Importance** -- The imputed importance calculated using only the negative marks from the relationship matrix. Shows the total weighted negative impact of an EC on performance. Negative II + Positive II = Total II. See Phase 6.

**Normalization** -- Converting diverse measurement units into a common unitless scale (typically 1-5) so scores can be fairly compared and summed. See Phase 2.

**Path Planning Quality** -- (Rover example) How good of a path the algorithm creates, measured by criteria like minimizing distance or maintaining safe clearance. See Phase 3 example.

**Performance Criteria (PC)** -- Measurable attributes that express how well any solution meets customer needs. Examples: time to accomplish tasks, safety, accuracy, cost-effectiveness. PCs are what customers care about; ECs are what you control. See Phase 0, Phase 1.

**Positive Imputed Importance** -- The imputed importance calculated using only the positive marks from the relationship matrix. Shows the total weighted positive impact of an EC on performance. See Phase 6.

**Quality** -- A general term used for ECs like algorithms or sensor processing where higher quality means better results but may require more resources. Often quantified via lookup tables. See Phase 3, Phase 7.

**QFD (Quality Function Deployment)** -- A systematic method for relating customer needs to engineering parameters through a structured matrix (the House of Quality). Used to set defensible design targets and understand trade-offs. See Phase 0.

**Radial Chart** -- A visualization option for back-porch data. Popular in Asia but can be misleading because the visual pattern changes depending on axis order. See Phase 2 context (decision matrix is preferred).

**Re-Evaluation** -- The process of revisiting main floor and roof relationships after obtaining technical difficulty and cost data. May result in changed relationship values and recalculated imputed importance. See Phase 8.

**Relationship Matrix** -- See "Main Body / Main Floor."

**Relative Importance** -- The weight assigned to each performance criterion, expressed as a percentage of the total. All weights must sum to 100%. See Phase 1.

**Roof** -- The triangular matrix above the main floor showing EC-to-EC interrelationships. Only the lower triangle is filled. Uses the same -2 to +2 scale as the main floor. See Phase 5.

**Second Floor** -- The row of EC column headers at the top of the main matrix, plus the direction-of-change arrows row. See Phase 3.

**Sensor Bay Size** -- (Rover example) The space dedicated to accommodating additional onboard sensors, separate from payload space. See Phase 3 example.

**Sensor Filter Quality** -- (Rover example) A measure of how much processing raw sensor data undergoes. More filtering typically yields more reliable data, with diminishing returns at higher levels. See Phase 3 example.

**Sensor Port Type** -- (Rover example) Different sensors have different connection requirements (pin count, communication protocols). The QFD may track multiple port types as separate ECs. See Phase 3 example.

**Slash Notation** -- The format for recording asymmetric EC-to-EC relationships in the roof: "column_effect/row_effect". If one direction is neutral, use 0 or dash. See Phase 5.

**Sparsity** -- The expected property of the main floor matrix where most cells are 0 (blank). Reflects the reality that most ECs do not significantly affect most PCs. >50% zeros is typical. See Phase 4.

**Speed Paradox** -- The phenomenon where an EC has very high total imputed importance but negative II exceeds positive II, meaning increasing it actually hurts overall performance. Named for the rover example where Maximum Speed exhibits this pattern. See Phase 9.

**Symmetric Relationship** -- An EC-to-EC relationship in the roof where the effect is the same in both directions (e.g., increasing A helps B, and increasing B helps A equally). Most roof relationships are symmetric. See Phase 5.

**Technical Difficulty** -- A 1-5 rating of how hard it is to develop or change an engineering characteristic. Factors include: first-time development difficulty, expertise required, labor time, and equipment needed. See Phase 8.

**Total Weighted Performance Score** -- The sum of all weighted scores (normalized score × PC weight) for a system or competitor. The single number summarizing overall performance. See Phase 2.

**Weighted Score** -- A performance score multiplied by its criterion's importance weight. Ensures more important criteria have proportionally greater influence on the total. See Phase 2.

---

**Back to** [Phase 0: Overview](00_QFD-OVERVIEW-AND-TERMINOLOGY.md) | **See also:** [Cell Map](TEMPLATE_CELL-MAP.md)
