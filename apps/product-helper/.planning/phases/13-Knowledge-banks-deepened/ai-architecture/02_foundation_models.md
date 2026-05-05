## Deploying AI

## Understanding Foundation Models

$ echo "Data Sciences Institute"

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000000_ea599e14d4588c33921df8159984cb8ff5dd32f82a2ce9f56bb94a5c8d07e7ce.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000001_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Introduction

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000002_49560bf1e9ba29234af061f7636227a44526b692eb8a88cfe3388c9019a04ecd.png)

Agenda

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000003_818130d666454ece767016a874b4863e60c0d4931ba94e31454818182b3d8eee.png)

## Agenda

- From machine learning to foundation models via deep learning
- Training, pre-training, post-training models
- Sampling, hallucinations, and the probabilistic nature of AI

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000004_7960f1e4b345e5a8a8aba05b4cd2139d27d453da890a4d6634226abfda44501a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000005_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

O'REILLY®

## AI Engineering

We will be covering Chapter 2 of AI Engineering, by Chip Huyen.

Chip Huyen

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000006_139ac68911445b897081e7f75958cd9f0032aa8c52693da342c9465992ff4e5f.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000007_307713a6f7a6611b8d98c7458bc4c17068ac0d477130682ce03ad4575c31e961.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000008_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Understanding Foundation Models

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000009_d976bc7e507bda2752e40eb6b04a6968442d21212bf4969b6322b0463f29e22f.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000010_70c7e1bb8b5c7c9c61bbe0bc4f66efaa716e47dae8d108934bf95412bcb9bf08.png)

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

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000011_3a39e4c110bc7c0e3bfe4f298a8ad3cbefa936ff233ccce4a1f6490e2d1ae11d.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000012_c0b91c811a6afd26c37016fa3674ed522e2ddc469cca2dc5102f25ca47e05ae0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000013_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Training Data

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000014_46b3a98ce1f43d2e3ab86a04bfed70905c164a87b065e3fce257de4621f633ee.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000015_f230ccc597d2fdf7e976b46b73c7252e3b8f108701c38c48e18adbfb44ced37b.png)

## Training Data

- An AI model is only as good as the data it was trained on. If there is no Spanish in the training data, the model cannot perform an English-Spanish translation.
- Specialized models can be created using specialized data, but building datasets is costly.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000016_7f260593615f05ecbf1d0ea629584cf6efdb6cf7187fdb3e6ee30db54951178b.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000017_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Standard Datasets

- Standard datasets are many times used to train LLMs.
- CommonCrawl: non-profit sporadically crawls the internet and in 2022-2023 crawled 2-3 billion pages per month.
- Colossal Clean Crawled Corpus (C4): Google provides a subset of Common Crawl.
- These datasets all types of content from the internet: Wikipedia, patents, and the NYT, but also misinformation, propaganda, clickbait, conspiracy theories, racism, misoginy, and so on. (Schaul et al, 2023)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000018_09e046c6bee6965b4d95b9320fb0083936e761aedc09b290dad2941c5c8608da.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000019_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## A Few Things to Note About Common Crawl (1/2)

## Common Crawl is huge, but it is not a "copy of the entire web"

- English is over-represented in the dataset.
- A growing number of relevant domains like Facebook and the New York Times block Common Crawl from most or all of their pages. (Baack and Mozilla Insights, 2024).

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000020_98206ca220451477d01a10f41d9878d435bdb8b913df5cbf91c3a3b8edaa2946.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000021_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## A Few Things to Note About Common Crawl (1/2)

## Common Crawl's mission does not easily align with needs of trustworthy AI, but devs many times use it without due care

- Common Crawl produces data for many use cases, including research on hate speach. Its datasets deliberately include problematic content.
- Filtered versions of Common Crawl can rely on (simplistic) approaches that are not sufficient to remove problematic content like keeping only top up-voted content from Reddit or to remove content that includes any word in the "List of Dirty, Naughty, Obscene, and Otherwise Bad Words" (Baack and Mozilla Insights, 2024).

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000022_7cf1b97244c1893d9aae5d3467328740e53fd2deafe624a33d65098b02fe2e07.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000023_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

crawl language *

eng rus

deu zho

jpn spa

fra

&lt;unknown&gt;

por ita

nld pol

tur ces

vie ind

kor ara

ukr swe

CC-MAIN-2025-26

%

-

45.2738

5.9836

5.5269

CC-MAIN-2025-30

%

44.6146

5.8351

CC-MAIN-2025-33

%

44.2668

6.1113

5.5837

5.8191

## Multilingual Models

4.2069

4.2873

4.3575

- English accounts for almost half (45%) the data in the Common Crawl dataset, eight times more prevalent than Russion, the second most represented language. 1.7087 1.6697 1.7159

1.0060

1.0122

1.0202

- Languages with limited availability as training data are considered low-resource . 0.9868 0.9542 0.9690

0.6784

0.6825

0.6383

- [Ref.: (CommonCrawl, 2025)](https://commoncrawl.github.io/cc-crawl-statistics/plots/languages)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000024_80d5ff39776356d2ae55da923a2d2f96dfcb7a33b4cde394eba4d3347a0759db.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000025_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

GPT-4 3-Shot Accuracy on MMLU across languages

Random guessing -

25.0%

Chinchilla-English -

PALM-English -

GPT-3.5-English -

GPT-4 English -

Italian —

Afrikaans -

85.5%

84.1%

84.1%

## GPT-4 Performance on MMLU Benchmark Indonesian 83.1% 82.7% 82.1%

Ukranian -

Greek -

Latvian -

Mandarin -

Arabic -

Turkish —

Japanese -

Swahili -

Welsh -

Korean -

Icelandic -

Bengali -

Urdu -

Nepali -

Thai -

Punjabi -

Marathi -

Telugu -

0%

81.9%

81.4%

80.9%

- On the MMLU benchmark, GPT-4 performs better in English. The MMLU benchmakr. 80.0% 77.5% 77.0% 76.5%

73.2%

- The MMLU benchmark spans 57 subjects and includes 14,000 multiple-choice problems. (Huyen, 2025) 71.8% Chilchilla 62.0% 90%

67.0%

69.3%

70.1%

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000026_0937f105ba246cfd7d0ed3001484cc50f1841bb8c6c8f3b0c7573d4fb92c7aff.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000027_d5e7ffa4b3c01080f1492d19976b780dcd2810e2958e27f04c51ddb3659327a4.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000028_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Underrepresented Languages

- Given the dominance of English in the dataset, general-purpose models work better for English than other languages. Models in languages that are not English:
- Have poorer performance than in English.
- Can behave unexpectedly.
- Can perform slower and be more expensive.
- Can we simply tranlsate to English and then translate back the response to the original language ?
- The model requires to understand the underrepresented language well enough for translation.
- Translation can cause information loss.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000029_5aefe89338bbf90cf239e03b30c004873e7414953098c6d4e2893da5bb128222.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000030_012279a03ab4e88851b7f932decebf7b9d777ce6ee9b3d601fe4cdd70097fbf9.png)

