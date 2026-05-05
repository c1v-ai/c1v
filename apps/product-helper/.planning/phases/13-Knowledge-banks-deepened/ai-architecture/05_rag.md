## Deploying AI

## Retrieval Augmented Generation (RAG)

$ echo "Data Sciences Institute"

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000000_ea599e14d4588c33921df8159984cb8ff5dd32f82a2ce9f56bb94a5c8d07e7ce.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000001_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Introduction

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000002_49560bf1e9ba29234af061f7636227a44526b692eb8a88cfe3388c9019a04ecd.png)

Agenda

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000003_818130d666454ece767016a874b4863e60c0d4931ba94e31454818182b3d8eee.png)

## Agenda

- RAG Architecture
- Retrieval Algorithms and optimization

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000004_41e2b137372a24a3c6f88f1dab37bdc26e0b9a2b558a63b1ec84a17ac5bdc0d9.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000005_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Introduction

- To solve a task, a model needs both instructions and the necessary information.
- Models are more likely to hallucinate when missing context.
- Context differs per query, while instructions are generally fixed.
- Two dominant context construction patterns are retrieval-augmented generation (RAG) and agents.
- RAG retrieves information from external data sources.
- Agents use external tools, enabling broader capabilities including world interaction.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000006_c0b91c811a6afd26c37016fa3674ed522e2ddc469cca2dc5102f25ca47e05ae0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000007_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Why RAG and Agents Matter

- RAG enhances a model's generation by retrieving relevant information.
- Agents expand capabilities by leveraging tools like search APIs or code execution.
- Both patterns address models' weaknesses and extend their utility.
- These approaches have produced impressive demos and practical applications.
- They are widely seen as the future of AI-powered systems.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000008_7f260593615f05ecbf1d0ea629584cf6efdb6cf7187fdb3e6ee30db54951178b.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000009_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Retrieval-Augmented Generation (RAG)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000010_7f260593615f05ecbf1d0ea629584cf6efdb6cf7187fdb3e6ee30db54951178b.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000011_1849e3a3014cbf94812d3cd916acc6390b3413a551263942b8baf53c3f432756.png)

## RAG Overview

- RAG retrieves relevant information from external memory sources to supplement model outputs.
- External sources can include internal databases, prior conversations, or the web.
- This technique was first formalized in research around open-domain question answering.
- RAG helps models generate more accurate and less hallucinated answers.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000012_7f260593615f05ecbf1d0ea629584cf6efdb6cf7187fdb3e6ee30db54951178b.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000013_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Why RAG Exists

- Foundation models have limited context length.
- Users produce more data than can fit in context windows.
- Long contexts are costly and may reduce model efficiency.
- RAG selectively retrieves relevant chunks, keeping inputs concise and focused.
- Retrieval acts as context construction, similar to feature engineering in ML.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000014_7f260593615f05ecbf1d0ea629584cf6efdb6cf7187fdb3e6ee30db54951178b.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000015_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## RAG Architecture

- A RAG system consists of two components: a retriever and a generator.
- The retriever indexes and retrieves relevant chunks from external memory.
- The generator produces responses conditioned on retrieved data.
- These two parts may be trained separately or jointly.
- System performance depends heavily on retriever quality.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000016_c48ac22ac31bcaa80779ea43be65996d36ad8901b1923854dc41e5a3b840ee22.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000017_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Retrieval Algorithms

- Retrieval has a century-long history in information systems.
- Algorithms differ in how they score document relevance.
- Two broad categories are term-based retrieval and embedding-based retrieval.
- Retrieval solutions also include hybrid approaches that combine both.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000018_0ba5343431d7968e820b1994cd345a20ed34b9ea436b49196ec214085777aa11.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000019_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Term-Based Retrieval

- Term-based methods focus on lexical matches, such as keyword overlaps.
- Popular algorithms include TF-IDF and BM25.
- Term frequency measures how often a term appears in a document.
- Inverse document frequency downweights common terms.
- BM25 improves TF-IDF by adjusting for document length.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000020_7cf1b97244c1893d9aae5d3467328740e53fd2deafe624a33d65098b02fe2e07.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000021_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Embedding-Based Retrieval

- Embedding-based methods retrieve by semantic similarity rather than exact terms.
- Queries and documents are converted into embeddings.
- The retriever finds the nearest embeddings in vector space.
- Requires a vector database to efficiently store and search embeddings.
- Common libraries include FAISS, ScaNN, Annoy, and Hnswlib.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000022_7751f428e2d4c67633438d3a01d7331419ac55ae754b091a51cd1a3f3d241b92.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000023_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Sparse vs. Dense Retrieval

