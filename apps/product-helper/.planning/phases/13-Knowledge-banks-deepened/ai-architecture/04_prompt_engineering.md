## Deploying AI

## Prompt Engineering

$ echo "Data Sciences Institute"

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000000_ea599e14d4588c33921df8159984cb8ff5dd32f82a2ce9f56bb94a5c8d07e7ce.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000001_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Introduction

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000002_49560bf1e9ba29234af061f7636227a44526b692eb8a88cfe3388c9019a04ecd.png)

Agenda

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000003_818130d666454ece767016a874b4863e60c0d4931ba94e31454818182b3d8eee.png)

## Agenda

- System vs user prompt, context length and context efficiency
- Prompt engineering best practices
- Defensive prompt engineering

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000004_c0b91c811a6afd26c37016fa3674ed522e2ddc469cca2dc5102f25ca47e05ae0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000005_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Reference Process Flow

Data

Text

Images

Speech WM

Structured

Data

3D Signals

Fig. 2. A foundation model can centralize the information from all the data from various modalities. This one model can then be adapted to a wide range of downstream tasks.

Training

Foundation

Model

Tasks

Question

Answering

?

Sentiment

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000006_3a39e4c110bc7c0e3bfe4f298a8ad3cbefa936ff233ccce4a1f6490e2d1ae11d.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000007_5c1c0cf646c2e0c6fd15255e6b1057b5d33376f381aaa813129227899d553c42.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000008_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## What is Prompt Engineering ?

- Prompt engineering is the process of crafting instructions that guide a model to generate the desired outcome.
- It is the easiest and most common model adaptation technique.
- Unlike finetuning, it does not change the model' s weights but instead steers its behavior.
- Strong foundation models can often be adapted using prompt engineering alone.
- It is easy to write prompts, but not easy to write effective prompts.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000009_eae955fd63dffec5501b24ae1f5f2d9c226d0d0c4797f83d5ca115b2b342cb58.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000010_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

imgflip.com

## Misconceptions and Criticisms

- Some dismiss prompt engineering as unscientific fiddling with words.
- In reality, it involves systematic experimentation and evaluation.
- It should be treated with the same rigor as any machine learning experiment.
- Effective prompt engineering requires communication skills and technical knowledge.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000011_5a9c049239320ad20aa6cb3e398f98bf94dc8acb82d097ebd979d673812e27e2.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000012_f0225e2a6b6cf27957e592ed8ffa03831f6c96b62ae3ca2469afd83cc662c60d.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000013_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## The Role of Prompt Engineering

- Prompt engineering is a valuable skill but not sufficient alone for production systems.
- Developers also need skills in statistics, engineering, and dataset curation.
- Well-designed prompts can power real applications but require careful defense against attacks.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000014_7f260593615f05ecbf1d0ea629584cf6efdb6cf7187fdb3e6ee30db54951178b.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000015_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Introduction to Prompting

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000016_7f260593615f05ecbf1d0ea629584cf6efdb6cf7187fdb3e6ee30db54951178b.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000017_6a56600e1bac993d116a08f4c55acfaa3fffc6185bb2655e67a065d294f3abc4.png)

## Anatomy of a Prompt

- A prompt is an instruction given to a model to perform a task.
- Prompts may include task descriptions, examples, and the specific task to perform.
- For prompting to work, the model must be able to follow instructions.
- How much prompt engineering is needed depnds on how robust the model is to prompt perturbations.

```
Given a text, extract all entities. Output only the list of extracted entities, separated by commas, and nothing else. Text: "Brave New World is a dystopian novel written by Aldous Huxley, first published in 1932." Entities: Brave New World, Aldous Huxley Text: ${TEXT_TO_EXTRACT_ENTITIES_FROM} Entities:
```

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000018_e2f5ae80764875a4a9b53395a19fc3b7c5929b2ee4f9721c389de0f07ac6a387.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000019_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Measuring Robustness

- Robustness can be tested by slightly altering prompts and observing results.
- Stronger models are more robust and understand equivalent expressions such as '5' and 'five.'
- Working with stronger models often reduces prompt fiddling and errors.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000020_0ba5343431d7968e820b1994cd345a20ed34b9ea436b49196ec214085777aa11.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000021_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## In-Context Learning

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000022_e92e390b0300f03428735e90323805b5c55ddbc2559b50ca7676d7e8412f9fb8.png)

## Zero-Shot and Few-Shot Learning

- Teaching models via prompts is known as in-context learning.
- Zero-shot learning uses no examples in the prompt.
- Few-shot learning uses a small number of examples to guide the model.
- The effectiveness depends on the model and the task.
- GPT-3 demonstrated that it was able to learn examples contained in the prompt, even if the desirable behaviour is different from the behaviour that the model was trained on.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000023_a57f824b7512cd6446a0a82aeca6053ab4eccf32c2b51d425f3e2806c3fd884c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000024_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Benefits of In-Context Learning

- Models can adapt to new information beyond their training cut-off date.
- In-context learning acts like continual learning by incorporating new data at inference time.
- This prevents models from becoming outdated.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000025_0939f2aa8093fb200416bec917801bd9b8193e4ec1384d51faa3bdc059b5b629.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000026_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Prompt Structure

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000027_c27985c9a6e97c6bedf47c8bbe9a77884ce104f65f4b6ac293b04e1e03d147d0.png)

## System Prompts and User Prompts (1/2)