## Domain-Specific Models

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000031_18ad92bcebb1a08b8a077adcb7234fd1f6b2d376a1e40458127346cb6cad486d.png)

Distribution of domains in the C4 dataset

Law &amp; Government

4.0%

Community

5.0%

Travel

6.0%

6.0%

## General Purpose Models Perform Many T asks

Jobs &amp; Education

7.0%

Business &amp; Industrial

16.0%

Technology

15.0%

News &amp; Media

13.0%

11.0%

- General purpose models like Gemini, GPT s, and Llamas can perform remarkably well in domains that include: coding, law, science, business, sports, and environmental science. Hobbies &amp; Leisure 8.0% Science &amp; Health 9.0%
- This is largely because the training data includes examples of these tasks. (Huyen, 2025)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000032_04c672bee2f1701c7bba63ee9d2e61b1058efcc506a6e3fc771069e58194e1e4.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000033_43b6fd79c9a794361faf9327f3f0bc3711050193ba9cfb38d2e92c361950663a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000034_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Domain-Specific Models

- Some examples are not available in standard or common data sets. For example:
- Protein, DNA, and RNA data, which follow specific formats.
- Cancer screening data including X-ray and fMRI (functional magnetic resonance immaging) scans, which are private data.
- To train a model to perform well on these tasks, we require domain-specific datasets. For example:
- DeepMind's AlphaFold model was trained on sequences and 3D structures of 100,000 known proteins.
- NVIDIA's BioNeMo focuses on biomolecular data for drug discovery.
- Google's Med-PaLM2 combines an LLM with medical data to answer medical queries with higher accuracy. 18

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000035_4933cb72228828e2c5d4f37b13549a8dba4de615458f256401f7f908cd68ad33.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000036_012279a03ab4e88851b7f932decebf7b9d777ce6ee9b3d601fe4cdd70097fbf9.png)

## From NLP to Foundation Models

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000037_4ed2cce55a66df14d5d6312ce05c9c139b0977357a35d9b988c516eaf2d05f6c.png)

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

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000038_f87ff555bca89e33c4539ebacc7aa6157138f60140fa6135bc2ae9720e3a8807.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000039_042e910a55d7b39b04db3933f5f1a28e0bf49ae39446ba20d9d97d9b0d5be8f5.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000040_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

2017

Transformer

ULMFIT

BERT

RoBERTa XLM-R

GPT

GPT-2

DistilBERT

## Two Key Innovations

- Two key innovations have led to the current state of generative models:
- Attention Mechanism
- Transfer Learning

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000041_91f83b6c509eb7ad89da0a8a229482888c9ac300468bde5646f1f80d406fae89.png)

(Tunstall et al, 2022)

DeBERTa

GPT-3 T5

GPT-Neo

GPT-J

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000042_a3345165474fa667dd69c2de685df29b83c470437a2e5e8cb71c5249da9772a6.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000043_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Key Model Innovations

"In 2017, researchers at Google published a paper that proposed a novel neural network architecture for sequence modelling. Dubbed the T ransformer, this architecture outperformed recurrent neural networks (RNNs) on machine translation tasks, both in terms of translation quality and training cost.

In parallel, an effective transfer learning method called ULMFiT showed that training long short-term memory (LSTM) networks on a very large and diverse corpus could produce state-of-the-art text classifiers with little labeled data." (T unstall et al, 2022)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000044_56adabd592c99f6415155763753188739a04257f0e6ea97838fb2a0569472c9a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000045_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

(h.)

ho)

hi)

## Recurrent Neural Nets

h2,

A

A

- Before transformers, Recurrent Neural Nets (RNN), such as Long-Short-T erm Memory (LSTM) models, were the tools of choice in NLP.
- RNNs contain a feedback loop that allow them to work with sequential data such as text.
- In each iteration, an RNN outputs a vector called the hidden state and feeds back information to itself via a loop.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000046_6f315f2cd7a995d9a5b8ed1fc22387a0ce9c0adc8848b4aaccf0e1b196b3520a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000047_edd133807a1f103c64ace7f58e1355ae2ab1d01bdbbfaf09a567fbab71ff08fd.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000048_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Sequence-to-Sequence Models

- Models that work with vectors or sequences of data that have arbitrary length are called sequence-to-sequence (seq2seq) models.
- seq2seq models generally implement an encoder-decoder approach:
- The encoder maps the input sequence into the last hidden state .
- The decoder maps the last hidden state into an output sequence.
- This simple and elegant architecture creates an information bottleneck: the hidden state must store the information content of all the input sequence, since it is the only information that the decoder can use to generate the output.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000049_653c9613201c9355a611ab3a71d910ffc66469fd9b3e838e9ffc4490f7654367.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000050_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Transformers →

RNN cell

## Encoder-Decoder Framework

State

RNN cell

RN cell

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000051_17084519215c5912e0aab237a052fddd3361f30a8f4e5b93b0b2c1b653681a6e.png)

Illustration of a translation task using RNN (T unstall et al, 2022)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000052_86eccceace45cdc05229e22b6cc728183790c62f0c6ea2875b9887adcf368709.png)

great →

!→

→ Transformer

→ sind

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000053_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Issues with seq2seq

There are two issues with seq2seq:

- Vanilla seq2seq decoder generates output tokens using only the final hidden state of the input.
- Input and output processing are done sequentially, making it slow for long sequences. If we generate 200 tokens, seq2seq needs to wait for each token to be generated before processing the next.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000054_6852eb682ea72bac35937aad901ddd6e23f96fe7037c0f90ba92fc98254472dd.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000055_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Transformers →

RNN cell

State 1

## The Attention Mechanism

RNN cell

RNN cell

→ Transformer

→ sind

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000056_51bdb4ef013f70a80f2687e1923fe6f9616e347815bfdc10c87db70dbf154863.png)

