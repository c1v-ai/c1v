## Deploying AI

## Evaluation Methodology &amp; System Evaluation

$ echo "Data Sciences Institute"

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000000_ea599e14d4588c33921df8159984cb8ff5dd32f82a2ce9f56bb94a5c8d07e7ce.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000001_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Introduction

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000002_49560bf1e9ba29234af061f7636227a44526b692eb8a88cfe3388c9019a04ecd.png)

## Agenda

- Performance metrics
- Exact evaluation and using AI as a judge
- Designing an evaluation pipeline

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000003_a6c4eb5bab69c46fac392a452b03a57a01536c7cbf4d49229c172426aa4fbdf1.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000004_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

O'REILLY®

## AI Engineering

We will be covering Chapters 3 and 4 of AI Engineering, by Chip Huyen.

Chip Huyen

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000005_5f9155c3a7aa579acca02d13c54168d26c6e4b372b1124cbd860bc42b99f74f6.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000006_a6c4eb5bab69c46fac392a452b03a57a01536c7cbf4d49229c172426aa4fbdf1.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000007_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Performance Metrics

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000008_c0b91c811a6afd26c37016fa3674ed522e2ddc469cca2dc5102f25ca47e05ae0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000009_70c7e1bb8b5c7c9c61bbe0bc4f66efaa716e47dae8d108934bf95412bcb9bf08.png)

## Why Evaluation Matters

- AI use brings risk of catastrophic failures:
- Lawyers using AI, submit documents containing hallucinations (HAI Stanford, lawnext.com, clio.com, CBC, Reuters).
- Air Canada found liable for misleading information provided by its chatbot (CBC).
- Chatbot encouraging self-harm (NBC).
- Evaluation is the biggest hurdle to adoption.
- Evaluation must be considered at the system level.
- To mitigate risks, first identify the places where the system is likely to fail and design evaluations around them.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000010_7f260593615f05ecbf1d0ea629584cf6efdb6cf7187fdb3e6ee30db54951178b.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000011_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

MIT Al Risk Repository - Domain Taxonomy of Al risks

Domain / Subdomain

## AI Risks

1.2 Exposure to toxic content

1.3 Unequal performance across groups

2 Privacy &amp; Security

2.1 Compromise of privacy by obtaining, leaking or correctly inferring sensitive information

2.2 Al system security vulnerabilities and attacks

3 Misinformation

3.1 False or misleading information

3.2 Pollution of information ecosystem and loss of consensus reality

4 Malicious actors &amp; Misuse

4.1 Disinformation, surveillance, and influence at scale

4.2 Cyberattacks, weapon development or use, and mass harm

4.3 Fraud, scams, and targeted manipulation

Domain / Subdomain

5

Human-Computer Interaction

5.1 Overreliance and unsafe use

5.2 Loss of human agency and autonomy

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000012_02471655d3e80cf769066ca7c4744605c082f4b75315de3783e1359a192a68bc.png)

(Slattery et al, 2024)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000013_6c2b76237d4fbbe9dcb3acba18b861b241cad379570cd0c99c7aa0b699c18de7.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000014_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Challenges of Evaluating Foundation Models (1/2)

- As AI systems become more capable, it is more difficult to evaluate them.
- Open-ended nature of Foundation Models(FM) undermines the Machine Learning (ML) approach of comparing against a ground truth.
- Black-box models: model providers do not expose model details or app developers are not experts in FM.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000015_eae955fd63dffec5501b24ae1f5f2d9c226d0d0c4797f83d5ca115b2b342cb58.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000016_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Challenges of Evaluating Foundation Models (2/2)

- Benchmarks saturate quickly: a benchmark becomes saturated for a model when it achieves the perfrect score.
- GLUE (2018) → SuperGLUE (2019)
- NaturalInstructions (2021) → SuperNaturalInstructions (2022)
- MMLU (2020) → MMLU-Pro (2024)
- Expanded scope: we want to evaluate not just performance on known tasks, but also discovery and performance of new tasks.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000017_eae955fd63dffec5501b24ae1f5f2d9c226d0d0c4797f83d5ca115b2b342cb58.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000018_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

Number of papers

35

30

## Evaluation Landscape

20

15

10

0

→ Number of papers

- There appears to be an exponential growth of papers and repos on evaluation.
- There is increased interest in evaluation, but investment still lags behind model training and orchestration. 2023.05
- Many practictioners still rely on eyeballing or ad hoc prompts .
- We need systematic evaluation pipelines.
- Image: (Chang et al, 2023)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000019_a7b892baeef17a4577530bd98a7812c273f2c0b730c0e251a5d01dbc7966b57c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000020_7669bf275785c8e0b8f22f26e4306196283340ad763bb79455b9bcc5b5e72dda.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000021_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Language Modeling Metrics

- Most auto-regressive models are trained using entropy or perplexity.
- cross entropy, perplexity, Bits-Per-Character (BPC) and Bits-Per-Byte (BPB) are related metrics that can be applied beyond language modelling, they work for any model that generates sequences of tokens.
- In short, a language model generates the distribution of the data. The better this model learns, the better it is at predicting what comes next in the training data and the lower its cross entropy.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000022_43b6fd79c9a794361faf9327f3f0bc3711050193ba9cfb38d2e92c361950663a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000023_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Entropy

1

2

1

3

2

4

- Entropy measures how much information, on average, each token carries. Intuitively, entropy measures how difficult it is to predict what comes next in a language.
- Higher entropy indicates more information per token and more bits are required to represent the token.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000024_0b09a73a08b8d2577bdcaae737c459fa7724ca5bd5e16b1e7edc7d32d4aec776.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000025_d5e7ffa4b3c01080f1492d19976b780dcd2810e2958e27f04c51ddb3659327a4.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000026_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Cross Entropy

- Cross Entropy on a dataset measures how difficult it is for the language model to predict what comes next in the dataset.
- Cross Entropy depends on:
- The training data's predictability, measured by the data's entropy.
- How the distribution captured by the language model diverges from the true distribution of the training data.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000027_ed1566e14f9cb66740b51c8ceee3186f34a102ac4cef02bae33cf60785498974.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000028_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Entropy and Cross Entropy

## Notation

- Entropy and cross entropy are denoted H .
- Training data has distribution P .
- Q is the distribution learned by the model.

## Therefore

- Training data's entropy is H(P) .
- Divergence of Q with respect to P can be measured using the Kullback-Leibler (KL) divergence, .
- Model's cross entropy with respect to the training data is .

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000029_c9a3138d4c57a305e0a79418a51b09bef35a3f5d34162ec3347b8d56e6ee6cb9.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000030_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Bits-per-Character and Bits-per-Byte