- Many APIs separate prompts into system prompts and user prompts.
- The system prompt defines rules, roles, and tone.
- The user prompt contains the specific task or query.
- The final input is a combination of both.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000028_b03ced97185ca0692e3459cd4ddcf7680d2fa10e6243d2cf03dca5727ae7f606.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000029_69537736864dbcec0170d6dc6c1aca3471004bc22d74383248c7dbf015a08a29.png)

## System Prompts and User Prompts (2/2)

## System prompt

You are an experienced real estate agent. Your job is to read each disclosure carefully, fairly assess the condition of the property based on this disclosure, and help your buyer understand the risks and opportunities of each property. For each question, answer succinctly and professionally.

## User prompt

Context: [disclosure.pdf]

Question: Summarize the noise complaints, if any, about this property.

Answer:

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000030_67fdfc9879178349c5f527f8b03cd8b4861abf2fd15f9e9d41844afb49aa00af.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000031_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Importance of T emplates

- Models such as Llama require specific chat templates.
- Deviations from templates can cause degraded performance.
- Using incorrect templates is a common source of silent failures.
- For example, Llama 3 prompts need to follow a specific prompt template. For example:
- When implementing or fine-tuning a model with a given template, it is important to maintain the template's integrity.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000032_6d31804974b1ae3c4e5bf6e610bdd1831bfd83bdacc0abb5c50bf50518fc6fc8.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000033_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Example of a Chat T emplate

&lt;s&gt; [INST] &lt;&lt;SYS&gt;&gt; You are a friendly chatbot who always responds in the style of a pirate &lt;&lt;/SYS&gt;&gt; How many helicopters can a human eat in one sitting? [/INST] Ahoy there, mate! A human can't eat a helicopter in one sitting, no matter how much they might want to. They're made of metal and have blades that spin at high speeds, not exactly something you'd want to put in your belly!&lt;/s&gt; &lt;s&gt; [INST] Are you sure?&lt;/s&gt;  [/INST] Aye, I'm sure! Helicopters are designed for flight and are not meant to be consumed by humans. They're made of metal and have blades that spin at high speeds, which would be very dangerous to ingest. So, no human can eat a helicopter in one sitting, no matter how much they might want to.&lt;/s&gt;

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000034_1d832005e87b1a21d360f65dd189108004a25472ce5272e5fc4e7805493cbcd0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000035_4397ee3369e27621ce995cb19d645c07a82fb689b386efa432225a1a12be34fd.png)

## Context Length

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000036_6ec8563b42f9f7a4314c1cbc91089ba71ae2d4ef1626604d94f7c151c16ffebf.png)

Exponential Growth of Context Length in Language Models

Tracking the growth in input context length over time

Created by: artfish.ai

1M

¿ 100K

Context

10K

Input

## Expanding Context Windows

1K

2018

·

Gemini 1.5 Pro 2M

Gemini 1.5

2M tokens

Claude 2.1

GPT - 4 Turbo

Claude 1.2

GPT - 4 - 32K

- Context length determines how much information a model can process in one prompt. ·

GPT - 1

BERT

T5

- Context windows have grown from 1K tokens in GPT-2 to 2M tokens in Gemini-1.5. Model Release Date
- Larger context allows models to handle long documents and complex tasks.
- [Image: (Yun, 2024)](https://www.artfish.ai/p/long-context-llms)

Gemini

1.0

2024

artfish.ai

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000037_4de58be759a753b82d23c17ab142910972ddb6396bdea8a50c907e2fb8bd1cab.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000038_088bae4d806ddf86e2dbc728020fc025043027efe5783a69a3694d8f9a61d15c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000039_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Context Efficiency

- Models understand information at the beginning and end of prompts better than in the middle.
- Needle-in-a-haystack tests show models often miss details buried deep in the prompt.
- Developers should place important information strategically.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000040_56adabd592c99f6415155763753188739a04257f0e6ea97838fb2a0569472c9a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000041_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

75

70

65

60

55

50

10 Total Retrieved Documents (~2K tokens)

75

## Needle in the Haystack

60

75

70

₴ 65

· 60

Needle in the Haystack (NIAH): insert a random piece of information (needle) in different locations of the prompt (haystack) and ask a model to find it. 30th

Position of Document with the Answer

· claude-1.3

Position of Document with the Answer claude-1.3-100k gpt-3.5-turbo-0613

gpt-3.5-turbo-16k-0613

Position of Document with the Answer

→ mpt-30b-instruct - longchat-13b-16k

Figure 5: The effect of changing the position of relevant information (document containing the answer) on multi- document question answering performance. Lower positions are closer to the start of the input context. Performance

is highest when relevant information occurs at the very start or end of the context, and rapidly degrades when models must reason over information in the middle of their input context.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000042_cdf16fee30fa992a2d32a12f5a2cfa29bf9d31880dd5bfb486aa789467fd7e1a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000043_7669bf275785c8e0b8f22f26e4306196283340ad763bb79455b9bcc5b5e72dda.png)

20 Total Retrieved Documents (~4K tokens)

30 Total Retrieved Documents (~6K tokens)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000044_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Best Practices in Prompt Engineering

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000045_75b40be2c363e84a9c80eab55c5f00626f650d90e0054591ede0107546a674a7.png)

## Writing Clear Instructions

- Clear and explicit instructions reduce ambiguity.
- Explain what you want the model to do: "score between 1 and 5..."
- Adjust prompts to reduce unwanted behaviour: if the model outputs 4.5, update the prompt to output integers.
- Specify scoring systems, rubrics, required formats, or acceptable ranges.
- Include examples to clarify expected responses.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000046_40dcc1f8bca62114b7d41594be3615bf9bb622d7538935083750cccb7553a911.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000047_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Unclear Pormpts

