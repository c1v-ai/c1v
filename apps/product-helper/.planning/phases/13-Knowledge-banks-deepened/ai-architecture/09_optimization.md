## Deploying AI

## Optimization and System Design

$ echo "Data Sciences Institute"

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000000_ea599e14d4588c33921df8159984cb8ff5dd32f82a2ce9f56bb94a5c8d07e7ce.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000001_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Introduction

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000002_49560bf1e9ba29234af061f7636227a44526b692eb8a88cfe3388c9019a04ecd.png)

Agenda

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000003_818130d666454ece767016a874b4863e60c0d4931ba94e31454818182b3d8eee.png)

## Agenda

- Inference optimization
- AI engineering architecture
- User feedback

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000004_41e2b137372a24a3c6f88f1dab37bdc26e0b9a2b558a63b1ec84a17ac5bdc0d9.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000005_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Software Products with Embedded AI

AI models have become generally available through general-purpose software:

- Generate images, illustrations and video
- Generate and rewrite text
- Summarize documents and calls
- Gather data
- Review and Write Code

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000006_c0b91c811a6afd26c37016fa3674ed522e2ddc469cca2dc5102f25ca47e05ae0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000007_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Initial Stage: Interaction through LLMs Embedded in General Purpose Software

- The simplest form of implementation is to acquire software with embedded AI (MS Copilot, ChatGPT, etc).
- Simple mode of operation.
- Low barriers to entry diminish the competitive advantage.
- Guidelines and policies have limited effect over risk exposure.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000008_d4f848ba493282afbbcef016216bbdc07abb8d52ffcae27e1253ac44e96a451f.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000009_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Initial Stage

·

Model API

Generation

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000010_c3328768ac363ae3b1138063a3f21864376932eeecabd18ec60aec3ada80ef46.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000011_7f260593615f05ecbf1d0ea629584cf6efdb6cf7187fdb3e6ee30db54951178b.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000012_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Challenges in Building Production-Level Applications with LLM (1/2)

## Using LLMs:

- It is easy to create a cool prototype, but difficult to create production-ready software.
- LLM limitations are exacerbated:
- Lack of engineering rigor in prompt engineering.
- Natural language can be ambiguous.
- It is a newly created field.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000013_7f260593615f05ecbf1d0ea629584cf6efdb6cf7187fdb3e6ee30db54951178b.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000014_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Challenges in Building Production-Level Applications with LLM (2/2)

- Ambiguity occurs in the way prompts are written (by human) and how they are interpreted (by LLM). For example:
- Ambiguous output format: downstream applications expect outputs in a certain format, which LLMs do not necessarily provide consistently.
- Inconsistency in user experience: LLMs are stochastic, there is no guarantee that the model will provide the same output given the same input every time.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000015_eae955fd63dffec5501b24ae1f5f2d9c226d0d0c4797f83d5ca115b2b342cb58.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000016_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Areas of Enhancement

- Enhance context input into the model: give the model access to (external) data sources and tools for information gathering.
- Set up guardrails: protect systems and users.
- Add model router and gateway: support complex pipelines and security.
- Add cache: optimize for latency and cost.
- Add complex logic and write actions to maximize capabilities.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000017_a3345165474fa667dd69c2de685df29b83c470437a2e5e8cb71c5249da9772a6.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000018_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Performance-Driven Development

Although FMs are a recent evolution in modelling, the principles of building AI enterprise applications remain the same:

- Map business metrics to AI metrics.
- Systematic experimentation.
- Experiment with different prompts (equivalent to hyperparameter tuning).
- Optimize for performance, latency, and cost.
- Set up feedback loops to iteratively improve our applications.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000019_7a66973b188fcdd95f17c7baf8158e3c1309719adeaff64484b8398ff6a5f1f0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000020_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Retrieval-Augmented Generation (RAG)

- Similar to feature engineering in ML, RAG augments each query with necessary information.
- Context construction: gather the relevant information for the query.
- The more context provided to the model, the less it needs to rely on its training.
- In-context learning is a form of continual learning. It delays a model from being outdated by continually incorporating new information.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000021_7cf1b97244c1893d9aae5d3467328740e53fd2deafe624a33d65098b02fe2e07.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000022_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Query

Response

External memory