- One unit of entropy and cross entropy is bits: if a language model has entropy of 6 bits, it requires 6 bits to represent a token.
- The number of bits per token is not comparable across models because each model can use a different tokenizer.
- A first alternative could be Bits-per-Character (BPC), but character encodings can differ: a character in ASCII will be represented in 7 bits, but the same character in UTF-8 can be encoded anywhere between 8 and 32 bits.
- Bits-per-Byte (BPB), the number of bits a language model needs to represent one byte of the original training data.
- Cross Entropy tells us how efficiently a model can compress text.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000031_3baadc4f1e3de3c7d5e3a92034332a96f8ce5fa90635c02e1ae284e13a58d5b9.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000032_012279a03ab4e88851b7f932decebf7b9d777ce6ee9b3d601fe4cdd70097fbf9.png)

## Perplexity

- Perplexity is the exponential of entropy and cross entropy.
- The perplexity (PPL) of a dataset's distribution is:

- The perplexity of a language model with learned distribution Q is:

- Perplexity measures the amount of uncertainty a model has when predicting the next token. A higher uncertainty means there are more possible options.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000033_56154cb48c8d4ba05344c59ea5e437c4495add5e391dc2573a9e47669025c168.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000034_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Guidance on Perplexity

- What is considered a good value for perplexity depends on the data itself:
- More structured data gives lower expected perplexity.
- The bigger the vocabulary, the higher the perplexity.
- The longer the context length, the lower the perplexity.
- Perplexity is a good proxy on a model's capabilities: if a model is bad at predicting the next token, it will tend to bad further downstream.
- On predictability:
- Perplexity is highest for unpredictable texts, such as: "My dog teaches quantum physics."
- Perplexity is highest for giberish: "dog cat go eye."

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000035_f42825d50793da3eda69120b0c237865e6dff09563e3aa525f7aa904506ed92d.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000036_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Limitations of Perplexity

- Perplexity might not be useful for models that have been post-trained with SFT or RLHF.
- Post-training is about teaching a model a task.
- If a model learns a task, it may get worse at predicting the next token.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000037_cc40025b23bb94f9e748d57a73234db65976c7006c485986ce3562d691bb00b7.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000038_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Exact Evaluation and Using AI as a Judge

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000039_4ed2cce55a66df14d5d6312ce05c9c139b0977357a35d9b988c516eaf2d05f6c.png)

## Evaluating Models in Downstream T asks

- Our interest in FM and LLM is not necessarily to predict the next token, but instead we are interested in other tasks such as summarization, agentic automation, and so on.
- To evaluate a FM in downstream tasks, there are two approaches:
- Exact evaluation : produces a judgement or assessment without ambiguity. Two approaches are:
- Functional correctness.
- Similarity to references.
- Subjective evaluation : the evaluation can change based on the judge model and prompt.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000040_93ed72c333fbb3b99b2258ea5be6efb3563c6d5f1ec277c74e7f199e1843f6a7.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000041_012279a03ab4e88851b7f932decebf7b9d777ce6ee9b3d601fe4cdd70097fbf9.png)

## Exact Evaluation: Functional Correctness

- Similar to unit testing in software engineering, functional correctness tests aim to assess if the system works as intended.
- Evaluate the system based on whether it performs the intended functionality.
- Popular benchmarks: HumanEval, Mostly Basic Python Problems (MBPP), Spider and Spider2.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000042_030bf3d17893f265141d6f20ef752c6927ce2a9fef2a09df823aa82ca6d6cdb2.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000043_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

def incr\_list(]: list):