Role: User

## Unclear Prompt

Please remove all personally identifiable information from these customer feedback messages: {{FEEDBACK\_DATA}}

## Role: Assistant (Claude's response)

```
Here are the anonymized customer feedback messages: 1. I've been using your software for years, and it's been great. But lately, AcmeCloud has been crashing a lot. Fix it! 2. XXX, your customer support rep, was incredibly helpful. He guided me through the whole process. My email is XXX if you want to send a survey. 3. I'm John Smith, and I'm not happy. I've been on hold for 2 hours trying to reach someone at XXX. This is unacceptable!
```

Source: Claude Docs.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000048_c56fd2a70d316694923cdbf17dd314178581873511efe506f2350560491fa1f6.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000049_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Clear Pormpt (1/2)

## Role: User

## Clear Prompt

```
Your task is to anonymize customer feedback for our quarterly review. Instructions: 1. Replace all customer names with 'CUSTOMER_[ID]' (e.g., 'Jane Doe' → 'CUSTOMER_001'). 2. Replace email addresses with 'EMAIL_[ID]@example.com'. 3. Redact phone numbers as 'PHONE_[ID]'. 4. If a message mentions a specific product (e.g., 'AcmeCloud'), leave it intact. 5. If no PII is found, copy the message verbatim. 6. Output only the processed messages, separated by '---'. Data to process: {{FEEDBACK_DATA}}
```

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000050_6050162b536b63f79ccf4fa2d23f65971f0d9870e4cc94f0144ad8feaf53d3ed.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000051_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Clear and Unclear Pormpts (1/2)

## Role: Assistant (Claude's response)

CUSTOMER\_001: I've been using your software for years, and it's been great. But lately, AcmeCloud has been crashing a lot. Fix it! ---CUSTOMER\_002: CUSTOMER\_SERVICE\_001, your customer support rep, was incredibly helpful. He guided me through the whole process. My email is EMAIL\_002@example.com if you want to send a survey. ---

CUSTOMER\_003: I'm CUSTOMER\_003, and I'm not happy. I've been on hold for 2 hours trying to reach someone at PHONE\_001. This is unacceptable!

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000052_31629472a70086df87c7e08e70b0b96bc44b5b8c743d2bb33a6411bae28f1dab.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000053_69537736864dbcec0170d6dc6c1aca3471004bc22d74383248c7dbf015a08a29.png)

2

4

Please rate the essay below on a scale of 1 to 5, with 1 being the lowest and 5 being the highest. Be concise. Output only the score and nothing

else.

"I like chickens. Chickens are fluffy, and they give tasty eggs."

## Using Personas

- Assigning a persona helps models respond appropriately. 1 to 5, with 1 being the lowest and 5 being the highest. Be concise.
- For example, scoring essays as a first-grade teacher yields different results than as a professional editor.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000054_567c05c7d1bfff2bb80935c029d147c00751a5f84a9e75802c91f0ebcaba8c0e.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000055_32d18e67433e4e2fd53f9a08ecdaca772238cbc55de811e5826c899e4ccf417d.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000056_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Providing Examples

- Examples guide the model toward the desired output style (Anthropic).
- Accuracy : Examples reduce misrepresentation of instructions.
- Consistency : Examples enforce uniform structure and style.
- Performance : Well-chosen examples boost the model's ability to handle complex tasks.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000057_25eba106c566d387f54262503e5d908eedac738067406d2a6651338a9573e912.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000058_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Effective Examples

## Effective examples are:

- Relevant : The examples mirror the actual use case.
- Diverse : Examples cover edge cases, potential challenges, and vary enough so that the model does not learn unintended patterns.
- Clear : The examples are indicated with markers or tags such as &lt;example&gt; .

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000059_28c1921e6b3f51f3212c5f24087853b7025b3c2551054b76da3fbb940f81f1e8.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000060_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## No Examples (1/2)

Role: User

## Prompt without examples

```
Analyze this customer feedback and categorize the issues. Use these categories: UI/UX, Performance, Feature Request, Integration, Pricing, and Other. Also rate the sentiment (Positive/Neutral/Negative) and priority (High/Medium/Low). Here is the feedback: {{FEEDBACK}}
```

Source: Claude Docs.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000061_ef030fa97228b4a623de804aa43fef45a5871452f0dd9facc3e8fda1d19cbf26.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000062_69537736864dbcec0170d6dc6c1aca3471004bc22d74383248c7dbf015a08a29.png)

## No Examples (2/2)

## Role: Assistant (Claude's response)

Here's the analysis of the customer feedback:

Issue: UI/UX

Sentiment: Negative

Priority: High

The customer is frustrated with the new dashboard design, which they find cluttered and slow to load.

They specifically call out the missing 'export' button, which is likely a critical feature. This issue needs to be addressed as a high priority.

Issue: Integration

Sentiment: Positive

Priority: Medium

The customer is pleased with the existing Salesforce integration but would like to see support for Hubspot as well. This is a feature request that could be considered for a future product update.

Issue: Pricing

Sentiment: Negative

Priority: High

The customer finds the pricing to be unreasonable, especially for the basic features. They are threatening to switch to a competitor, so this is a high-priority issue that needs to be reviewed.

Issue: Performance

Sentiment Negative

Priority: High