- Sparse retrieval methods represent data with mostly zero values.
- Dense retrieval uses embeddings with nonzero values across dimensions.
- SPLADE is an example of sparse embedding retrieval.
- Dense methods capture semantics better but can be costlier to compute.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000024_2df0e583f81fa342abb7b021227bb6a2559e40c8a1046a971684b2fa506b3ac2.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000025_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Comparing Retrieval Approaches

- Term-based retrieval is fast, simple, and inexpensive.
- Embedding-based retrieval enables natural queries but requires embeddings and vector search.
- Hybrid approaches combine both, often using term-based retrieval first and semantic reranking later.
- The choice depends on trade-offs between speed, cost, and accuracy.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000026_8f13f150e971b529d197553526bb0b7e40956aeb7c808dbf0cee33f560cd7036.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000027_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Evaluating Retrieval

- Key metrics include context precision and recall.
- Precision measures what percentage of retrieved results are relevant.
- Recall measures what percentage of relevant results are retrieved.
- Additional ranking metrics include NDCG, MAP, and MRR.
- Ultimately, retrieval is valuable only if it improves generative outputs.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000028_c6f937a90401790b436e8478f218be032065fd35b7b5228845f225656234c41f.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000029_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Retrieval Optimization

- Several tactics can optimize retrieval performance.

- Chunking : splitting documents into manageable parts.

- Reranking : refining the ranking of retrieved documents.

- Query rewriting : clarifying ambiguous queries.

- Contextual retrieval : enriching documents with metadata or context.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000030_088bae4d806ddf86e2dbc728020fc025043027efe5783a69a3694d8f9a61d15c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000031_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Chunking Strategies

- Documents may be split by characters, words, sentences, or paragraphs.
- Recursive chunking reduces arbitrary breaks.
- Overlaps prevent loss of key boundary information.
- Chunk size affects both coverage and efficiency.
- There is no universal best practice; experimentation is necessary.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000032_c48ac22ac31bcaa80779ea43be65996d36ad8901b1923854dc41e5a3b840ee22.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000033_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Query Rewriting

- Queries are rewritten to make intent explicit and unambiguous.
- Ambiguous follow-ups, such as 'How about Emily ? ' ,   r equir e contextual rewriting.
- AI models can automate query rewriting with carefully designed prompts.
- Rewriting may involve identity resolution or knowledge lookup.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000034_d5e7ffa4b3c01080f1492d19976b780dcd2810e2958e27f04c51ddb3659327a4.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000035_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Contextual Retrieval

- Chunks can be augmented with metadata like tags or entities.
- Additional questions may be linked to articles to aid retrieval.
- Document titles and summaries can help situate chunks.
- Generated context improves retrievability without altering core content.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000036_73f238e07853eb7acf36e18105cdfbea7e284221faee6055ea032bab5b02c037.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000037_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## RAG Beyond Text

- RAG can operate on multimodal and structured data.
- Multimodal RAG augments queries with images, audio, or video.
- Tabular RAG retrieves and executes queries on structured datasets.
- SQL executors are often used to query relational data.
- These variations extend RAG beyond text-only use cases.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000038_4a3373e5a17f9efb9164a426a67e7026fbab1fa70d75b9f06e360e93af495ca8.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000039_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000040_8486e163ee16415a25e02565e393dff0a7ef91e8961555852b330619548f63c0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000041_f92befb8b5491b578318076fb7e2da72e1b3b8a50af741895aabc4baab7078a2.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000042_958726896aa95f9cdab85be1c3f8207d7f7b5c2c9f85215f47612dc178f644f5.png)

## Key T akeaways

- RAG retrieves external knowledge to improve model responses.
- Retrieval methods include term-based, embedding-based, and hybrid approaches.
- Optimizations such as chunking and reranking boost retrieval quality.
- RAG extends beyond text to multimodal and tabular contexts.
- Agents integrate reasoning, planning, and tool use to act in environments.
- Tools extend agent capabilities in perception, reasoning, and action.
- Evaluating agents requires balancing accuracy, cost, latency, and safety.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000043_653c9613201c9355a611ab3a71d910ffc66469fd9b3e838e9ffc4490f7654367.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000044_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## References

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000045_2ca111d0bc469d96c35998bda0842d8a106e692ed45d6318736fca17e54929d6.png)

## References

- Huyen, Chip. Designing machine learning systems. O'Reilly Media, Inc., 2022

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000046_49563fa9bfdefc20a0e60ad9b046e076a7a8c9dc24464e6176c136d52345f4f6.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/05_rag_artifacts/image_000047_69537736864dbcec0170d6dc6c1aca3471004bc22d74383248c7dbf015a08a29.png)