Translation task and attention mechanism (T unstall et al, 2022)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000057_6050162b536b63f79ccf4fa2d23f65971f0d9870e4cc94f0144ad8feaf53d3ed.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000058_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

→

## Attention Enhances Performance

- Instead of producing a single hidden state for the input sequence, the encoder produces a hidden state at each step that the encoder can access.
- The attention mechanism allows the decoder to assign different weights or attention to each of the encoder states at every decoding step.
- By focusing on which input tokens are most relevant at each timestep, attention-based models can learn non-trivial alignments between the words in generated text and the input sequence.
- Attention enhances performance.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000059_f23308f30d621737bb390e602f18d7fb622b44f1be5803e7dd82dffed0dfa5b9.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000060_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

How are

you

?

Figure 2-4. Seq2seq architecture versus transformer architecture. For the transformer architecture, the arrows show the tokens that the decoder attends to when generating each output token.

Seq2seq (RNN-based)

→ Como → estas →

## Seq2seq (RNN-based) vs Transformer

How → are → you →

?

Final hidden state

Transformer (attention mechanism)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000061_6ca0ef64be69d8c33572fe16d0d0cbb41ee153baf420491be71c9530cd49c3df.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000062_ad633d547a4a4cc538dab773789b7f5bf925f26a2512178656046e0f57356513.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000063_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Self-Attention (1/2)

- In the RNN architecture, computations are sequential and cannot be parallelized across the input sequence.
- Transformer paradigm: remove recurrence and rely entirely on a special form of attention called self-attention .
- Self-attention allows the attention mechanism to operate on all the states in the same layer of the neural network.
- A distinguishing characteristic of this type of models is self-supervision. Selfsupervised learning takes advantage of natural labels: any text sequence can be used as labelled data.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000064_25eba106c566d387f54262503e5d908eedac738067406d2a6651338a9573e912.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000065_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Transformers -

+

FF NN

## Self-Attention (2/2)

State1

State 2

FF NN

FF NN

→ Transformer

→ sind

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000066_7e4f6fb950c826c97a01fa20641671792c2dfdf4c92a2f2c6b14d53c744db64f.png)

Self-Attention (T unstall et al, 2022)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000067_f0bc80442d41835327c410828dae8b1e123ca6d600d4e6a76bf4c3e8f25817b9.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000068_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Inference for Transformer-Based Language Models

Inference for transformer-based language models requires two steps:

- Prefill
- Process input tokens in parallel.
- Create the intermediate state necessary to generate the first output token.
- Decode
- The model generates one output token at a time.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000069_5b57e1d6bd6f24997917413e8ad86185cd478bc48a56715a3996d5411842994c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000070_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Three Vectors in the Attention Mechanism

- The attention mechanism uses key, values, and query vectors.
- Query vector (Q) : represents the current state of the decoder at each decoding step.
- Each key vector (K) represents a previous token. At a given decoding step, previous tokens include both input tokens and previously generated tokens.
- Each value vector (V) represents the actual value of a previous token, as leanred by the model.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000071_d92c9e353ced43cd76ef8f429d4299d32913d46bca97189ffa5cc8f0a20152b3.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000072_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Attention mechanism visualized from

Attention mechanism in action: computing the next token from the previous tokens

Attention is all you need

(Vaswani et al., 2018)

Previous token

## Dot Products in Attention

Mask (opt.)

:

Scale

1

Q

= ×

Value

Key

The attention mechanism computes how much attention to give to an input token by performing a dot product between the query vector and its key vector. (Huyen, 2025)

і

Next token

Como

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000073_230a995eccc23fd63cc0c0e0a03cd6d912978bd1a21bbfba779e4c7786b3a7f5.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000074_e77ef21aed701e832437da22d024f762b25e2c3fed2480f70f1db28e649bdb3a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000075_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Query vector

## Previous T okens and Context Length

- Each previous token is represented with a (key, value) pair.
- Longer previous tokens require more (key, value) pairs to be computed and stored
- This limits context length and it is a key reason to efficiently compute and store

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000076_56dc41716c551e89ddbde1b2029337bde98837eb5818ce69e4d2834721484547.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000077_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Multi-Headed Attention

- Multi-headed attention allows the model to attend to different groups of previous tokens simultaneously.
- The attention mechanism is almost always multi-headed.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000078_4b4e287afd39d4fb434fbffcb4f52f16aeea37e334ef44c66f3e8f022de51398.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000079_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Nx

Positional

Encoding

Output

Probabilities

Softmax

## Transformer Architecture (1/2)

Add &amp; Norm

- Transformer architecture is composed of several transformer blocks.

Add &amp; Norm

Multi-Head

- A transformer block has two modules:

Add &amp; Norm

- Attention module. Consists of four weight matrices: Query, Key, and Value, and Output Projection. Multi-Head Attention Multi-Head Positional
- Multi-Layer Perceptron (MLP) module or feedforward (FF) layer. Embedding 1

Inputs

Outputs

- (Vaswani et al, 2017)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000080_f44bdbdb809e9bf4819c731535299b1dbab1587b95a83b0f741cb169169d8b86.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000081_e743c6965f6b357f50ec7f5bae08adf0a7c08ebe63abfdc5540e950ddebfe691.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000082_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

Nx

Positional

Encoding

Add &amp; Norm

- A transformer-based language model also has:
- An embedding module before the transfomer blocks. Consists of embedding matrix and the positional embedding matrix. Multi-Head Attention

Positional

- An output layer after the transfomer blocks, the model head . Maps model output vectors into token probabilities used to sample model outputs. Embedding 1 Inputs
- (Vaswani et al, 2017)

Output

Probabilities

## Transformer Architecture (2/2)

- The number of transformer blocks in a transformer model is called the number of layers.

Add &amp; Norm

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000083_a0d397bea84b7ca4fd7421187420c56a57c3fa6819de1e3039ac09bce683f93b.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000084_f7967a2531009653991a9f33d6d34aae8d19331413d3744f873387079a02748d.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000085_4397ee3369e27621ce995cb19d645c07a82fb689b386efa432225a1a12be34fd.png)

K

N × transformer block

Attention

MLP

## Size of a Transformer Model

Input→

Emb layer

FF1

TFF2

The size of the transformer model is determined by the size of its building blocks, including: emb

Q, K,V,O:

d\_model x d\_model

- The model's dimension determines the size of the key, query vlaue, and output projection matrices. × d\_model × d model d ff: feedforward dimension V: model's vocab size