The customer is experiencing critical issues with the mobile app, where large file uploads consistently result in crashes. This is a significant problem that impacts the customer's ability to use the product effectively and should be addressed as a high priority.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000063_713f117c0123c9f57607fade1cf50107f149967e9240470da60a5ffb572a68c9.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000064_4397ee3369e27621ce995cb19d645c07a82fb689b386efa432225a1a12be34fd.png)

## With Examples (1/2)

Role: User

## Prompt with examples

Our CS team is overwhelmed with unstructured feedback. Your task is to analyze feedback and categorize issues for our product and engineering teams. Use these categories: UI/UX, Performance, Feature Request, Integration, Pricing, and Other. Also rate the sentiment (Positive/Neutral/Negative) and priority (High/Medium/Low). Here is an example:

&lt;example&gt;

Input: The new dashboard is a mess! It takes forever to load, and I can't find the export button. Fix this ASAP!

Category: UI/UX, Performance

Sentiment: Negative

Priority: High&lt;/example&gt;

Now, analyze this feedback: {{FEEDBACK}}

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000065_dfdda8d30c5b23552afbf31304b8a202ecbdfee5d7f8329bae51a77facbd8470.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000066_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## With Examples (2/2)

## Role: Assistant (Claude's response)

Here's the analysis of the customer feedback:

1. The new dashboard is a mess! It takes forever to load, and I can't find the export button. Fix this ASAP!
2. Love the Salesforce integration! But it'd be great if you could add Hubspot too.
3. Your pricing is ridiculous! $99/mo for basic features? I'm switching to Competitor X.
4. The mobile app keeps crashing when I try to upload large files (&gt;50MB). This is critical for our field agents. Category: Performance

Category: UI/UX, Performance

Sentiment: Negative

Priority: High

Category: Integration, Feature Request

Sentiment: Positive

Priority: Medium

Category: Pricing

Sentiment: Negative

Priority: High

Sentiment: Negative

Priority: High

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000067_4baad04b22d6fd207d6afcd6b03977913238f04b9daf6ebec0f9af466aacf184.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000068_4397ee3369e27621ce995cb19d645c07a82fb689b386efa432225a1a12be34fd.png)

Table 5-1. Providing an example can nudge the model toward the response you want.

Inspired by Claude's prompt engineering tutorial.

Without

## Nudging a Model with Examples

example

With example

presents on Christmas?

Q: Is the tooth fairy real?

A: Of course! Put your tooth under your pillow

tonight. The tooth fairy might visit and leave

you something.

0: Will Santa bring me presents on Christmas?

A:

kids believe in, bringing magic and excitement to Christmas with stories of his

sleigh, reindeer, and gift-giving journey on Christmas Eve. Many parents encourage this

belief, as it adds a layer of fun and wonder

| for children.                                                                      |
|------------------------------------------------------------------------------------|
| Yes, absolutely! Santa loves to bring presents to kids who believe in him and have |

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000069_190cee0547b9f4a4ba42aa5b2cb2bf97b4b6997e04d65ca6ea2233ecfc0609d8.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000070_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Example Formats (1/2)

## Fewer tokens should be used to conserve context space and reduce costs.

| Prompt                                                                                                                         |   #tokens(GPT- 4 ) |
|--------------------------------------------------------------------------------------------------------------------------------|--------------------|
| Label the following item as edible or inedible. Input: chickpea Output: edible Input:box Output: inedible Input: pizza Output: |                 38 |

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000071_5482a8ba227530adf74fdc6b73dae6a371e772aa77c717618a896d853efdd6fd.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000072_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Example Formats (2/2)

| Prompt                                                              |   #tokens(GPT- 4 ) |
|---------------------------------------------------------------------|--------------------|
| Label the following item as edible or inedible. chickpea --> edible |                 27 |

Some example formats are more expensive than others (Huyen, 2025).

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000073_88c62c927dd8712af505d7621ebd8355aedc26ae62ab8c46f0b2be4f0ed16618.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000074_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Specifying Output Format

- Structured tasks require explicit instructions about output format.
- Models should be told to produce JSON, integers, or labeled text.
- Using markers prevents confusion between inputs and outputs.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000075_57a6b60b0c6beed7a1dc6cde3a536f0f5810d217bd23caa1955d7bf448c69b1c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000076_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Markers

| Prompt                                                                                                    | Model's output   |
|-----------------------------------------------------------------------------------------------------------|------------------|
| Label the following item as edible or inedible. pineapple pizza --> edible cardboard --> inedible chicken | tacos --> edible |
| Pineapple pizza --> edible cardboard --> inedible chicken -->                                             | edible           |

Without explicit markers to mark the end of the input, a model might continue appending to it instead of generating structured outputs (Huyen, 2025).

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000077_96caa53deaa96e3fc7423eba52f07bf5f74f19593098896834e9458c7f22215a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000078_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Provide Sufficient Context (1/2)

- Including reference texts improves accuracy and reduces hallucinations.
- Context can be supplied directly or retrieved through tools like RAG pipelines.
- In some scenarios, we want to restrict the response to only consider the context that we provided .
- Clear instructions: "Answer using only the provided context."
- Examples of questions that it should not be able to answer.
- Instruct the model to specifically quote the corpus that we provided.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000079_ebee28c687dc877324a1400dc21e1507f9009a6aa1f5f2885b58850c2ca318b5.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000080_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Provide Sufficient Context (2/2)

## Add contextual information such as:

- Describe how the task results will be used.
- Establish the intended audience.
- What workflow the task is part of and where does this task belong within the workflow.
- What is the end goal of the task and what does a successful completion look like.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000081_8e437873f8548c45d38f01c1d029bb86174c553f5c6b68707305b10e6ea2f81e.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000082_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Breaking Down T asks

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000083_850d36b55ebdafe7efc38a35466a26e369c132019b107e3c7f00cade38ecf8e6.png)

## Decomposing Tasks

- Complex tasks should be broken into smaller subtasks.
- Most of the time, tasks will be broken into sequential steps.
- Provide subtasks as numbered lists or bullet points.
- Each subtask could have its own prompt.
- Subtask chaining improves performance and reliability.
- For example, a customer chatbot. Respond to a customer request in two steps:
- i. Intent classification : identify the intent of the request.

ii. Response generation : based on the intent, respond appropriately.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000084_9518678044c14f6914912fd908bb539ba12041e40483509b06f7de61b229c055.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000085_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Intent Classification

## Prompt 1: Intent classification

## SYSTEM

You will be provided with customer service queries. Classify each query into a primary category and a secondary category. Provide your output in json format with the keys: primary and secondary.

Primary categories: Billing, Technical Support, Account Management, or General Inquiry.

Billing secondary categories:

- Unsubscribe or upgrade

- …

Technical Support secondary categories:

- Troubleshooting

- …

Account Management secondary categories:

- …

General Inquiry secondary categories:

- …

USER

I need to get my internet working again

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000086_0f45b1372940c66fc8f907ba965599b5f98a60e850160af6ca87a131a30a9af5.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000087_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Response

## Prompt 2: Response to troubleshooting request

- SYSTEM You will be provided with customer service inquiries that require trouble shooting in a technical support context. Help the user by: - Ask them to check that all cables to/from the router are connected. Note that it is common for cables to come loose over time. - If all cables are connected and the issue persists, ask them which router model they are using. - If the customer's issue persists after restarting the device and waiting 5 minutes, connect them to IT support by outputting {"IT support requested"}. - If the user starts asking questions that are unrelated to this topic  then confirm if they would like to end the current chat about trouble  shooting and classify their request according to the following scheme: &lt;insert primary/secondary classification scheme from above here&gt; USER I need to get my internet working again.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000088_07a8df745f4dca1712d1eb6f32a1bc0982a1e2b5f1ba2c4c241a411eacf12fd8.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000089_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Intent Classification: A Few Notes

- Why not decompose the prompt into one prompt for primary intent category and another for the secondary category ?
- The granularity each subtask should be depnds on each use case and the performance, cost, and latency restrictions.
- Models are getting better at understanding complex instructions, but they are still better at performing simple ones.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000090_e70c2fd464bedcc6f1abfdd1d39c5d98f6f9e384f3b523d77d62def740c5b3ac.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000091_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Benefits of Decomposition

- Monitoring intermediate results becomes easier.
- Debugging faulty steps is more manageable.
- Some steps can be parallelized to save time.
- Effort: it is easier to write simple prompts than complex ones.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000092_406279c6faaef7647fdd7d8b6ad5a1ae34e5e708100823f3b0a68c2de5d9545b.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000093_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Giving Models Time to Think

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000094_1d45935edf289f28015823695a0fabff0fd4892c4f105533408f90f5be3d2ffd.png)

GSM8K

SVAMP

MAWPS

60 H

40

20

solve rate (%)

solve rate (%)

100

## Chain-of-Thought (CoT) Prompting

- Chain-of-thought prompting asks models to reason step by step.
- It significantly improves reasoning and reduces hallucinations (Wei et al, 2022).

solve rate (%).

Figure 4: Chain-of-thought prompting enables

- Variants include 'think step by step' or ' explain your decision' .

et al. (2021) for MAWPS.

- Standard prompting

- Chain-of-thought prompting

Prior supervised best

LaMDA

GPT

PaLM

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000095_2b592da7cb86100cf01191e57d381e1ab8af13afb7b3a80f363fa2f189011e57.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000096_af62fca46e228e1c02aba60bd4c3913349ebff958962020ab82c2d1b383a0963.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000097_5adc48abb05b8186d8763ae2dc8ed1886433cf21b3b60965d314932fb637a741.png)

Standard Prompting

Model Input

## CoT Illustration

A: The answer is 11.

Q: The cafeteria had 23 apples. If they used 20 to make lunch and bought 6 more, how many apples

do they have?

Model Output

A: The answer is 27. X

Figure 1: Chain-of-thought prompting enables large language models to tackle complex arithmetic, commonsense, and symbolic reasoning tasks. Chain-of-thought reasoning processes are highlighted.

Chain-of-Thought Prompting

Model Input

Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 tennis balls. How many

tennis balls does he have now?

A: Roger started with 5 balls. 2 cans of 3 tennis balls

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000098_73c45b80d3d901452800805b68322b49274dec2c322f4577b49406573f063b49.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000099_1c7faa95de0cd60259b40760b77d43ce65066162e895235d6799bbf3db8a87b0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000100_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## How to Prompt for CoT (1/3)

## Basic prompt

- Include Think step by step in your prompts.
- Does not include guidance on how to think step-by-step. (Claude Docs)

## Role: User

```
Draft personalized emails to donors asking for contributions to this year's Care for Kids program. Program information: <program>{{PROGRAM_DETAILS}} </program> Donor information: <donor>{{DONOR_DETAILS}} </donor> Think step-by-step before you write the email.
```

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000101_e249479c3e601534b643518ae34985cf3c1e9c06b22a5dd2d3fbed3c31004d7a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000102_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## How to Prompt for CoT (2/3)