"""Return list with elements incremented by 1.

&gt;&gt;&gt; incr\_list([1, 2, 3])

[2, 3, 4]

» incr\_list([5, 3, 5, 2, 3, 3, 9, 0, 123])

## Testing Functional Correctness with HumanEval [6, 4, 6, 3, 4, 4, 10, 1, 124]

solution([30, 13, 24, 321]) ==0

11 11 11

- A benchmark problem comes with a set of test cases. Each test case consists of a scenario the code should run and the expected output for that scenario. def encode\_cyclic(s: str): 11 11 # def decode\_cyclic(s: str): 11 11 11

# # #1

# split string to groups. Each of length 3.

- Generated code is shown with yellow background.
- (Chen et al., 2021)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000044_090e445ee876191bb267807978a27367b0426260dc06bf0524d178ac877c0b20.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000045_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Evaluating T est Cases

- For each problem, k code samples are generated.
- A model solves a problem if any of the k code samples it generated pass all of that problme's test cases.
- The score pass@k is the ratio of solved problems to total number of problems.
- For example, a model that solves 5 out of 10 tests problems with 3 generated code samples each has a pass@3 score of 50%.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000046_178367d07cf3f709859011234aba5ec4d003ff328128eeb992820fcef29d8126.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000047_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Exact Evaluation: Similarity Measurements Against T est Data

- The approach is to evaluate AI's outputs against reference data.
- Reference data is called ground truth or canonical responses.
- Metrics that require references are called referenced-based; metrics that do not require references are called reference-free.
- Four approaches:
- i. Ask an evaluator.
- ii. Exact match: generated response matches exactly the canonical response.

iii. Lexical similarity: how similar the generated response look like the reference responses.

- iv. Semantic similarity: how similar are the meaning of generated and reference responses. 24

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000048_653c9613201c9355a611ab3a71d910ffc66469fd9b3e838e9ffc4490f7654367.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000049_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Exact Match

- The generated response matches exactly the reference response.
- Works for tasks with short, exact responses, such as simple math, common knowledge, trivia-style questions.
- Can take into account formatting differences. For example, a variation of exact match could evaluate if the reference response is contained in the generated response.
- Exact match is rarely useful beyond simple tasks.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000050_3b61c64012c3179d2335576029530e527584ff9cbfa03b75ba1ccea0d565b27e.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000051_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Lexical Similarity

- Lexical similarity measure how much two texts overlap.
- A simple implementation: count number of tokens in common.
- Reference: My cats scare the mice.
- Response A: My cats eat the mice.
- Response B: Cats and mice fight all the time.
- Assuming one word per token, response A has 80% score (4/5) and response B has 60% (3/5).

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000052_6852eb682ea72bac35937aad901ddd6e23f96fe7037c0f90ba92fc98254472dd.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000053_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Other Forms of Lexical Similarity

- Approximate string matching or fuzzy matching, measures simiarlity between two texts by counting how many edits are needed to convert one string to another.
- Common edit operations are:
- Deletion: brad → bad
- Insertion: bad → bard
- Substitution: bad → bed
- Also known as edit distance.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000054_18d1de5772b304c37a7db7984134180c58acff5e3f2bbca0619bc78d4a1ceacc.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000055_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## n-gram similarity

- An n-gram is a group of consecutive tokens:
- A 1-gram (or unigram) is one token, a 2-gram (bigram) contains two tokens, and so on.
- The phrase "My cats scare the mice" has four bigrams.
- Similarity metrics can also be calculated between n-grams.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000056_f23308f30d621737bb390e602f18d7fb622b44f1be5803e7dd82dffed0dfa5b9.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000057_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Metrics for Lexical Similarity (1/2)

- BLEU (Bilingual Evaluation Understudy): measures precision of n-grams in candidate sequence vs reference. Useful in translation.
- ROUGE (Recall-Oriented Understudy for Gisting Evaluation): family of metrics to measure recall of n-grams in candidate sequence that are found in reference. Useful in summarization.
- METEOR++ (Metric for Evaluation of T ranslation with Explicit ORdering): addresses the limitations of BLEU and ROUGE by creating a more sophisticated alignment between candidate and reference sentences. Useful in paraphrase evaluation.
- TER (Translation Error Rate): measures the number of editing operations required to change a machine-translated sentence into a reference translation.
- CIDEr (Consensus-based Image Description Evaluation): a metric for evaluating image captions. 29

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000058_3356b01c3437861148f49d4c463a9a8035cf319152d0d7afdb447b6d2aef320c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000059_ee6f2555b4dfcf96751b3d7966c0380fb2b075e34d299ca68307a66d70d6c258.png)

## Metrics for Lexical Similarity (2/2)

- These metrics differ by the way they measure overlapping sequences.
- Before FM: BLEU, ROUGUE and related metrics were commonly used (e.g., translation tasks).
- Fewer benchmarks use lexical similarity since FM.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000060_25eba106c566d387f54262503e5d908eedac738067406d2a6651338a9573e912.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000061_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Background: Introduction to Embeddings

- An embedding is a numerical representation that aims to capture the meaning of the original data.
- An embedding is a vector: "the cat sits on a mat" could be represented as [0.11, 0.02, 0.54]. Actual vector lengths range between 100 and 10,000 elements.
- Models trained especially to produce embeddings: BERT, CLIP (Contrastive Language-Image Pre-training), Sentence T ransformers, and OpenAI Embeddings.
- Embeddings are used in retrieval, clustering, anomaly detection, and deduplication, among other tasks.
- Embeddings can be computed for text, images, audio, etc.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000062_dd093162ae3a06375029db4ac129c5ae92f92b1a40d629f4c42af57fa87de6d6.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000063_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Semantic Similarity

- Semantic similarity measures similarity of meaning.
- It requires transforming a text into embeddings.
- The similarity between two embeddings can be computed using metrics such as cosine similarity.
- If A and B are the embeddings of the generated and reference responses, respectively, their cosine similarity is given by

- The reliability of semantic simiarlity depends on the quaity, latency and cost of the embedding algorithm.
- Semantic similarity is sometimes called embedding similarity.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000064_5b57e1d6bd6f24997917413e8ad86185cd478bc48a56715a3996d5411842994c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000065_012279a03ab4e88851b7f932decebf7b9d777ce6ee9b3d601fe4cdd70097fbf9.png)

## AI as a Judge

- Human evaluation is an option for open-ended responses. Can AI be used as a judge ?
- Benefits: fast, scalable, no reference data needed.
- Studies show strong correlation with humans (GPT-4 ~85%).
- Applications: quality, relevance, safety, and hallucination checks.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000066_22aa6146b2ff141ed97de8bfa0ca49424777d03db569db24b7c29b8c844750ed.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000067_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## How to Use AI as a Judge (1/3)

Evaluate the quality of a response by itself, given the original question.

```
Given the following question and answer, evaluate how good the answer is for the question. Use the score from 1 to 5. - 1 means very bad. - 5 means very good. Question: [QUESTION] Answer: [ANSWER] Score:
```

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000068_dfdda8d30c5b23552afbf31304b8a202ecbdfee5d7f8329bae51a77facbd8470.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000069_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## How to Use AI as a Judge (2/3)

Compare a generated response to a reference response; assess whether it is the same.

Given the following question, reference answer, and generated answer, evaluate whether this generated answer is the same as the reference answer. Output True or False. Question: [QUESTION] Reference answer: [REFERENCE ANSWER] Generated answer: [GENERATED ANSWER]

This is an alternative to human-design similarity measures.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000070_56dc41716c551e89ddbde1b2029337bde98837eb5818ce69e4d2834721484547.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000071_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## How to Use AI as a Judge (3/3)

Compare two generated responses and determine which one is better or predict which one users will likely prefer.

```
Given the following question and two answers, evaluate which answer is better. Output A or B. Question: [QUESTION] A: [FIRST ANSWER] B: [SECOND ANSWER] The better answer is:'
```

This is helpful for generating preference data for post-training alignment, test-time compute, and ranking models using comparative evaluation.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000072_4b4e287afd39d4fb434fbffcb4f52f16aeea37e334ef44c66f3e8f022de51398.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000073_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Examples of Built-In AI as a Judge Criteria

| AI Tools                      | Built-in Criteria                                                                                                                      |
|-------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| Azure AI Studio               | Groundedness,relevance,coherence,fluency,similarity                                                                                    |
| MLflow.metrics                | Faithfulness,relevance                                                                                                                 |
| LangChain Criteria Evaluation | Conciseness,relevance,correctness,coherence,harmfulness,maliciousness, helpfulness,controversiality,misogyny,insensitivity,criminality |
| Ragas                         | Faithfulness,answer relevance                                                                                                          |

It is critical to remember that criteria definitions are not standardised.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000074_a57f824b7512cd6446a0a82aeca6053ab4eccf32c2b51d425f3e2806c3fd884c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000075_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Prompts for AI-as-a-Judge

- 1 . The task the model is to perform: evaluate the relevance of an answer to a question.
- 2 . The criteria the model should follow to evaluate: "Your primary focus should be..." The more detailed instruction, the better.

## 3 . The scoring system:

- Classification: good/bad, true/false, relevant/irrelevant/neutral.
- Discrete numerical values: 1 to 5.
- Continuous numerical values: between 0 and 1.
- 4 . Consider using examples.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000076_2c8df026aa9eb306a8d8f62905aae0164e8aea40b70b5814215ae2c5c38cc565.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000077_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Al judge

## Process Diagram of AI as a Judge

be evaluated

Given the following question

(Question, answer)

question.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000078_4cc6dec7a90533847ad041c6c50838784266fdf84396f14bbac149f284cfca2e.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000079_edc81415797badb97323290f7362633645e1b4b590ed4e0a78434de8ac18f529.png)

Model

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000080_012279a03ab4e88851b7f932decebf7b9d777ce6ee9b3d601fe4cdd70097fbf9.png)

## Limitations of AI Judges (1/2)

- Inconsistency: for an evaluation method to be trustworthy, it needs to be consistent.
- AI judges are AI and, therefore, probabilistic in nature.
- Evaluation examples in the prompt can increase consistency.
- Criteria ambiguity: AI as a judge metrics are not standardised/
- Increases risk of misinterpretation or misuse.
- An application evolves over time, but the way it's evaluated should be fixed.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000081_19f6a5254a8c8510b2f462b6d4067a59588797cd65bc623dee332c8d472642f3.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000082_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Limitations of AI Judges (2/2)

- Cost and latency: using powerful models to evaluate responses can be expensive and can add latency.
- Use a weaker model for evaluation.
- Apply spot-checks.

## · Biases:

- Self-bias: model favours own responses.
- Position bias: model favours first answer in a pairwise comparison or the first in a list of options.
- Verbosity bias: model favours lengthier answers, regardless of quality.
- AI judges should be combined with exact or human evaluation.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000083_7e784039c45cf25102ec202f35c842f227b7733c2e3bd629b1283f4a9ca34f04.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000084_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Comparative Evaluation

- Compare models side-by-side instead of absolute scores.
- Popularized by Anthropic &amp; Chatbot Arena.
- Algorithms: Elo, Bradley-T erry, T rueSkill.
- Benefits: captures human preference, resists saturation.
- Challenges: scalability, quality control, benchmark correlation.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000085_3092438c36a028ed43bca79abb8628b95115620a4e82a64beaa5bca8244d6411.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000086_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Evaluating AI Systems

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000087_850d36b55ebdafe7efc38a35466a26e369c132019b107e3c7f00cade38ecf8e6.png)

## Evaluation-Driven Development

- In AI Engineering evaluation-driven development means defining evaluation criteria before building.
- An AI application should start with a list of evaluation criteria specific to the application.
- Criteria fall within these categories:
- Domain-specific capability: coding, math, legal knowledge.
- Generation capability: fluency, coherence, factual consistency, safety.
- Instruction-following: formats, constraints, style.
- Cost &amp; latency: time per token, price per output.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000088_9518678044c14f6914912fd908bb539ba12041e40483509b06f7de61b229c055.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000089_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Domain-Specific Capabilities (1/3)

- A model's domain-specific capabilities are constrained by its configuration (such as model architecture and size) and training data.
- Evaluate domain-specific capabilities using public or private domain-specific benchmarks.
- Commonly assessed using exact evaluation.
- Coding tasks:
- Evaluated using functional correctness.
- Code readability: subjective evaluation using AI judges.
- Efficiency measured by runtime or memory usage.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000090_d4053190dcc3357d676d8f3915b72132bc91118525cc194115ed696144e13f83.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000091_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Domain-Specific Capabilities (2/3)

- Non-coding domain tasks: evaluated with close-ended tasks, such as multiple choice questions (MCQ).
- Reduces inconsistent statements.
- Easier to verify and reproduce.
- [Most public benchmarks follow this approach: +75% of lm-evaluation-harness.](https://github.com/EleutherAI/lm-evaluation-harness?tab=readme-ov-file)
- MCQ might have one or more correct answers.
- Use a point system when multiple correct options exist.
- Classification is a special case where the choices are the same for all questions.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000092_ba70297a14136c369f3af00b333104bbb95edea43c9b3883ae8293eece11f5f4.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000093_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Domain-Specific Capabilities (3/3)

- MCQs disadvantages:
- Sensitive to small changes in how the questions and options are presented.
- Despite popularity, it is not yet clear if this is the best approach for FM evaluation.
- MCQs test ability to select good answers, not to generate good answers.
- MCQs are well-stuited for evaluating knowledge (does this model know X ? ) and reasoning (can this model infer Y from X ? ).
- MCQs do not test summarisation, translation or essay writing.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000094_834da39217fbe3a364f58bea4de0d2ad2131ae31b63473aee870fb053a214be6.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000095_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Generation Capability

- Metrics from Natural Language Generation:
- Fluency: measures whether text is grammatically correct and natural-sounding.
- Coherence: measures how well-structured the whole text is.
- Can be evaluated with AI as a judge or using perplexity.
- The most pressing issues are hallucinations and safety.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000096_406279c6faaef7647fdd7d8b6ad5a1ae34e5e708100823f3b0a68c2de5d9545b.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000097_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Factual Consistency (1/5)

- Can be verified against explicitly provided facts (context) or against open knowledge:
- Local factual consistency : the output is evaluated against context.
- Output is factually consistent if it is supported by the context.
- Important for tasks with limited scopes: summarisation, customer support chatbots, and business analysis.
- Global factual consistency : output is evaluated against open knowledge.
- Important for tasks with broad scopes such as general chatbots, fact-checking, market research, and so on.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000098_ba82ebc5cda4920215c5ccabf2f2edee6d06e0b69226e38520056c83e438ff47.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000099_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Factual Consistency (2/5)

## Facts

- Factual consistency is much easier to verify against explicit facts.
- If no context given, then:
- i. Search for reliable resources.
- ii. Derive facts.
- iii. Validate the statement against facts.
- The hardest part of factual consistency verfication is determining what the facts are.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000100_753318c4c64e900115057564375f17337476ec3785d47bb0995ab6b00cf3e085.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000101_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Factual Consistency: Example Prompt

```
Factual Consistency: Is the summary untruthful or contains misleading facts that are not supported by the source text? Source Text: {Document} Summary: {Summary} Does the summary contain factual inconsistency? Answer:
```

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000102_15ed6568c1eb3fbdad8af144a0aa2cdffbb9d11c55cadd378a987ee9cbac829a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000103_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Factual Consistency (3/5)

## Self-verification

- SelfCheckGPT: Given a response R, generate N new responses and measure how consistent R is with respect to N new responses.
- If R disagree with majority of N or all responses disagree, then R is hallucination.
- Approach works, but can be expensive.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000104_ca492b53da8a85ff87aa087027e98ae6dac3a95804ed87d350d3e6588756bac4.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000105_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Factual Consistency (4/5)

## Knowledge-augmented verification

SAFE, Search-Augmented Factuality Evaluator (Google, DeepMind):

- 1 . Use an AI model to decompose into individual statements.
- 2 . Make each statement self-contained.
- 3 . For each statement, propose queries to send to Google.
- 4 . Use AI to determine whether the statement is consistent with research results.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000106_ff9622ea33d008fff9b1a2c59362e67abd85762871ec0ccfb6c905144f69bceb.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000107_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Search-Augmented Factuality Evaluator (SAFE)

## Search-Augmented Factuality Evaluator

Tower?

Response

The Eiffel Tower is a tower in Paris. It

opened in the 20th century. The Nile

River is in Egypt.

Figure 1: Our automatic factuality evaluator, SAFE, uses a large language model to rate the factuality of a long-form response to a given prompt using Google Search. We empirically demonstrate that

SAFE outperforms human annotators while being more than 20 times cheaper (Section 4).

The Eiffel Tower is a tower.

[No change]

The Eiffel Tower is a tower.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000108_6322c95937f621eb2d8346526313f21ca2111d925a327671cbef2c027dc8c3d8.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000109_81a6647b59e4f6066228294fc563cc59a51a6243c687fa4e55e1eb6c61780530.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000110_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Factual Consisntency (5/5)

## Entailments

- Factual consistency can be framed as textual entailment , an NLP task.
- Textual entailment establishes the relationship between two statements.

| Relationship   | Definition                                                 | Factual Consistency     |
|----------------|------------------------------------------------------------|-------------------------|
| Entailment     | Thehypothesis can beinferred from the premise.             | Factually consistent.   |
| Contradiction  | Thehypothesis contradicts the premise.                     | Factually inconsistent. |
| Neutral        | Thepremise neither entails nor contradicts the hypothesis. | Cannot bedetermined.    |

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000111_16c90073c72d9adf20877143534742d7e27b66b559096438243e495ff9c107e3.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000112_eb2e244802fa5b9a881ac24e5963b8b326839ef62edaa2573fd23686c1c9c649.png)

## Safety

## Unsafe content includes:

- Inappropriate language, including profanity and explicit content.
- Harmful recommendations and tutorials, including encouraging self-destructive behaviour.
- Hate speech, including racist, sexist, homophobic speech, and other discriminatory behaviours.
- Violence, including threats and graphic detail.
- Stereotypes, such as using female names for nurses or male names for CEOs.
- Biases against political positions or religion.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000113_93424bca0ddfa3aefa2443bbe207d5f0729280a579963c1423e6aa030eeb907a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000114_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Unsafe Outputs and Biases

- Unsafe outputs can cause reputational, financial, or societal harm.
- Political bias is common on the internet; models differ in leanings.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000115_245daba5a07ae4820cc0dff772b639bd47e9b9e20e460bb13368be05aa194a0a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000116_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

BERT-base

BERT-large

Codex

LLaMA

## Political Biases in LLMs

distilBERT

distilRoBERTa Left +

ALBERT-base

ALBERT-large

BART-base

BART-large

Alpaca economic axis

Libertarian

Figure 1: Measuring the political leaning of various pretrained LMs. BERT and its variants are more socially

conservative compared to the GPT series. Node color denotes different model families.

GPT-3-babbage

·Right

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000117_124e0ea863720763ab3a5abc9f7708866e6bef7b8e569d46e3d160a9cc1f8738.png)

Authoritarian

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000118_39f4b42da817ee65e80857fea941775719bc3ee474b54ce9a533e360c9aa9d84.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000119_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

120

LINFORMER, K=2048

LINFORMER, K=1024

LINFORMER, K=512

Transformer

## Addressing Harmful Behaviour TRANSFORMER

20

10

Linformer

- AI judges implemented with general purpose models.
- Models developed for to detect human harmful behaviour can also be applied.
- Smaller toxicity detection models are efficient and cost-effective.
- [Example: Facebook hate speech detection and Perspective API.](https://ai.meta.com/blog/how-facebook-uses-super-efficient-ai-models-to-detect-hate-speech/)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000120_b7ffd617b7051f9e31034ceff0284094489dd0a6f309141186f0b577af6b0ecf.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000121_e6bc392e49579a41b28263f0ba75b078285011c884afe9661fb592df5dad8672.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000122_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Safety Benchmarks

- TruthfulQA (Lin et al, 2021) is a benchmark to measure whether a language model is truthful in generating answers to questions spanning 38 categories (health, law, politics, and so on). T o perform well, models must avoid generating false answers learned from imitating human texts.
- [RealT oxicityPrompts tests how models respond to toxic inputs.](https://huggingface.co/datasets/allenai/real-toxicity-prompts)
- [Bias in Open-ended Language Generation Dataset (BOLD) is a dataset to evaluate fairness in open-ended language generation in English language.](https://github.com/amazon-science/bold)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000123_c7d2780dafa1c374e26e9b7fec7b82d7b20820b7ea8f8bfca7ee7fd411ec1675.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000124_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Instruction-Following Capability

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000125_a0fcd0dad7f62d7a48288c9acd76f0d9841aed3cba2a1d4b1355013012b6e809.png)

## Importance

- Models must follow instructions exactly, not approximately.
- Failure to follow instructions breaks downstream applications.
- Example: Sentiment classification requires NEUTRAL, POSITIVE, or NEGATIVE outputs.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000126_8ba2f8d427deb0f5297dda3b8146f4043925a285f975b321ed86d2bdce0b9548.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000127_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Prompt with verifiable instructions

Model's response

Write a casual summary of the U.S.

**Section 1: ...**

## IFEval Benchmark

Instruction following verification

V With two sections

(Section 1 and Section 2)

V With at least 25 sentences

- [IFEval (Zhou et al, 2023) measures adherence to automatically verifiable instructions.](https://arxiv.org/abs/2311.07911)
- Tests include constraints on keywords, length, format, and JSON output.
- Scores are calculated as the fraction of correctly followed instructions.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000128_40468d1acaf598f5d8ae8f71d9591402b6fe8ba0b63a8ae00528cde592a2428a.png)

(Zhou et al, 2023)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000129_12107557e9d16af1837d23d926ec71b41e1a0177975f7d58b028e67690c5eb03.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000130_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Instruction Group

Keywords

Keywords

Instruction

Include Keywords

Keyword Frequency

Description

Include keywords {keyword1}, {keyword2} in your response

In your response, the word word should appear {N} times.

## IFEval Verifiable Instructions

Language

Length Constraints

Length Constraints

Length Constraints

Length Constraints

Detectable Content

Detectable Content

Detectable Format

Detectable Format

Detectable Format

Response Language

Number Paragraphs

Number Words

Number Sentences

Number Paragraphs

+ First Word in i-th

Paragraph

Postscript

Number Placeholder

Number Bullets

| Title

· Choose From our ENTIRE response should be in (language), no other lan-

guage is allowed.

starting with { postscript marker}

| Your response should contain {N} paragraphs. You separate paragraphs using the markdown divider: * **                                                                      |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Answer with at least / around / at most {N} words.                                                                                                                         |
| Answer with at least / around / at most (N) sentences.                                                                                                                     |
| There should be {N} paragraphs. Paragraphs and only para-                                                                                                                  |
| graphs are separated with each other by two line breaks. The {if-th paragraph must start with word {first.word}.                                                           |
| the end of your response, please explicitly add a postscript                                                                                                               |
| The response must contain at least {N} placeholders repre-                                                                                                                 |
| sented by square brackets, such as [address].                                                                                                                              |
| Your answer must contain exactly {N} bullet points. Use the markdown bullet points such as: * This is a point. Your answer must contain a title, wrapped in double angular |
| brackets, such as <<poem of joy>>. Answer with one of the following options: {options}                                                                                     |

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000131_41fc1389e9da85eeb2527b48ed4e161af240cebfe909d4325f3042c6e0949af5.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000132_eb2e244802fa5b9a881ac24e5963b8b326839ef62edaa2573fd23686c1c9c649.png)

## INFOBench Benchmark

- [INFOBench (Qin et al, 2024) extends instruction-following evaluation beyond format.](https://arxiv.org/abs/2401.03601)
- Tests include:
- Style, for example, "use a respectful tone".
- Linguistic guidelines, like "use Victorian English".
- Content restrictions, such as "discuss only climate change".
- Verification may require human or AI judgment, not automation.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000133_3f94b892fbdc0d4f2cae7483488daa408e5828c4c688e7dafa0b5b6e7336f26c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000134_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Instruction

Make a questionnaire to help hotel

Decomposed YES/NO Questions

1. Is the generated text a questionnaire?

guests write hotel reviews.

2. Is the generated questionnaire designed for hotel guests?

tomers, ensuring that 5 of the re- customers?

reviews.

| 3. Is the generated questionnaire helpful for hotel guests to write hotel reviews?                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Please generate 10 one-sentence ho- 1. Does the generated text include hotel reviews? tel reviews from ten different cus- 2. Does the generated text include exactly 10 hotel reviews from 10 different                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| views are positive and 5 are nega- 3. Is each of the generated hotel reviews just one sentence long? tive. Begin each review with "CUS- 4. Are 5 of the reviews in the generated text positive and 5 negative? TOMER" and the customer's num- 5. Does each review in the generated text begin with the prefix "CUSTOMER" ber. After completing the 10 re- followed by the customer's number? views, provide a two-sentence sum- 6. Does the generated text include a summarization after completing the 10 reviews? marization that captures the overall 7. Is the summarization in the generated text composed of two sentences? sentiment and key points from the 8. Does the summarization in the generated text capture the overall sentiment and key points from the reviews? Table 1: Representative examples from the INFOBENCH. The first row illustrates an instance from the Easy Set, while the second row presents a sample from the Hard Set. |

(Qin et al, 2024)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000135_a92b508acf5543664d8a1df933db865304690000ef81e970fd107bcba95e7bf6.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000136_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Custom Benchmarks

- Developers should create their own instruction benchmarks.
- Application-specific benchmarks ensure reliable evaluation.
- Example: If YAML output is needed, include YAML-specific tests.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000137_bbc2afb4b13485227b460251273929be29608766404167c56004e0e21e716af9.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000138_69537736864dbcec0170d6dc6c1aca3471004bc22d74383248c7dbf015a08a29.png)

## Roleplaying as Instruction-Following

- Roleplaying is a common instruction type that is used for two purposes:
- i. Roleplaying a character for users to interact with.
- ii. Roleplaying as a prompt engineering technique to improve the quality of a model's output.
- Use cases include non-player characters (NPCs) in games, AI companions, and writing assistants.
- [Benchmarks include RoleLLM (Wang et al, 2023) and CharacterEval.](https://arxiv.org/pdf/2310.00746)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000139_3326a0bf5cee3f7073bb4b4ee32e1503b677e44a9e0909c01a8389220b6e0bd0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000140_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Role Profile

Instruction

Figure 1: Illustration of RoleLLM. RoleLLM comprises four stages: (1) role profile construction; (2) context-based instruction generation (Context-Instruct), for extracting role-specific knowledge and episodic memories; (3) role

prompting using GPT (RoleGPT), for the imitation of speaking styles; and (4) role-conditioned instruction tuning

(RoCIT), using the data generated by Context-Instruct and RoleGPT to enhance existing open-source LLMs.

2 Context-Instruct

MX

## RoleLLM

[Segment] ·

[Question] [Confidence] [Answer]

Mx

‹[Question] [Confidence] [Answer]

[Question] [Confidence] [Answer]

System Instruction

Retrieval Augmentation

Prompt -

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000141_33470b2fa41bd7bfb505c35af5b930858156093ea45bc5c2512e3094a9bd68a2.png)

(Wang et al, 2023)

Q: —JI-#7Л? Q: How's the weather?

1+1=2

It's sunny and warm today!

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000142_6d115826cf42b6c7b45809f924e36dfb3535b742206a39933b3c1c36350188f3.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000143_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

An Example in RoleBench.

Role: Dr. Hannibal Lecter

Instruction: Determine the length of the item in the given list: [apple, banana, cherry].

## Roleplaying Evaluation

selection of fruits, isn't it?

- Models must stay consistent with role style and knowledge.
- Example: A Jackie Chan persona should not speak Vietnamese if does not.
- Evaluation often combines heuristics and AIas-judge approaches.
- Image: an example of RoleBench (Wang et al, 2023).

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000144_190cee0547b9f4a4ba42aa5b2cb2bf97b4b6997e04d65ca6ea2233ecfc0609d8.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000145_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Trilemmas

- A model that generates high-quality output, but is slow and costly will not be useful.
- While designing AI systems, we must balance:
- Output quality.
- Latency.
- Cost.
- Also, consider that we generally will be forced to select at most two:
- Speed.
- Complexity.
- Stability.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000146_5abbd10bdcd4c5ce1e869f47e36efc512dcef7ce81b53ccee12cae407b29ae54.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000147_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Pareto Optimisation

- Optimising multiple objectives is an active field of research called Pareto Optimisation.
- When facing multiple objectives be clear about which objectives can be compromised and which ones cannot.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000148_424e01b88c679b4ae593362926fe55ff5fd78e9d367653835d1906f87a5e4bca.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000149_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Latency and Cost

## Latency

- Metrics: time-to-first-token, time per token, total query time.
- Influenced by model, prompt, and sampling variables.

## Cost

- Cost drivers: input/output tokens (APIs), compute (self-hosted).
- Trade-offs: performance vs cost vs latency.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000150_aa39ab3514248a981927520b318e50897fd227bb02b9fc355968df0a2c1dce2a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000151_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Example of Model Selection Criteria (1/2)

| Criteria   | Metric                       | Benchmark                   | Hardrequirement         | Ideal                   |
|------------|------------------------------|-----------------------------|-------------------------|-------------------------|
| Cost       | Cost per output token        | X                           | < $30 . 00 / 1 M tokens | < $15 . 00 / 1 M tokens |
| Scale      | TPM(tokens per minute)       | X                           | > 1 MTPM                | > 1 MTPM                |
| Latency    | Time to first token (P 90 )  | Internal userprompt dataset | < 200 ms                | < 100 ms                |
| Latency    | Time per total query (P 90 ) | Internal userprompt dataset | < 1 m                   | < 30 s                  |

(Huyen, 2025)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000152_a57f824b7512cd6446a0a82aeca6053ab4eccf32c2b51d425f3e2806c3fd884c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000153_eb2e244802fa5b9a881ac24e5963b8b326839ef62edaa2573fd23686c1c9c649.png)

## Example of Model Selection Criteria (2/2)

| Criteria                  | Metric             | Benchmark                      | Hardrequirement   | Ideal   |
|---------------------------|--------------------|--------------------------------|-------------------|---------|
| Overall model quality     | Elo score          | Chatbot Arena's ranking        | > 1200            | > 1250  |
| Codegeneration capability | pass@ 1            | HumanEval                      | > 90 %            | > 95 %  |
| Factual consistency       | Internal GPTmetric | Internal hallucination dataset | > 0 . 8           | > 0 . 9 |

(Huyen, 2025)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000154_cde3235fa516af1c32f72f0e13c2162abe870dcfd355b9259b66fd7985e22b0f.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000155_eb2e244802fa5b9a881ac24e5963b8b326839ef62edaa2573fd23686c1c9c649.png)

## Model Selection Workflow

- Generally, we are not searching for the best model overall, we are looking for the best model for our application.
- A workflow for model selection is:
- i. Filter by hard attributes: license, privacy, architecture.

ii. Narrow with benchmarks and leaderboards.

iii. Run your custom evaluation pipeline.

iv. Monitor in production for failures and drift.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000156_aeee740002101e091bd4a17bc5982c5077ccffac65f16d08800fa0950c145e34.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000157_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Build versus buy

Public benchmarks decision

## Model Selection Workflow

Filter out models by hard attributes

Figure 4-5. An overview of the evaluation workflow to evaluate models for your application.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000158_890c6652ca3a2debd8874faa05fdadf2be4a30f14e2e3be4cd0e2fc5b8e1a32e.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000159_047238d562af9c5c96a6fcd0348e45c635e3ec4b9f53b28ec2b056a0b764ad46.png)

Monitoring

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000160_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Open Source vs Model APIs

- Build vs Buy: the decision will typically be use a commercial API or host an Open Source model.

## Model APIs

- Pros: best models, scaling, guardrails, features (function calling).
- Cons: cost, vendor lock-in, limited control/transparency.

## Self-Hosting

- Pros: control, transparency, customization, on-device.
- Cons: big/costly engineering effort, usually weaker models.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000161_0b90473993bd340c6c8411dc86743c7b7544db6a34d4e70ce93ef00bda1d8fd4.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000162_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Open Source vs Proprietary Models

- Proprietary models often provide cutting-edge performance via APIs.
- Open source models allow customization and on-premises deployment.
- API services now exist that wrap open source models with added infrastructure.
- Inference and fine-tuning services for open source models are available from cloud providers like Azure, AWS, or GCP.
- Teams must weigh performance against control, cost, and privacy needs.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000163_872e86a869fcb712d0692432dfe5d4070c75c3bf0f8969d9e783e7be26d1385c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000164_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

MMLU (5-shot)

90%

87%

84%

81%

78%

75%

72%

69%

66%

63%

GPT-4

## Open vs Closed Models: Performance Claude 1.3

PaLM

Yi-34B

DBRX Instruct 132B

Mixtral 8x7B

Falcon 180B

U-PaLM

GPT-3.5 Turbo

Llama 2 70b

Performance comparison of closed-source and openweight large language models on the MMLU (5shot) benchmark. (Riedemann et al, 2024)

Claude 2

Claude 3 Opus

GPT-40

Claude 3.5 Sonnet

Liama 3.1 405B

Qwen2.5-72B

Llama 3 405B

Gemini 1.5 Pro

Gemini Ultra

Llama 3.1 70B

Llama 3 70B

Gemini 1.5 Pro

DeepSeek-v2

Qwen1.5 72B

Qwen 2 72B

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000165_c45e6eed947def86be26e1fe6370117bc2a49a71795915251ffaefb0e3034316.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000166_eda10346573f3d331104a17047a2f8625f71f8e66eda9324748cf4f913f11051.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000167_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Mistral Large 2

Llama 3 8B

Oct 2023

Jan 2024

## Open vs Closed Models: Privacy

- Externally hosted model APIs are out of the question for organizations with strict privacy restrictions.
- There is a risk that a model API provider can use your data to train its models, even though most providers claim that they do not do so.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000168_0ba5343431d7968e820b1994cd345a20ed34b9ea436b49196ec214085777aa11.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000169_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Open vs Closed Models: Data Lineage and Copyright

- For most models, it is unclear the data that was used for training.
- IP laws around AI are actively evolving.
- Some companies will choose open models for transparency, other companies will select closed models to avoid legal risk exposure.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000170_6f445eca26a3f2505776b31255b925c1062bb25fea48898d8c053855fe54cd55.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000171_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Open vs Closed Models: API Cost vs Engineering Cost

- Model APIs are expensive and engineering can be more so.
- With enough scale, organisations will consider hosting their own models.
- Model APIs charge per usage and create a dependency on their Service Level Agreement (SLA).
- Hosted models afford control and flexibility, but effort must be spent to maintain the interface, guardrails, scale, and optimise the model.
- In all cases, we prefer models that:
- i. Are easy to use and manipulate.
- ii. Implement a standard interface, which makes it easier to swap models.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000172_762cb59b9bf6e14299b33a897574f2fdf2da1959ada9e19d8c35ade4d8f29510.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000173_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Open vs Closed Models

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000174_2531f876a611e0dd5e9131d94c1a4345fdb428789f88ab319ade7421b172c7ee.png)

## Benchmarks and Leaderboards

- Thousands of benchmarks exist, covering math, science, law, reasoning, and more.
- Benchmarks can become saturated quickly, requiring new ones.
- Trustworthiness of benchmarks varies; evaluation design is crucial.
- [Leaderboards like LMSYS Chatbot Arena provide crowd-sourced comparisons.](https://lmarena.ai/leaderboard)
- Different leaderboards use different benchmarks, therefore their rankings can be different.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000175_e14f801acfc2fc59baf5e1e5d2ee3880431af66e4efd2a4fb989266ed9ca8ada.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000176_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Custom Leaderboards with Public Benchmarks

- A custom leaderboard can be created using benchmarks that are relevant to your application.
- Once selected, you need to aggregate them considering:
- The weight or relative importance of each benchmark.
- The aggregation method: average, mean win rate (the fraction of times a model obtains a better score than onother model, averaged across scenarios), etc.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000177_9062cae754569e56018824b1f89e6b2776a46af9952c3c615b7831057c1b1189.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000178_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Data Contamination

- Models often trained on public benchmarks which leads to inflated scores.
- Detection can be done by calculating n-gram overlap or observing low perplexity.
- Handling: disclose contamination, evaluate on clean subsets.
- Lesson: don't fully trust public benchmark scores.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000179_fce1a147f20e602a32f3f265e24969d66b33e57288978aacbfa5c69a1d033b2a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000180_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Designing an Evaluation Pipeline

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000181_e61fe49b076964fff41cfc1ce007bcc66b3627f29d8a8cf1c16e67cfc6a85fa3.png)

## Why Pipelines Matter

- Evaluation should not be one-off project but a continuous process.
- Pipelines ensure reliable tracking of progress over time by combining automatic evaluation with human or AI-judge oversight.
- Pipelines help identify risks, failures, and opportunities for improvement.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000182_e279aad01ec031e002743ad99a9d8f1e0af0e15eb083f02c7fa4312566a72202.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000183_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Designing an Evaluation Pipeline

- 1 . Evaluate all components: per task, per turn, per step.
- 2 . Create clear guidelines and rubrics tied to business metrics.
- 3 . Define evaluation methods and datasets: exact, subjective, human-in-the-loop.
- 4 . Validate the pipeline: reliability, bootstrap resampling, significance tests.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000184_e205098cfb08ee232c1c30b5842a54e64346a3de379e2692cb7ab7a034cb14f2.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000185_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Pipeline Components

- Define evaluation criteria before building the system.
- Use domain benchmarks for capability checks.
- Apply similarity or correctness metrics for generation tasks.
- Integrate AI as a judge for scalable subjective evaluation.
- Include safety and bias checks to ensure responsible deployment.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000186_48f9e18d5d0174b381d52616d5b65ef758ba5cd2ef64376685772406e84bf969.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000187_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Continuous Evaluation

- Evaluation should be performed during all stages of development.
- Early tests can be simple (eyeballing, small benchmarks) but most tests must scale later.
- Over time, evaluation should become systematic and automated.
- This enables faster iteration while maintaining reliability.
- If you care about something, test it automatically.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000188_2eb12755c648130c2edfc58145910fe201eb4f738e24037d4b2df9158c8b91e9.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000189_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## References

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000190_169b173ebb695b06235ed1a8c9a4a31528b0d4253d4535f15aa3885b2a12968f.png)

## References

- Chang, Yupeng et al. "A survey on evaluation of large language models." ACM transactions on intelligent systems and technology 15, no. 3 (2024): 1-45. (arXiv:2307.03109)
- Chen, Mark et al. (2021). "Evaluating large language models trained on code." arXiv:2107.03374.
- Feng, Shangbin et al. "From pretraining data to language models to downstream tasks: Tracking the trails of political biases leading to unfair NLP models." arXiv:2305.08283 (2023).
- Huyen, Chip. Designing machine learning systems. O'Reilly Media, Inc., 2022
- Lin, Stephanie, Jacob Hilton, and Owain Evans. "T ruthfulqa: Measuring how models mimic human falsehoods." arXiv:2109.07958 (2021).

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000191_ddf2480805ebbc8be8db6807aafe951234d18d00ef95c91afdf44da857223c53.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000192_012279a03ab4e88851b7f932decebf7b9d777ce6ee9b3d601fe4cdd70097fbf9.png)

## References

- Qin, Yiwei, et al. "Infobench: Evaluating instruction following ability in large language models." arXiv:2401.03601 (2024).
- Riedemann, Lars, Maxime Labonne, &amp; Stephen Gilbert. (2024). The path forward for large language models in medicine is open. npj Digital Medicine. 7. 10.1038/ s41746-024-01344-w.
- Slattery, P. et al (2024). The AI Risk Repository: A Comprehensive Meta-Review, Database, and T axonomy of Risks from Artificial Intelligence. arxiv:2408.12622

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000193_5bbe6a4fa589928c5f90fa8b94d218c8c99beba8c30c32fad9487685a6c63ad2.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000194_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## References

- Wang, Zekun Moore, et al. "Rolellm: Benchmarking, eliciting, and enhancing roleplaying abilities of large language models." arXiv:2310.00746 (2023).
- Wei, Jerry et al. "Long-form factuality in large language models." Advances in Neural Information Processing Systems 37 (2024): 80756-80827. arXiv:2403.18802
- Zhou, Jeffrey et al. "Instruction-following evaluation for large language models." arXiv:2311.07911 (2023).

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000195_ff30138f1d40f6729e77ce8c59d262f5b461e55e468193d3ad822761d68b7ee0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/03_evaluation_artifacts/image_000196_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)