C:

position indices to track

- Number of transfomer blocks.
- Dimension of the feedforward layer.
- Vocabulary size

→ Output

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000086_63e074ec4f71654842408799d7387c67a2be3d318af7bc526842d035768a112e.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000087_57a6b60b0c6beed7a1dc6cde3a536f0f5810d217bd23caa1955d7bf448c69b1c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000088_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Model Dimensions

| Model           |   #transformer blocks | Modeldim   | FFdim    | Vocab.size   | Context length   |
|-----------------|-----------------------|------------|----------|--------------|------------------|
| Llama 2 - 7 B   |                    32 | 4 , 096    | 11 , 008 | 32 k         | 4 k              |
| Llama 2 - 13 B  |                    40 | 5 , 120    | 13 , 824 | 32 k         | 4 k              |
| Llama 2 - 70 B  |                    80 | 8 , 192    | 22 , 016 | 32 k         | 4 k              |
| Llama 3 - 7 B   |                    32 | 4 , 096    | 14 , 336 | 128 k        | 128 k            |
| Llama 3 - 70 B  |                    80 | 8 , 192    | 28 , 672 | 128 k        | 128 k            |
| Llama 3 - 405 B |                   126 | 16 , 384   | 53 , 248 | 128 k        | 128 k            |

The dimension values of different Llama models (Huyen, 2025)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000089_96caa53deaa96e3fc7423eba52f07bf5f74f19593098896834e9458c7f22215a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000090_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Parameters in notable artificial intelligence systems

Parameters are variables in an Al system whose values are adjusted during training to establish how input data gets transformed into the desired output; for example, the connection weights in an artificial neural network.

1 trillion

100 billion

10 billion

1 billion

100 million

10 million

1 million

100,000

10,000

1,000

100

Jul 2, 1950 Apr 19, 1965

Data source: Epoch (2025)

Note: Parameters are estimated based on published results in the Al literature and come with some uncertainty. The authors expect the estimates to be correct within a factor of 10.

· Academia

Academia and industry collaboration

Industry

## I Other

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000091_cdc5e538149c87c54f869d881a91be6d314fabf8b98dddbae389b71d3f617706.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000092_10b945dd4875facfdee2d093a0296be582a8dacf0277a064c2980ec69c96616e.png)

In general, more parameters means better learning and better models.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000093_c8a055c10101e136a5a63f4fc3bb271ce3bc34fe770545a38b1588107a229d9b.png)

## Model Size

·

·

Dec 27, 1978

Sep 4, 1992

Publication date

Our World in Data

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000094_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Number of Parameters is Not the Only Measure of Scale

- Parameters by themselves can be misleading, for example, in sparse models. Mixtureof-experts (MoE) models are sparse models:
- MoE model is divided into different groups of parameters, and each group is an expert.
- Only a subset of experts is actively used to process each token.
- As an example, for the Mixtral 8x7Bnly model:
- Each token requires 12.9B parameters to be active, while the total number of model parameters is 46.7 B.
- During inference, the cost and speed are the same as 12.9 B parameter model.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000095_5bd04db30d65bc5da7bc1f44db5a801ade030dbea42214d0d26099ceff0d0a50.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000096_012279a03ab4e88851b7f932decebf7b9d777ce6ee9b3d601fe4cdd70097fbf9.png)

## Number of training tokens

- Not the same as the number of tokens in training dataset.
- Number of training tokens is the number of tokens in training data * epochs.
- An epoch is one training pass over the data.
- If a model is training using 1 trillion tokens and two epochs, then the number of training tokens is 2 trillion.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000097_a330b1ea21c604e891bafe4bb83d013a1e55f49d0f0e82c49941f16a7354dadb.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000098_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Table 1 | Current LLMs. We show five of the current largest dense transformer models, their size,

## Examples of the Number of Training T okens

trained for much longer than 300B tokens.

Model LaMDA (Thoppilan et al., 2022) GPT-3 (Brown et al., 2020) Size (# Parameters) Training Tokens 137 Billion 168 Billion 175 Billion 300 Billion

178 Billion

| Gopher (Rae et al., 2021)        | 280 Billion            | 300 Billion              |
|----------------------------------|------------------------|--------------------------|
| MT-NLG 530B (Smith et al., 2022) | 530 Billion 70 Billion | 270 Billion 1.4 Trillion |

(Hoffmann et al., 2022)

300 Billion

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000099_ef87e44af27cf9ec04a1bdad3a634a0708b87000c5553d82d338e846c5245294.png)

Jurassic (Lieber et al., 2021)

Chinchilla

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000100_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Compute

- Training requires compute, another measure of scale.
- A standardised unit for compute is FLOP: floating point operation. It measures the number of floating point operations performed for a certain task.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000101_dde8d2a3ba481b7f778229da0fc214653c6a58dd0bbd35e7014974259213c79b.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000102_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Training compute (FLOP)

1et25

1e+23

let21

1e+19

1e+17

1e+15

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000103_7fca67741dc2fd66057a5f0a098ba1ad21be2db1f1d450a43ce9efdd882d18f4.png)

Compute used to train machine-learning models (Jones, 2023)

O All

A Large scale

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000104_07a8df745f4dca1712d1eb6f32a1bc0982a1e2b5f1ba2c4c241a411eacf12fd8.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000105_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Compute is Costly

- 1 . Model performance depends on the model size and the dataset size.
- 2 . Bigger models and bigger datasets require more compute.
- 3 . Compute costs money and resources.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000106_e70c2fd464bedcc6f1abfdd1d39c5d98f6f9e384f3b523d77d62def740c5b3ac.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000107_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Chinchilla Scaling Law

- The Chinchilla Paper (Hoffmann et al., 2022), proposes that for compute-optimal training, the number of training tokens needs to be approximately 20 times the model size.
- Ex., for a 3B parameter model, we would require 60B tokens.
- This law was developed for dense models trained on predominantly human generated data.
- The model size and the number of training tokens should be scaled equally: for every doubling of the model size, the number of training tokens should also be doubled.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000108_01b6488e2dda11f03c7ae9c32c1d39397da1ace994e0828c43c2f0f304ad73ec.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000109_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

3.2

## IsoFLOP Curves

2.8

2.

6

2.

2.2

2.0

бe18

le19

3el9

бе19

1e20

3e20

· бе20

· le21

· 3e21

100M 300M

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000110_c745225cf3bade13b7254c559869ccd29953d18f3ad260afb52a3e0bbd5afb16.png)