## Guided prompt

- Outline specific steps for the model to follow.
- Does not have a structure to simplify separating the answer from the thinking. (Claude Docs)

## Role: User

Draft personalized emails to donors asking for contributions to this year's Care for Kids program.

Program information: &lt;/program&gt;

Donor information: &lt;/donor&gt;

```
<program>{{PROGRAM_DETAILS}} <donor>{{DONOR_DETAILS}}
```

Think before you write the email. First, think through what messaging might appeal to this donor given their donation history and which campaigns they've supported in the past. Then, think through what aspects of the Care for Kids program would appeal to them, given their history. Finally, write the personalized donor email using your analysis.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000103_20d0a924851026e03b8fddbc68d0b3def98c6d5dfbab807142290f2740ff6e97.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000104_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## How to Prompt for CoT (3/3)

## Structured prompt

- Use XML tags like &lt;thinking&gt; and &lt;answer&gt; to separate reasoning from the final answer (Claude Docs).

## Role: User

```
Draft personalized emails to donors asking for contributions to this year's Care for Kids program. Program information: <program>{{PROGRAM_DETAILS}} </program> Donor information: <donor>{{DONOR_DETAILS}} </donor> their donation history and which campaigns they've supported in the past. Then, think through what aspects of the Care for Kids
```

Think before you write the email in &lt;thinking&gt; tags. First, think through what messaging might appeal to this donor given program would appeal to them, given their history. Finally, write the personalized donor email in &lt;email&gt; tags, using your analysis.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000105_4c929ec0cfb0b682bef9cb68406ca97a4670dadcdaf352889a247daf7c7fb780.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000106_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Why Use CoT Prompting ?

- Accuracy: Stepping through problems reduces errors, especially in math, logic, analysis, or generally complex tasks.
- Coherence: Structured thinking leads to more cohesive, well-organized responses.
- Debugging: Observing the model's process helps you pinpoint where prompts are unclear. (Claude Docs)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000107_8bcfde237c8f58462a9354bd106083a4f74b95ac5c741fc2ffb40d7fa923789c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000108_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Why Not To Use CoT Prompting ?

- Cost and latency because of increased output length.
- Not all tasks require it: performance, latency, and costs should always be balanced(Claude Docs).

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000109_8598909b2e2c039a5f7e3630e7c3f7600c1c333ebf1304d37ac129681f547bd1.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000110_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Table 5-4. A few CoT prompt variations to the same original query. The CoT additions are in bold.

## CoT Prompt Variations

Zero-shot CoT

Zero-shot CoT

Zero-shot CoT

One-shot CoT

(one example is included in the

prompt)

Which animal is faster: cats or dogs? Explain your rationale before giving an answer. ich animal is faster: cats or dogs? Follow these steps to find an answer:

1. Determine the speed of the fastest dog breed.

3. Determine which one is faster.

Which animal is faster: sharks or dolphins?

3. Conclusion: sharks are faster.

Which animal is faster: cats or dogs?

| 2. Determine the speed of the fastest cat breed.                                                                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1. The fastest shark breed is the shortfin mako shark, which can reach speeds around 74 km/h. 2. The fastest dolphin breed is the common dolphin, which can reach speeds around 60 km/h. |

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000111_43b6fd79c9a794361faf9327f3f0bc3711050193ba9cfb38d2e92c361950663a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000112_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Self-Critique Prompting (1/2)

- Models can be instructed to review and critique their own outputs.
- This helps identify errors and improve reliability.
- However, it increases latency and costs.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000113_8fea86d45504bffa91283b4d8edae9618e355110f6512632e97e4fa0d4a18b4e.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000114_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Self-Critique Promptin (2/2)

## Some techniques include:

- Self-Calibration
- Self-Refine
- Reversing Co T (RCo T)
- Self-Verification
- Chain-of-Verification (CoVe)
- Cumulative Reasoning (CR)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000115_97efafaceda8c45bbdc1e72bb3f00d12292a80e82cc5c48dc95877759e740c2e.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000116_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Self-Calibration

Self-Calibration is a two-step process:

- 1 . Get an initial answer.
- 2 . Ask the model whether the proposed answer is true or false.

```
Question: Who was the first president of the United States? Here are some brainstormed ideas: Thomas Jefferson John Adams George Washington Possible Answer: George Washington Is the possible answer: (A) True (B) False The possible answer is: 60
```

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000117_1717144e7c114cfd751ad7e66e9ae9b23e3b03aa737475f932b0fa9f07616c2d.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000118_0b0de1d4c3be17815dbe6866f38196450e4f002853ae2528369baad975c2dc99.png)

52B Self-Evaluation on Five Sampling-Based Tasks (Equally Weighted)

Correct Samples

Incorrect Samples

## Self-Calibration Works

0.03 -

0.02-

0.01 -

0.00

0.0

,0.5

0.

.4

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000119_2760bb511d713f378ed2f030086bb498ca8c576658f19d5c2746c53d60340210.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000120_38e6560dc0fb1e31bf08af026c799d56a5a1b9dfc2e4a934ee1692cb39e2a9d3.png)

0.2

0.4

P(True) of Sampled Answers

Figure 1 (left) We show the overall ability of a 52B language model to evaluate its own proposed answers

