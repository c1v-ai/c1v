# Building Your Failure Mode and Effects Analysis (FMEA) Checklist

> **Machine-readable companion:** `tool-steps-to-build-FMEA.json` — authoritative structured transcription of these steps with KB-phase mappings, column-accumulation contracts, and the final output checklist. Load the JSON for LLM workflows; this MD is the human-readable mirror.
>
> **Canonical sample:** `FMEA-sample.json` — IR Sensor Encoder worked example from CESYS527 (7 cause rows, 2 corrective-action rounds, 3 stoplight charts).

## Instructions

The Failure Mode and Effects Analysis (FMEA) allows you to assess the risk of your overall system by examining possible losses of functionality. You can analyze and track these risks using a spreadsheet.

The steps presented here discuss a means of creating a FMEA through the use of a template provided in Excel. It is worthwhile to read through all of the steps first as it is often useful to do some of them at the same time.

---

## Before You Begin

| Step | Is Complete When |
|------|------------------|
| **Before You Begin:** Make sure your system's design is advanced enough that you can easily describe how all of the subsystems work together in order to achieve the desired main functionality and handle all of the main use cases required by the challenge definition. | You have an advanced enough design of your system to start an analysis of its parts. |

---

## Step 1: Identify Failure Modes

| Step | Is Complete When |
|------|------------------|
| Choose one part of your system (subsystem or component) that you would like to get started with. Write this part of the system under the 'Subsystem Column' on the FMEA template and on the tab for the sheet. Start to list under 'Failure Mode' all the potential failures this part of the system could experience. Remember that the word 'failure' in risk analysis generalizes anything that doesn't happen the way it's supposed to. When starting to think about design failures, it's best to think about what kinds of functionality would no longer be able to be performed properly, not what specific components fail. At this point you are only focusing on listing important potential losses of functionality or potentially poor performance results, not on the causes that lead to these failures. | You have listed as many important losses or degradations of functionality as you can think of under the 'Failure Mode' column of the FMEA. |

---

## Step 2: List Failure Effects

| Step | Is Complete When |
|------|------------------|
| For each functional failure mode identified, list all the effects it would have on the system under the column titled 'Failure Effects' on your FMEA template. Effects such as any performance loss, additional budget cost, scheduling delays, equipment/parts damage, human harm, etc., are all worth listing. | A list of all of the possible effects have been established for each identified failure mode. |

---

## Step 3: Enumerate Possible Causes

| Step | Is Complete When |
|------|------------------|
| For each effect, create a list of causes under the 'Possible Cause' column on your FMEA template. As you list these causes, you may find that they tend to be oriented more toward components, structural design, or implementation. The causes, however, do not need to be only physical components. Try using the acronym **MMMME** (man, machine, method, material, and environment) that Dr. Schneider describes as you brainstorm. You can probably think of other causes, and not all of these will apply to all failure modes and resulting effects, but this approach offers a good starting point. While the effects can be optionally broken into different rows in your FMEA, you must separate each cause into a different row. This will be crucial for later steps in the process. | At least one possible cause has been listed for each identified effect. Multiple possible causes can be listed for each effect. Several effects may have the same possible cause as well. |

---

## Step 4: Define and Assign Severity Ratings

| Step | Is Complete When |
|------|------------------|
| In the **Rating Systems tab**, create a table with an initial rating scale (anything from 1-3 to 1-10) for severity. Under each of these severity ratings, you can list a set of conditions that define how severe the impact must be in order for a failure cause to earn that rating. In the **FMEA Template tab**, assign a severity rating to each effect/cause. The rule for assigning severity ratings is that you assign the worst severity rating that had at least one of their conditions met by the effect/cause. | Your severity rating system is complete and you have assigned severity ratings to each effect/cause. |

---

## Step 5: Define and Assign Likelihood Ratings

| Step | Is Complete When |
|------|------------------|
| Similar to the severity ratings, in the **Rating Systems tab**, create a table with an initial rating scale (anything from 1-3 to 1-10) for the likelihood of effect/cause occurrence. In the **FMEA Template tab**, assign a likelihood rating to each effect/cause. | Your likelihood rating system is complete, and you have assigned a likelihood rating to each effect/cause. |

---

## Step 6: Build the RPN Definition Table and Criticality Categories

| Step | Is Complete When |
|------|------------------|
| Create a table that combines the severity and the likelihood rating into a matrix. Assign each of the cells its own RPN, as is shown in the Rating Systems tab. Then establish your criticality levels. In the example provided on the template, RPN thresholds have been created for five criticality categories: **High Risk, Medium High Risk, Medium Risk, Medium Low Risk, and Low Risk**. These categories are sometimes also referred to as **Corrective Action Priority** categories. Assign each category a color. Typically, the colors range from green, yellow, orange, to red, with green representing low risk and red representing high risk. Then color each cell according to its risk rating to produce the gradient-like view that ranges from negligible and unlikely, up to catastrophic and likely. | You have created a color-coded RPN Definition table and established Risk Criticality categories. |