larger models (center and right). In green, we show the estimated number of parameters and tokens

for an optimal model trained with the compute budget of Gopher.

Parameters

1T

100B

638

10B

10T

1T

1.4T

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000111_0ccd0d0f67ece4de0520929550207809e59d532779fe352078db7ca7c4eb6dac.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000112_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Model Size

Three numbers signal a model's scale:

- Number of parameters: proxy for the model's learning capacity.
- Number of tokens a model was trained on: proxy of how much the model has learned.
- Number of FLOPs: proxy for training cost.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000113_753318c4c64e900115057564375f17337476ec3785d47bb0995ab6b00cf3e085.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000114_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Bottlenecks (1/2)

## Scaling extrapolation

- While the cost for the same model performance is decreasing, the cost for model performance improvements remains high.
- Model performance depends on hyperparameter optimization.
- Repeated training is not possible in large scale scenarios.
- Scaling extrapolation or hyperparameter transfer has emerged as a research subfield that tries to predict, for large models, what hyperparameters will give the best performance.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000115_047238d562af9c5c96a6fcd0348e45c635e3ec4b9f53b28ec2b056a0b764ad46.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000116_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Bottlenecks (2/2)

## Scaling Bottlenecks

- There are two scaling bottlenecks: data and electricity.
- It is possible that we will run out of internet data in the next few years.
- Actors are injecting data that they want models to train on.
- The internet is being populated with AI-generated data.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000117_ca492b53da8a85ff87aa087027e98ae6dac3a95804ed87d350d3e6588756bac4.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000118_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Post-Training

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000119_2b133349aaeb9dfa18438a271bfd69234f6f2b004ec5c5ec79c55cba666e5419.png)

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

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000120_6d686a2b73434ae1fd23fb038fa00a8a0033b0c633e9b661a8a35a50bbcfb100.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000121_24b0b2b29430f2ef5be56923de77b6c582315348584e4f13f28b9512c0d7638e.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000122_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Why Post-Train ?

- We want to retain the capabilities of foundation models, forego the need to train them from scratch, but would also like to enhance performance on specific tasks.
- In many applications, we observe limited labelled data for specific tasks and cannot access large amounts of labelled text data to train a model.
- Transfer learning allows to apply the information learned from one task to another.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000123_dadfa4d7d23557199e76f109d48de966315a199789f20f032f6544cdc601f779.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000124_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## What Does Post-Training Do ?

## With post-training we can:

- Set the style, tone, format, or other qualitative aspects of the output.
- Improve reliability at producing a desired output.
- Correct failures to follow complex prompts.
- Handle edge cases in specific ways.
- Perform a new task that is difficult to articulate in a prompt.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000125_93424bca0ddfa3aefa2443bbe207d5f0729280a579963c1423e6aa030eeb907a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000126_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Two Modes of Post-Training

- Supervised Finetuning (SFT): Finetune the pre-trained model on high-quality instruction data to optimize for conversations instead of completion.
- Preference Finetuning: Further fintune the model to output responses that align with human preference. Methods include:
- Reinforcement learning for human feedback (RLHF).
- Direct Preference Optimization (DPO).
- Reinforcement learning for AI feedback (RLAIF).

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000127_bb433108d3ceedbcd4a5a929d9ec66a5234f4d80f1398e7eb22faeac1dc9bbcf.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000128_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Scale

May 23

Examples

Bolded: open sourced

Low quality data

High quality data

Human feedback

## Pre-training, SFT, and Preference Finetuning

Optimized for text completion

Language modeling

Pretrained LLM

&gt; 1 trillion tokens

GPT-x, Gopher, Falcon,

StableLM

LLaMa, Pythia, Bloom,

Finetuned for

Trained to give a scalar score for

Optimized to generate responses that maximize

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000129_1d0bc66fcff75b35072d36164d6c3f3199f6bb014f449bc9bc8fce8f4fc58811.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000130_52e54a86f304c9dda3d53e4138530a0e97a3ae8655a0e573d820556209aafc5b.png)

RLHF

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000131_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Supervised Finetuning

- A model mimics its training data.
- To encourage a model to generate appropriate responses, we can show examples of appropriate responses. Such examples follow the format (prompt, response) and are called demonstration data.
- Since different requests require different types of responses, the demonstration data should contain the range of requests the model is expected to handle (for example, question answering, summarization, and translation).

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000132_a93c002fc2cf5e111499a5422bedd555ce4b36ceac9d08e5c6493b386da58979.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000133_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Transfer Learning

- Transfer learning allows to apply the information learned from one task to another.
- ULMFit (Howard and Ruder, 2018) proposed the following process for transfer learning:
- Body: (a) A network is trained on a general domain corpus. The weights of the body learn broad features of the source domain. (b) The full LM is fine-tuned on target task data using discriminative fine-tuning and slanted triangular learning rates (STLR).
- Head: (c) A classifier trained for a specific task. The classifier is fine-tuned on the target task using gradual unfreezing, discriminative fine-tuning and STLR.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000134_8e748f722f6e190de9346bebb7b50f4ad31c14328758e47e57da9029b0a8a98a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000135_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## ULMFit

Layer 3

Layer 2

Layer 1

Embedding layer

The gold

Softmax 1

layer

Layer 3

Softmax layer

Layer 3

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000136_52a508560f9cdad77d7dfe40e6ce9048abcae32aeabbf3c20aa74578046a0a60.png)

(Howard and Ruder, 2018)

7

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000137_b2d06060f7cd04ff72f28c77b6c4052d1b079670b48de93094c0f04b0894047c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000138_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Table 1: Distribution of use

Table 2: Illustrative prompts from our API prompt dataset. These

## Types of Prompts Used for SFT

Use-case

(%)

Use-case

Brainstorming

Rewrite

Generation Open QA Brainstorming Chat 45.6% 12.4% 11.2% 8.4% Generation

Rewrite

Summarization

Classification

Other

Closed QA

Extract

| 6.6%      |
|-----------|
| 4.2% 3.5% |
| 3.5%      |
| 2.6%      |
| 1.9%      |

| 111111              | This is the summary of a Broadway play:              |
|---------------------|------------------------------------------------------|
| {summary } t1 t1 11 | This is the outline of the commercial for that play: |

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000139_094813f6332b9288c3ed7c42418cae547375b7397c79adda25a31020965eb649.png)

Prompt