(sampled at unit temperature) to questions from TriviaQA, Lambada, Arithmetic, GSM8K, and Codex Hu- manEval. We have weighted the overall contribution from each of these five datasets equally. We evaluate

20-shot using the method of section 4, where we show the model several of its own samples and then ask for on each sampling task when only including questions where a randomly sampled (unit temperature) response

the probability P(True) that a specific sample is correct. (right) We show the improvement in the accuracy achieved P(True) &gt; 0.5.

0.8 -

Accuracy Improvement Conditioning on P(True) &gt; 0.5

GSM8k

GSM8k P(True) &gt; 0.5

Arithmetic

Arithmetic P(True) &gt; 0.5

TriviaQA

TriviaQA P(True) &gt; 0.5

Lambada

Lambada P(True) &gt; 0.5

Codex

Codex P(True) &gt; 0.5

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000121_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Self-Calibration Limitations

- Authors focus on pre-trained language models, but exclude fine-tuned models.
- Technique may not work well for fine-tuned models.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000122_4190c5ee60f4b02111bed551cddc8e34263f953d141b535e88e1bc8267016ead.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000123_69537736864dbcec0170d6dc6c1aca3471004bc22d74383248c7dbf015a08a29.png)

Input

## Self-Refine (1/2)

## Involves three steps:

same model M to get feedback (I). The feedback is passed back to M, which refines the previously

- 1 . Initial output: Prompt the model to obtain the initial output.
- 2 . Feedback: Use the prompt and initial output to ask the model fore feedback.
- 3 . Refinement: Pass the feedback to the model to get the final output.

Refine

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000124_03cccc1061779895aa4aa98e74ab431e95118c0c8bbb26ebdd85dddd7ec0dbb2.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000125_42b8a97e2dd3f83822e2f522e717bf6ad21bc7d1c4b59cc835e6e2170b950d6e.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000126_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

(a) Dialogue: x, yt

(b) FEEDBACK fb

User: I am interested

Engaging: Provides no

## Self-Refine (2/2)

Response: I'm sure

User understanding: Lacks it's a great way to

socialize, stay active

(d) Code optimization: x, yt

Generate sum of 1, ..., N

def sum (n) :

res = 0

for i in range (n+1):

res += i return res

```
Figure 2: Examples of SELF-REFINE: an initial output generated by the base LLM and then passed back to the same LLM to receive feedback to the same LLM to refine the output . The top row illustrates this for dialog generation where an initial dialogue response can be transformed into a more engaging one that also understands the user by applying feedback. The bottom row illustrates this for code optimization where the code is made more efficient by applying feedback.
```

(Madaan et al, 2023)

understanding of user's needs and state of mind.

(e) FEEDBACK fb

This code is slow as it uses brute force.

A better approach is to use the formula

... (n(n+1))/2.

(c) REFINE Yt+1

Response (refined): That's great to hear (...) ! It's

a fun sport requiring quick reflexes and good

hand-eye coordination.

Have you played before, or are you looking to learn?

(f) REFINE Уt+1

Code (refined)

def sum\_faster (n) : return (n*(n+1))//2

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000127_190cee0547b9f4a4ba42aa5b2cb2bf97b4b6997e04d65ca6ea2233ecfc0609d8.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000128_d14631f5c713bc400396877fb73e94f1dd492741c4970cf5d961eb45c78fbf23.png)

Stop Condition

The code is easy to read and understand. There are no more

improvements to make.

Iterate (Prompt)

I will give you a python function, your job is to give easy to follow feedbacks

on improving its readability, quality, and runtime of the code. If there are no

improvements to make, say so.

Here is the code:

{{Refined Response)}

4. Iterate, asking for further refinements, until a stop condition is met.

1. Prompt the model to get the initial response.

Prompt

Initial Response def find\_greatest(num1, num2, num3):

## Self-Refine Example

else:

return num3

Refined Response def find\_greatest(num1, num2, num3):

# Check if num1 is the greatest if num1 &gt;= num2 and num1 &gt;= num3:

# Check if num2 is the greatest elif num2&gt;= num and num&gt;= num:

# If neither num1 nor num2 is the

# greatest, then num3 must be the elif num3 &gt;= num1 and num3 &gt;= num2:

Feedback Prompt

I will give you a python function, your job is to give easy to follow feedbacks

on improving its readability, quality, and runtime of the code. If there are no

improvements to make, say so.

Here is the code:

{finitial response)}

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000129_0738190af462888df15d336c4ad75e82bd5e55515b0d4b194942ed2e409dcc11.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000130_1160dc730827fa9b2b470db0794a04c12aa6812a7770e14ea5c3e90245efa88a.png)

2. Use model to provide feedback on its output.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000131_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Self-Refine Limitations

- Base model needs to be capable of following instructions.
- Can be used with malicious intent to steer a model into generating toxic/harmful text.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000132_b643fd1c8d3b1b505fc3772de8064f5196b504131a5d631dbe3eb91f06990421.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000133_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Iterating and T ools

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000134_f4e9a88bf4bc54caa90cafdf3b4211cf77642724c8fb00a366de823085f10c3b.png)

## Iterating on Prompts

- Manual prompt construction is time-consuming and error-prone.
- The optimal prompt is ellusive and can change over time.
- Prompt engineering requires trial and error.
- Each model has quirks that must be discovered experimentally.
- Prompts should be versioned, tracked, and systematically tested.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000135_93c795cf0a79e6cb4b032660c2f7b6fe62cea36a283518bcc89e4478f7b73f26.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000136_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Prompt Engineering T ools (1/2)