Documents, tables, chat history, etc.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000023_cc8c007b4784d37c76ab428e657cafdce28358213c464d5f4fc265f22379c5cb.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000024_17564ded0b050609d5d07581e4c9fc12da2ecc3ee1f5a8a742308caa6b7e3a3f.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000025_ebff7d9ea3490fb18866ac1785bd6b78a53b6e5ee15979ad0fab1a6768b8157e.png)

## Add Guardrails (1/3)

## Input guardrails

- The risk of exposing sensitive or private data to external vendors via external model APIs arises.
- Some guardrails include obfuscating personal information (ID numbers, phone, bank accounts, etc.), human faces, specific labels, keywords, and phrases that identify sensitive information.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000026_0939f2aa8093fb200416bec917801bd9b8193e4ec1384d51faa3bdc059b5b629.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000027_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Add Guardrails (2/3)

## Model jailbreaking:

- Preclude the model from executing queries that can be harmful.

- Ex.: no SQL queries.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000028_d943b04c8e20f775b4a467dfd04be79be498f62a1c7cd5172c1c84bbb574f010.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000029_69537736864dbcec0170d6dc6c1aca3471004bc22d74383248c7dbf015a08a29.png)

## Add Guardrails (3/3)

## Output guardrails

- Evaluate the quality of each generation, including empty responses, malformatted responses, toxic responses, factual inconsistent responses, responses that contain sensitive information, and brand-risk responses.
- Specify the policy to deal with different failure modes.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000030_d5e7ffa4b3c01080f1492d19976b780dcd2810e2958e27f04c51ddb3659327a4.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000031_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Query

Context construction e.g. RAG, agent,

query rewriting e.g. PIl redaction

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000032_842d7f711896d46c4ddc5be788bb303ae59f9db0e618cb90d954d28dfb38d6f4.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000033_a129ade9e9d7c3f65455ff29181abebbc817ebb325f0b20071585b0ae25ae31b.png)

·

Input guardrails

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000034_eb2e244802fa5b9a881ac24e5963b8b326839ef62edaa2573fd23686c1c9c649.png)

## Add Model Router and Gateway

- A model router selects the best suitable model for the job:
- An intent classifier predicts what the user is trying to do.
- The right model is chosen for the task based on the predicted intent.
- An intent classifier can also preclude out-of-scope conversations.
- A model gateway allows the system to interface with different models in a unified and secure manner.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000035_cc40025b23bb94f9e748d57a73234db65976c7006c485986ce3562d691bb00b7.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000036_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Customer support chatbot

Product review summarization

Text-to-SQL

·..

Self-hosted models

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000037_fa2694769c5562943e35f10d89646d304ac32506251533fe1f640b53f8f315d3.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000038_ecf77d6024bd8b4e85e93d6a8dae0cf713b006f50275421ba0aac8e78be3bec9.png)

Unified API

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000039_ebff7d9ea3490fb18866ac1785bd6b78a53b6e5ee15979ad0fab1a6768b8157e.png)

## Caching

- Caching can significantly reduce latency and cost.
- Prompt cache:
- Store overlapping segments for reuse.
- Application with long system prompts or that involve long documents.
- Exact cache:
- Cache stores processed items for reuse later.
- Can be used to reduce vector search in embedding-based retrieval.
- Semantic cache:
- Determines semantic similarity between queries.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000040_93ed72c333fbb3b99b2258ea5be6efb3563c6d5f1ec277c74e7f199e1843f6a7.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000041_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Cached response

Query

·

Context construction e.g. RAG, agent,

query rewriting

Cache

Model gateway

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000042_a42de350fc99e698802df2cefb2162304621573e0067c75aa29f1da99e8c1f82.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000043_098dc35339d244d9d3109db9824ecce1e0238debb876d8ad7d442e5d1bde3387.png)

·

Input guardrails e.g. PIl redaction

Model catalog, access

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000044_eb2e244802fa5b9a881ac24e5963b8b326839ef62edaa2573fd23686c1c9c649.png)

## References

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000045_8486e163ee16415a25e02565e393dff0a7ef91e8961555852b330619548f63c0.png)

## References

- Huyen, Chip. Designing machine learning systems. O'Reilly Media, Inc., 2022

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000046_178367d07cf3f709859011234aba5ec4d003ff328128eeb992820fcef29d8126.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/09_optimization_artifacts/image_000047_69537736864dbcec0170d6dc6c1aca3471004bc22d74383248c7dbf015a08a29.png)