List five ideas for how to regain enthusiasm for my career Write a short story where a bear goes to the beach, makes friends with a seal, and then returns home.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000140_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Preference Finetuning

- The goal of preference finetuning is to get AI models to behave according to human preference.
- The earliest successful preference finetuning system was Reinforcement Learning for Human Feedback (RLHF).
- RLHF has two parts:
- i. Train a reward model that scores the foundation model's output.
- ii. Optimize the foundation model to generate responses for which the reward model will give maximal scores.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000141_9a4cf8af69ebc6f37db31b7fd7b54fca025390b47f0726d952b208066c56ee26.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000142_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Creating a Reward Model

- A reward model is the basis of RLHF.
- In principle, the reward model would score every (prompt, response) that it receives, for example, on a 10-point scale. However, that model would require consistent (human) labels which are costly and difficult to obtain.
- An alternative, easier task, is to ask labelers to compare two responses and select the preferred one.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000143_37d9ab6db07b5980182b43b0de1c63a5e6e87885d31e223b62af4730721eab6a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000144_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Comparing Responses for RLHF Training (2/2)

## Accepted

- Human : how can I get my dog high ?
- Assistant : I' m not sure what you mean by that. | Human: how can I get my dog high ?

## Rejected

- Human : how can I get my dog high ?
- Assistant : I don't know that we should get the dog high. I think it' s important for a dog to experience the world in a sober state of mind.

[(Anthropic, 2025)](https://huggingface.co/datasets/Anthropic/hh-rlhf)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000145_60c395a171867434295d46b4cf2a9eb79eab2034041515001d7ed53554ef39fa.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000146_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Comparing Responses for RLHF Training (1/2)

## Accepted

- Human : If you were going to steal from a convenience store, do you think it would be better in the morning or at night ?
- Assistant : I r eally couldn't say, I'm not familiar with stealing convenience store items.

## Rejected

- Human : If you were going to steal from a convenience store, do you think it would be better in the morning or at night ?
- Assistant : It is good to consider the difference in human traffic at night, and also the security cameras. Night time would probably be better for avoiding security cameras[...]

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000147_a858f22c91391d295e52fcb60c24bc1dcafd7390ca8da51fa399c695eba6e0e5.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000148_012279a03ab4e88851b7f932decebf7b9d777ce6ee9b3d601fe4cdd70097fbf9.png)

## Reward Model

- The reward model can be trained from scratch or finetuned on top of another model, such as a pre-trained SFT model.
- Finetuning based on a model with strong performance, will generally give best performance.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000149_513bbe2992c9c1234bf81132d1afcc602bd0648a5530776d851be7a046172372.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000150_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Step 1

Collect demonstration data, and train a supervised policy.

Seme people want to the moon..

SFT

BBB

Step 2

Collect comparison data, and train a reward model.

A labeler ranks the outputs from

best to worst.

This data is used to train our

reward model.

0·000

0·0-0-0

Figure 2: A diagram illustrating the three steps of our method: (1) supervised fine-tuning (SFT), (2)

reward model (RM) training, and (3) reinforcement learning via proximal policy optimization (PPO)

on this reward model. Blue arrows indicate that this data is used to train one of our models. In Step 2, boxes A-D are samples from our models that get ranked by labelers. See Section 3 for more details

on our method.

Step 3

Optimize a policy against the reward model using

reinforcement learning.

## Training InstructGPT

sampled.

A labeler demonstrates the

desired output behavior.

This data is used to fine-tune GPT-3

with supervised learning.

The policy ne a sto

out fro

PPD

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000151_f4e25d96399bee6e29a94c3ef1668707701c72e4a6c603955ccca7f594067d27.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000152_80d5ff39776356d2ae55da923a2d2f96dfcb7a33b4cde394eba4d3347a0759db.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000153_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Sampling and the Probabilistic Nature of AI

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000154_ad8380b6dc3940f951501dd55fbd83e4cd52105b7b80845ced4fa0eb4ee7edc9.png)

What is your favourite thing about cats? My

, blue

* furry

· curious

0.01%

29%

35%

## How Models Construct Outputs

··.

··.

- A model constructs outputs through sampling . over the vocabulary
- For a language model to generate the next token:
- i. Look at the probability distribution over all tokens in the vocabulary (given the context).
- ii. Select a sample based on each token's probability.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000155_5c680255468aacf9e49dd62148182831549cfb22c6eb546871d2eacd5cf1d3ce.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000156_190cee0547b9f4a4ba42aa5b2cb2bf97b4b6997e04d65ca6ea2233ecfc0609d8.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000157_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## A Note on Probabilities

- Model outputs are many times expressed in logits (not probabilities), which are then transformed to probabilities using a softmax layer.

- One logit corresponds to one possible value.
- A larger logit corresponds to a larger probabilities, but logits can be non-positive and do not add to one.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000158_5abbd10bdcd4c5ce1e869f47e36efc512dcef7ce81b53ccee12cae407b29ae54.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000159_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Greedy Sampling

nice red

beautiful the

sunny

Logits

1.50

0.87

0.53

0.21

-0.15

-0.25

Prob.

38%

20%

14%

11%

7%

7%

- Greedy sampling: select the option with the highest probability.

round

- Greedy sampling produces always the same output, which can make the model give boring outputs.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000160_ed1566e14f9cb66740b51c8ceee3186f34a102ac4cef02bae33cf60785498974.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000161_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Temperature Adjustment

- Temperature adjustment redistributes the probabilities of the possible values by dividing all logits by a constant before they are transformed to probabilities.
- A higher temperature allows the model to pick less obvious values.
- A temperature of 0.7 is often recommended for creative use cases, balancing creativity and predictability.
- A temperature "equal to" 0 would give the most consistent outputs (but logits/0 does not make sense); models will generally select the largest logit, avoiding the softmax layer.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000162_18f960dec8c068fa09d17bc407eabb3d62412fb4f95fc4efb797be88fed96b34.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000163_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

The house at the top of the hill is nice

red beautiful

the

Temperature (T)

Logits

0.5

1.0

Adjusted

Prob. Logits/T

1.50

0.87

0.53

0.21

38%

20%

11%

3.00

14%

1.74

1.06

0.42

Adjusted

Prob. Logits/T

64%l

1.50

9%

18%

0.53

0.87

0.21

## Temperature-Adjusted Logits and Probabilities

soft

- 1.20

-2.40

-1.20

Prob.

38%

20%

1.5

Adjusted

Logits/T

1.00

14%

7%

11%

7%

3%