---

## Step 7: Calculate RPNs and Assign Risk Criticality

| Step | Is Complete When |
|------|------------------|
| In the FMEA Template tab, calculate RPNs for each effect/cause by multiplying their severity rating by their likelihood rating. Add these values to the "RPN" Column of your FMEA. Look back at your Risk Criticality Ranges and assign a category to each of the effects/causes according to their RPN in the 'Risk Criticality' Column. | You have assigned an RPN value and Risk Criticality to each effect/cause. |

---

## Step 8: Write Corrective Actions

| Step | Is Complete When |
|------|------------------|
| Under the 'Corrective Action' column of your FMEA, list potential corrective action(s) to address each possible cause. Short phrases are often acceptable when writing these in a spreadsheet format. If more text is needed, you can simply enter a reference to another document to keep the spreadsheet easy to read (i.e., 'Please see the timeline alternative plan B.'). It may be a good idea to first deal with the effects/causes that are associated with the highest risk and give them more attention. | Corrective actions have been created for at least all high and almost all medium-high risk potential concerns. |

---

## Step 9: Assign Unique Failure Mode Identifiers

| Step | Is Complete When |
|------|------------------|
| In column A of your FMEA, add a unique identifier for each identified failure mode. Use the naming convention of **F.[number]**. So your failure modes will appear as F.1, F.2, etc. Now that you have added corrective actions for each cause/effect, it makes sense to implement this book-keeping step. The numbering system will help you track each corrective action against a specific failure mode. | You have assigned a unique identifier code to each failure mode. |

---

## Step 10: Add Adjusted Ratings Columns

| Step | Is Complete When |
|------|------------------|
| Create new columns for **adjusted Severity, adjusted Likelihood, adjusted RPN, and adjusted Criticality**. These 'adjusted' columns represent what those factors would be after applying corrective actions. This process can help you decide which corrective actions would be most worthwhile. It can be also be a very useful tool to communicate to others in your team about the importance of the corrective actions. Similarly, it is also useful for demonstrating to outsiders that you have taken identifying risks very seriously and that you have effective means for dealing with these risks. | Adjusted severity, adjusted likelihood, adjusted RPN, and adjusted criticality have been assigned to all effect/causes that have corrective actions associated with them. |

---

## Step 11: Estimate Corrective Action Effort and Resources

| Step | Is Complete When |
|------|------------------|
| Assign an estimate on the additional effort and resources required to implement the corrective actions. This can be helpful in deciding which corrective actions should be implemented. It is usually best to have developed a timeline or an objective means of quantifying effort before attempting this step. | Effort and resources required have been added for all of the corrective actions. Separate columns may be added for the effort and resources required. |

---

## Step 12: Build Before/After Stoplight Charts

| Step | Is Complete When |
|------|------------------|
| Create two stoplight charts. One should be placed beneath the Adjusted columns, and the other goes beneath the original likelihood, severity, and RPN numbers (more to the left, "before" the corrective actions). Since the stoplight chart dimensions need to match what's in your criticality table, it's easiest to copy the cells of the criticality table, paste these cells below your FMEA, and replace the RPN calculations in the table with numbers that show how many effect/causes in your chart fall within each RPN value category (each cell in the table). For clarification, see the example in the **Sample tab** of the FMEA tool. Comparing the chart in the original risk assessment section of your FMEA with chart beneath the Adjusted values will give you snapshots of the amount of risk in your system, both before and after you apply corrective actions. | You have two stoplight charts: one showing the risk of your system before corrective actions, and one showing the risk after corrective actions have been applied. |

---

## Step 13 (Optional): Iterate

| Step | Is Complete When |
|------|------------------|
| Repeat steps 9 through 12 until you are satisfied with the values in your stoplight charts and you have significantly minimized the risk in your system. This iteration can happen at any point of the design process. | You are satisfied with the amount of risk shown in your last stoplight chart. |

---

## Step 14 (Optional, for Advanced FMEA): Troubleshooting Actions

| Step | Is Complete When |
|------|------------------|
| Add a **Troubleshooting Actions** column. This step is usually completed toward the end of the design implementation phase of your project. From completing the earlier steps, you have already listed potential losses of functionality that a user may notice, and you have a list of possible causes associated with the losses of functionality. For the possible causes that remain, list the troubleshooting actions that should take place. | Troubleshooting actions have been listed for all of the remaining causes. |