## Prompt optimization

- [DSPy.](https://dspy.ai/)
- [PromptBreeder.](https://github.com/vaughanlove/PromptBreeder)

## Guiding models to structured outputs

- [Guidance.](https://github.com/guidance-ai/guidance)
- [Outlines.](https://dottxt-ai.github.io/outlines/latest/)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000137_0a63b8a0c999ced420222247ef74b8be52002d8723f5dde51b95b68e0990ece7.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000138_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Prompt Engineering T ools (2/2)

- AI models themselves can generate and refine prompts.
- Automated tools must be monitored to avoid runaway costs.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000139_edb6d6eb6ca6ad6c9c46beaf3746ce02ba4b03f14c9a6bb2226728698d1df524.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000140_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Organizing Prompts

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000141_eccf82329caa8d43a3fb0bc7d4bd5face3cca3a2f9ca4546ea1a3442f18d8b40.png)

## Versioning Prompts

- Prompts should be separated from code for readability and reuse.
- They can be organized into catalogs with metadata.
- Prompt catalogs allow versioning and tracking dependencies.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000142_cbbbcf1740855b4600e3cee998868d5b90e7eb3d662b061a856b4a018f461456.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000143_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

file: prompts.py

GPT40\_ENTITY\_EXTRACTION\_PROMPT = [YOUR PROMPT]

file: application.py

## Separate Prompts from Code

model=model\_name, messages=L

Separating prompts from code is a good practice. Its advantages include:

- Reusability : Many applications can reuse the same prompt or code.
- Testing : Code and prompts can be tested separately.
- Readability : Both, prompts and code, are easier to read separately.
- Collaboration : SME can collaborate without the distraction of code.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000144_7669bf275785c8e0b8f22f26e4306196283340ad763bb79455b9bcc5b5e72dda.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000145_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Defensive Prompt Engineering

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000146_9ff4491a10215d1ccddd3154783def3483581cba7c4f59d7d2b35a00623eb3f8.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000147_6a56600e1bac993d116a08f4c55acfaa3fffc6185bb2655e67a065d294f3abc4.png)

## Prompt Attacks

- Models are vulnerable to prompt extraction, jailbreaking, and information extraction.
- Attackers can exploit weaknesses to cause data leaks, misinformation, or brand damage.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000148_d9d695127c930349cc86136d7abdf6c6ba5195c8f146556cb52339ce911e46a0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000149_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Reverse Prompt Engineering

- Attackers attempt to reconstruct system prompts by tricking models.
- Extracted prompts may be hallucinated, making verification difficult.
- Proprietary prompts can be liabilities if not secured.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000150_c01701876a723e828c49f703d5c88daaad6c0ce1242ab58709f5e370cc5f6b53.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000151_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Jailbreaking and Prompt Injection

- Jailbreaking subverts safety mechanisms.
- Prompt injection adds malicious instructions to legitimate queries.
- Both can cause unauthorized actions, misinformation, or harmful outputs.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000152_f60559776be535a571c7c2ecbefb2d7f66aafbf84aa816feee9e41d0323b2e01.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000153_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Information Extraction

- Attackers can extract private data or copyrighted content from models.
- Training data leakage is possible through crafted prompts.
- Larger models are more vulnerable due to memorization.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000154_12107557e9d16af1837d23d926ec71b41e1a0177975f7d58b028e67690c5eb03.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000155_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Defensive Measures

- Prompts can explicitly forbid certain outputs.
- System-level defenses include sandboxing, human approvals, and topic filtering.
- Guardrails on inputs and outputs help detect and block unsafe content.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000156_872e86a869fcb712d0692432dfe5d4070c75c3bf0f8969d9e783e7be26d1385c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000157_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Chapter Summary

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000158_d54bc51f305007ff87590c4dec61b42f68f5f0b24d99f1fee799eb4c13f2fbb8.png)

## Key T akeaways

- Prompt engineering is powerful but requires rigor and systematic evaluation.
- Effective prompts need clarity, examples, context, and careful structuring.
- Task decomposition, chain-of-thought, and iteration improve reliability.
- Tools and catalogs help scale prompt engineering but must be managed carefully.
- Defensive strategies are essential to protect against prompt attacks and misuse.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000159_16c90073c72d9adf20877143534742d7e27b66b559096438243e495ff9c107e3.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000160_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## References

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000161_f655a352b0e1c2bf822984e1c9d2f527749f0fe750dd8f015e273e853829fb70.png)

- Huyen, Chip. Designing machine learning systems. O'Reilly Media, Inc., 2022
- Kadavath, S. et al. Language Models (Mostly) Know What They Know. arXiv:2207.05221, 2022.
- Liu, Nelson F. et al. "Lost in the middle: How language models use long contexts." arXiv:2307.03172, 2023.
- Madaan, Aman, et al. "Self-refine: Iterative refinement with self-feedback." Advances in Neural Information Processing Systems 36 (2023): 46534-46594. arXiv:2303.17651.
- Wei, Jason et al. "Chain-of-thought prompting elicits reasoning in large language models." Advances in neural information processing systems 35 (2022): 24824-24837. arXiv:2201.11903
- Yun, Yennie. Evaluating long context large language models. artfish.ai, 2025.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000162_ef1d09c4fa95c7ae25896b7f5ab14df0019aee2ea8743e156ddad4a18c7a322a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/04_prompt_engineering_artifacts/image_000163_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)