0.58

0.35

0.14

-0.10

-0.17

-0.80

Prob.

29%

19%

15%

12%

10%

9%

5%

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000164_206763dd4a84d1a2c7c3f1d9347eccc189762afeafa005010479e6b65b5d1511.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000165_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Input

...

C

## A Note on Probabilities

→

Neural network

·

Temperature optional

...

- Some, but not all, model providers will return the probabilities generated by their models as logprobs.

Logits

Probabilities

Logprobs

- Logprobs are probabilities in the log scale. They help avoid the underflow problem in neural networks.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000166_1b8ae597f379b880c0d0edeeb018b81d735efb523da248c7133480727c4fe801.png)

How logprobs are calculated (Huyen, 2025)

Log

·

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000167_93dd2ceea18a11a958808c50cfb0982f12e00d81d89a1772c26348405cfb2e90.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000168_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Top-k Sampling

- Top-k reduces computation workload, without sacrificing too much response diversity.
- Softmax requires two passes to calculate probabilities: one to perform the sum of exponentials, , and another one to calculate each .
- By selecting the top-k tokens and applying softmax to this subset, the model can be sped up.
- Typical values of k are 50-500, much smaller than the model's vocabulary size.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000169_c01701876a723e828c49f703d5c88daaad6c0ce1242ab58709f5e370cc5f6b53.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000170_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Top-p Sampling

- Select the top tokens by likelihood such that their cumulative probabilities are at least p.
- Dynamically adjusts to distribution of potential outputs.
- Top-p does not necessarily reduce computational load. Its benefit is that it focuses only on the set of most relevant values for each context.
- Also known as nucleus sampling.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000171_1371a3cb21ac2f2a22755f08bfb14d8a866cadcdc9c174d96b150e4a0448409f.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000172_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

The house at the top of the hill is nice

red beautiful

the sunny

## Top-k and T op-p Samples

Logits

1.50

0.87

0.53

0.21

-0.15

-0.25

-1.20

Prob.

38%

14%

20%

11%

7%

7%

3%

38%

58%

73%

83%

91%

97%

100%

k

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000173_78e243dc4d2c8479f9374a2aab1fc38f5e5fcbffc12518b23976bac3c3e6ef4d.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000174_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Stopping Condition

- An autoregresesive language model generates sequences of tokens by generating one token after another.
- Long outputs take more time (latency), more compute (cost), and can degrade user experience.
- We may want a model to stop under certain conditions:
- After a fixed number of tokens
- After stop tokens or stop words.
- Early stopping can interfere with structured outputs such as JSON.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000175_525f2601a36baacaffeb1fd03561d1704ab2ef40652d086bc3dc1d72a48ec30a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000176_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Test Time Compute (1/2)

- Test Time Compute: instead of generating one response per query, generate multiple responses to increase the chance of a good one.
- Instead of generating all samples independently, use beam search to generate a fixed number of the most promising candidates at each step of sequence generation.
- Test Time Compute is expensive. On average, generating two sequences will cost twice as much.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000177_3605c9416bef1ddeb4a06d04811e6d2b7f55ad658fa1ff5fdf86552d84fe34c3.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000178_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Yesterday all my troubles seemed so far

Step score

Total score

-14015

-2,7499

-2,4830

-2.6952

removed from

pone

-2,7499

-2,4830

-2,6952

away removed

&gt; from gone

oken|Step

-1.5757

-21726

-25878

25083

16503

-2,7325

Step score

-24803

-2,5613

-1.3449

-1,7870

Total so

-2,3790

-2,4500

-2,4912

Total scon

-2,4817

-2.5772

-3,4778

-2,9554

Step score Total scor

-1,1302

·1.9027

-1,5339

-24472

75717

32883

-2,9918

The conclusive sequences are the ones that end in an &lt;|endoftext|&gt; token or at the end of generation.

They are ranked by their scores, as given by the formula score = cumulative\_score / (output\_length

Total

-L615C

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000179_1953abcb0630c2b186b588d94ae810a922e9572a84144096f21564136cd24485.png)

Source: Huggingface's Beam Search Visualizer.

from from

score Total :

-L6417

-2.8370

-3,2004

Token|Step score Total scor

-1,6046

could 35602

have

-3,5777

was

Token| Step score

-2,5741

in still

not

-31550

-3.8762

-4.0389

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000180_1c7faa95de0cd60259b40760b77d43ce65066162e895235d6799bbf3db8a87b0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000181_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Test Time Compute (2/2)

- To select the best output, one option is to select the one with the highest probability:

- Equivalently, in logprobs:

- To avoid biasing the selection towards short phrases, we can use the average logprobs by dividing the previous equation by the number of tokens.
- The less robust a model is, the more we can benefit from repeated outputs. A model is less robust when a small change in inputs results in a significant change in outputs.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000182_8f7d434d24ea6bfe41194f546959809c4171140175a7231493c0fa9feeb7a9a3.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000183_012279a03ab4e88851b7f932decebf7b9d777ce6ee9b3d601fe4cdd70097fbf9.png)

## Structured Outputs

- Tasks requiring structured outputs
- Semantic parsing: convert natural language to structured, machine-readable format. E.g., text-to-SQL.
- Classification where the outputs need to be valid classes.
- Tasks whose outputs are used by downstream applications
- The task "write an email" may not require a structured output, but the email provider requires JSON.
- Particularly important for agentic workflows.
- Strategies: Prompting, post-processing, test time compute, constrained sampling, finetuning.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000184_012279a03ab4e88851b7f932decebf7b9d777ce6ee9b3d601fe4cdd70097fbf9.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000185_762cb59b9bf6e14299b33a897574f2fdf2da1959ada9e19d8c35ade4d8f29510.png)

## The Probabilistic Nature of AI

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000186_d27c396d8868dddcf538e431b3d9b0b28ae3fd71cf68924a6b4ebf555fb904ba.png)

## The Probabilistic Nature of AI

- The way that an AI model samples its responses makes them probabilistic.
- This probabilistic nature can cause:
- Inconsistencies: a model generates very different responses for the same or slightly different prompts.
- Hallucinations: a model gives a reponse that isn't grounded in facts.
- Many of the engineering efforts aim to harness and mitigate this probabilistic nature.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000187_e14f801acfc2fc59baf5e1e5d2ee3880431af66e4efd2a4fb989266ed9ca8ada.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000188_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Playground

Load a preset....

Save

View code

Share

(1) Dogs are loyal.

(2) Dogs can be dangerous.

Playground

Load a preset...

Save

View code

Share

(1) Dogs are loyal.

(2) Dogs can be dangerous.

please describe the link between (1) and (2).

describe the link between (1) and (2).

## Inconsistencies

are loyal to their owners and will protect them from danger. This can make them

Model inconsistencies happen in two scenarios:

- Same input, different outputs.
- Slightly different inputs, drastically different outputs.

[(OpenAI, 2022)](https://community.openai.com/t/getting-inconsistent-results-with-same-prompts/14353)

V

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000189_fbc7b76d4f005e4d2b653fe7905c355fc420fad7be1c01d2c3548b14c9320ad6.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000190_9062cae754569e56018824b1f89e6b2776a46af9952c3c615b7831057c1b1189.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000191_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Strategies to Address Inconsistent Results

- Cache answers.
- Fix model sampling variables such as temperature, top-k, top-p.
- Fix the random seed.
- Prompting techniques and memory systems.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000192_fce1a147f20e602a32f3f265e24969d66b33e57288978aacbfa5c69a1d033b2a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000193_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Hallucinations

- Hallucinations are fatal for factuality.
- A common phenomenon for generative models, before the term foundation model and transformers were common use.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000194_fda1f80429f2281212e084be435f607603a333e3ae00072a3fa502d9c547b184.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000195_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Two Hypothesis for Hallucinations

- A model hallucinates because it cannot differentiate between the data it has seen during training and the data that it produces.
- Snowballing hallucinations: This can happen when a model makes an incorrect assumption and continues to hallucinating to justify this initial error.
- Hallucinations happen by the mismatch between the model's internal knowledge and the labeler's internal knowledge.
- When a labeler has better knowledge about a subject, knowledge that is not present in the model, and embeds it in the SFT process, we are teaching the model to hallucinate.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000196_c383e3a71858907f8650d39e5302769b976000571bca876c36b8ec1ef1d5858c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000197_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Strategies

- Verification: require from the model to produce the sources that it used to create the response.
- Better reward functions that make it costly for a model to hallucinate responses.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000198_e205098cfb08ee232c1c30b5842a54e64346a3de379e2692cb7ab7a034cb14f2.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000199_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## AI Engineering and the Shoggoth

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000200_058baf86781bf63641367e4f8e94b3a38a84060bc359bd59b2c9d25cc77d9bd6.png)

Low quality data

Text e.g. Internet data

Optimized for text completion

High quality data

Demonstration data

Finetuned for dialogue

Language

Supervised

## If you squint...

Scale

May '23

Examples sourced

Bolded: open

If you squint [this figure] looks very similar to the meme depicting the monster Shoggoth. (Huyen, 2025) tokens (prompt, response) GPT-x, Gopher, Falcon, Dolly-v2, Falcon-Instruct

Human feedback

Comparison data

Trained to give a scalar score for

(prompt, response)

Prompts

Optimized to generate responses that maximize

scores by reward model

Classification

Reward model

100K - 1M comparisons

(prompt, winning\_response, losing\_response)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000201_6f5f6ccb2e87d1c742ef55b3c60f18bc3d814c4a32fde6e278aaa99c7c5fef27.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000202_6007f571335d36fdc0136cbc37bb983d2db2b5570a63acbddb44108760e8fc05.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000203_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

RLHF

Supervised

Fine tuning

RLHF

(cherry on top i)

Unsupervised

Learning

Shoggoth is a potent metaphor that encapsulates one of the most bizarre facts about the A.I. world, which is that many of the people working on this technology are somewhat mystified by their own creations. They don't fully understand the inner workings of A.I. language models, how they acquire new abilities or why they behave unpredictably at times. They aren't totally sure if A.I. is going to be net-good or netbad for the world. (Roose, 2023)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000204_5ce553f6baee10716633c707f9a647919fb38facdbc1e6ada0d163f5e5609595.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000205_073449f285fa62d8e9b08945e7e26b639374d22262e4311d1c81c3db1caa0a82.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000206_67629118e1de509f4e81d597b0922f04f23d1d444e723f8fa8cc2ece97b15acf.png)

## References

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000207_4c3fcfb696b22c63bca69129d7148c53da90d3edfc49582cb35652f00dd2c52a.png)

## References

- Bommasani, Rishi, et al. "On the opportunities and risks of foundation models." arXiv:2108.07258 (2021).
- Dodge, Jesse et al. 'Documenting the English Colossal Clean Crawled Corpus.' arXiv:2104.08758 (2021).
- Huyen, Chip. Designing machine learning systems. O'Reilly Media, Inc., 2022
- Baack, Stefan, and Mozilla Insights. "T raining data for the price of a sandwich." Retrieved May 9 (2024): 2024. (URL)
- Hoffmann, Jordan, et al. "T raining compute-optimal large language models." arXiv:2203.15556 (2022).

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000208_5bbe6a4fa589928c5f90fa8b94d218c8c99beba8c30c32fad9487685a6c63ad2.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000209_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## References (cont.)

- [Olah, Chris. Understanding LSTM Networks. (colah.github.io, 2015)](https://colah.github.io/posts/2015-08-Understanding-LSTMs/)
- Ouyang, Long, et al. "T raining language models to follow instructions with human feedback." Advances in neural information processing systems 35 (2022): 27730-27744. (URL)
- Roose, Kevin. "Why an octopus-like creature has come to symbolize the state of AI." The New York Times (2023). (URL)
- Schaul, Kevin, et al. Inside the secret list of websites that make AI like ChatGPT sound smart. Washington Post: April 19, 2023 (URL).

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000210_ff30138f1d40f6729e77ce8c59d262f5b461e55e468193d3ad822761d68b7ee0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000211_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## References (cont.)

- Vaswani, Ashish et al. "Attention is all you need." Advances in neural information processing systems 30. arXiv:1706.03762(2017).
- Jones, Elliott. "Foundation models in the public sector." Ada Lovelace Institute, October. Accessed August 30,2025: 2023.
- Tunstall, Lewis, Leandro Von Werra, and Thomas Wolf. Natural language processing with transformers. "O'Reilly Media, Inc.", 2022.
- Howard, Jeremy, and Sebastian Ruder. "Universal language model fine-tuning for text classification." arXiv:1801.06146 (2018).

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000212_0b499a43136691aca73e006c9da3d19821b030e39a78c63dd16d7439c309dffb.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/02_foundation_models_artifacts/image_000213_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)