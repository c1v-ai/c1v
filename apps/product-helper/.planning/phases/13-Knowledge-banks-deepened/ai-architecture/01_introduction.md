## Deploying AI

## Introduction to AI Systems

$ echo "Data Sciences Institute"

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000000_ea599e14d4588c33921df8159984cb8ff5dd32f82a2ce9f56bb94a5c8d07e7ce.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000001_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Introduction

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000002_49560bf1e9ba29234af061f7636227a44526b692eb8a88cfe3388c9019a04ecd.png)

Agenda

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000003_818130d666454ece767016a874b4863e60c0d4931ba94e31454818182b3d8eee.png)

## Agenda

- What is an AI System ?
- Use cases and planning an AI application
- The AI engineering Stack

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000004_41e2b137372a24a3c6f88f1dab37bdc26e0b9a2b558a63b1ec84a17ac5bdc0d9.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000005_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

O'REILLY®

## AI Engineering

We will be covering Chapter 1 of AI Engineering, by Chip Huyen.

Chip Huyen

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000006_139ac68911445b897081e7f75958cd9f0032aa8c52693da342c9465992ff4e5f.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000007_307713a6f7a6611b8d98c7458bc4c17068ac0d477130682ce03ad4575c31e961.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000008_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## What is an AI System ?

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000009_949ecb407eb756ed8aed83c4bf7262e7f5f524327dee4631b6df702fdb1d395c.png)

## What is an AI System ?

- What makes AI different ?
- What makes AI engineering different ?
- Foundation models
- Language models
- Self-supervision
- From language models to foundation models
- From foundation models to AI engineering

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000010_6c2b76237d4fbbe9dcb3acba18b861b241cad379570cd0c99c7aa0b699c18de7.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000011_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## What is an AI System ?

- It is a system that uses foundation models to perform tasks.
- Many principles of productionizing AI applications are similar to those applied in machine learning engineering.
- The main difference between an AI and ML systems is that AI systems adapt a pretrained, complex model to perform specific tasks, while ML systems train ML models to learn specific tasks.
- The availability of large-scale, readily available models affords new possibilities, and also carries risks and challenges.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000012_7f260593615f05ecbf1d0ea629584cf6efdb6cf7187fdb3e6ee30db54951178b.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000013_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

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

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000014_e97ba6b9d6fbe0172bc3d76be327950380ae22e29270c5fed34c7f0a9a84bc87.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000015_c0b91c811a6afd26c37016fa3674ed522e2ddc469cca2dc5102f25ca47e05ae0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000016_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## What Makes AI Different ?

- AI is different because of scale.
- Large Language Models (LLMs) and other Foundation Models (FMs) follow a maximalist approach to creating models: more complex models are trained on more data as more compute and storage become available.
- FMs are becoming capable of more tasks and therefore they are deployed in more applications and more teams leverage their capabilities.
- FMs make it cheaper to develop AI applications and reduce time to market.
- FMs require more data, compute resources, and specialized talent.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000017_c48ac22ac31bcaa80779ea43be65996d36ad8901b1923854dc41e5a3b840ee22.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000018_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Parameters in notable artificial intelligence systems

Parameters are variables in an Al system whose values are adjusted during training to establish how input data gets transformed into the desired output; for example, the connection weights in an artificial neural network.

Number of parameters

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

Jul 2,1950 Apr 19,1965

Data source: Epoch (2025)

Note: Parameters are estimated based on published results in the Al literature and come with some uncertainty. The authors expect the estimates to be correct within a factor of 10.

· Academia · Academia and industry collaboration

Industry

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000019_801e7d6c5767a3423b551176ff08f73b9e0b4044c7b474628057a5db80809bf7.png)

11

·

Our World in Data

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000020_3cea13a58ba4c7f0dbffc78934f0941f48377e43f9060326a1b8824254c414dc.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000021_b9d5b7d636331560069a1abfe9952482e41da894c3a564e6caf25b69d0aa2823.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000022_fbeacd3b42fe30f2f2b6249d11c4b19145af947c39fcd458b9c06b4ecfa0c20e.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000023_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

Datapoints used to train notable artificial intelligence systems

Each domain has a specific data point unit; for example, for vision it is images, for language it is words, and for games it is timesteps. This means systems can only be compared directly within the same domain.

Training datapoints

100 trillion

1 trillion

10 billion

100 million

1 million

10,000

100

Jul 2, 1950

Apr 19,1965

Data source: Epoch (2025)

·

Our World in Data

· Biology · Games

Image generation

Language

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000024_c20a4000723ac299f87f056f13c3ec623f65f619b3f9afcb682dcf8438792415.png)

UNIVERSI

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000025_edcef19e800702e4a4679950007830a6a982e9f904c3baaab724d6f0cd6ade33.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000026_b9d5b7d636331560069a1abfe9952482e41da894c3a564e6caf25b69d0aa2823.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000027_40de3102dd2ed136a006dff108bbdfe1d6f0c2687c96218bf3c391c0931b4421.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000028_d14631f5c713bc400396877fb73e94f1dd492741c4970cf5d961eb45c78fbf23.png)

## What Makes AI Engineering Different ?

- FMs are costly to create, develop, deploy, and maintain. Only a few organizations have the capabilities to do so and typical applications are built upon Models-as-a-Service.
- AI Engineering is the process of building applications on top of readily available models.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000029_35713d0ac5f28b751dd9943a583f6c5695d0e4a33921395ab2c420402d18d1dd.png)

Cats are

Context

Likely next word

## Language Models

- FMs emerged from LLMs which developed from language models.
- Language models are not new, but have recently developed greatly through selfsupervision .
- A language model encodes statistical information about one or more languages. Intuitively, we can use this information to know how likely a word is to appear in a given context.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000030_ece7b5d2317b8ad7df2c8d593f43d73ae5015f41ba30968ad677ab0182ab9aa9.png)

a furry.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000031_5436812c2c2dd74bb5f3d46338beffb48fd10da752832953bcd65a6c0f8b14af.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000032_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

In the beginning the

Universe was created.

This had made many people very angry and

Tokenizer

## Tokenization

regarded as a bad move.

In the beginning the Universe was created.

This had made many people very angry and has been widely regarded as a bad move.

Text

[637, 290, 10526, 290, 53432, 673, 5371,

558, 2500, 1458, 2452, 1991, 1665, 1869,

36167, 326, 853, 1339, 20360, 42721, 472,

261, 4790, 5275, 13]

- The basic unit of a language model is a token.
- Tokens can be a character, a word, or a part of a word, depending on the model.
- Tokenization: the process of converting text to tokens.
- The set of all tokens is called vocabulary .

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000033_d55b3c9457730315b06d8d92272623b9faf591795ef60d4a65599b832df3f30d.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000034_9f8e641428a70e25327ffb99014f2552ea832a0bff89ae86f6347b6309185acf.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000035_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Why use tokens ?

- 1 . Tokens allow the model to break words into meaningful components: "walking" can be broken into "walk" and "ing"
- 2 . There are fewer unique tokens than unique words, therefore the vocabulary size is reduced
- 3 . Tokens help the model process unknown words: "chatgpting" can be broken down to "chatgpt" and "ing"

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000036_42400ee4c274963d859c927888bb764d2e983cd1052487e0280a615aa88df144.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000037_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Autorregressive LM

Yesterday all my troubles seemed so far [prediction]

Context

(previous tokens only)

Masked LM Yesterday all my [prediction] seemed so far away

Context

## Types of Language Models

There are two types of Language Models (LM): Autorregressive LM and Masked LM.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000038_85f21c26c931a5eb2972efdbd55a61494397fb0246c51675f24ae30b530f079e.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000039_7558c6336da7f92d6a335b611c8b98a5be5eb81f1382bac374deb3eb09559077.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000040_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Masked Language Models

- Masked language model: predicts missing tokens anywhere in a sequence using only the preceding tokens.
- Commonly used for non-generative tasks such as steniment analysis, text classification, and tasks that require an understanding of the general context (before and after the prediction), such as code debugging.
- [Example, BERT (Devlin et al., 2018).](https://arxiv.org/abs/1810.04805)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000041_a64fa3e59bbae1567d0d1239dc68ac2694d2eb885274edc8ec36f8da7f7e0b6c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000042_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Autorregressive Language Models

- Autorregressive language model: trained to predict the next token in a sequence.
- Autorregressive LMs can continually generate one token after another and are the models of choice for text generation.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000043_d5e7ffa4b3c01080f1492d19976b780dcd2810e2958e27f04c51ddb3659327a4.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000044_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Yesterday all my troubles seemed so far away

That's the opening line of "Yesterday" by The Beatles, one of their most iconic songs. It's

## Completion is a Powerful T ask

melancholy and vulnerability.

- The outputs of language models are open-ended.
- Generative model: A model that can generate open-ended outputs.
- An LM is a completion machine: given a text (prompt), it tries to complete the text.
- Completions are predictions, based on probabilities, and not guaranteed to be correct.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000045_397f978a514062b149b2ebc058be5e0087c60f3ce16e74835d05abf20375bdc6.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000046_93ed72c333fbb3b99b2258ea5be6efb3563c6d5f1ec277c74e7f199e1843f6a7.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000047_012279a03ab4e88851b7f932decebf7b9d777ce6ee9b3d601fe4cdd70097fbf9.png)

~ 298

Noahpinion

## Completion T asks

NOAH SMITH AND ROON

DEC 01, 2022

Many tasks can be thought as completion: translation, summarization, coding, and solving math problems.

What's common to all of these visions is something we call the 'sandwich' workflow. This is a three-step process. First, a human has a creative impulse, and gives the AI a prompt. The AI then generates a menu of options. The human then chooses an option, edits it, and adds any touches they like. (Smith, 2020).

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000048_2319581958359cb455829299987bed55c37258edc68cd51d997f17494ff4dfa9.png)

Q

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000049_5a2d8f5323d379d4d023eedf9a797ed3d56d3d0b1c82b623dc7889adab4714ab.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000050_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Self-Supervision

- Why language models and not object detection, topic modelling, recommender systems, or any other machine learning task ?
- Any machine learning model requires supervision: the process of training a machine learning model using labelled data.
- Supervision requires data labelling, and data labelling is expensive and timeconsuming.
- Self-supervision: each input sequence provides both the labels and the contexts the model can use to predict these lables.
- Because text sequences are everywhere, massive training data sets can be constructed, allowing language models to become LLMs.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000051_0c08841273429e7302a8032f7b690a3dcda7e90631ae2effe2b25ff1bd6839b0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000052_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Self-Supervision: an example

| Input                      | Output (next token)   |
|----------------------------|-----------------------|
| <BOS>                      | I                     |
| <BOS>,I                    | love                  |
| <BOS>,I,love               | street                |
| <BOS>,I,love,street        | food                  |
| <BOS>,I,love,street,food   | .                     |
| <BOS>,I,love,street,food,. | <EOS>                 |

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000053_786a4df4bc6a6418032616836f55726eadc4febf0a0533f8d6c9b04e32e54750.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000054_d14631f5c713bc400396877fb73e94f1dd492741c4970cf5d961eb45c78fbf23.png)

## From LLM to Foundation Models

- Foundation models: important models which serve as a basis for other applications.
- Multi-modal model: a model that can work with more than one data modality (text, images, videos, protein structures, and so on.)
- Self-supervision works for fourndation models, too. For example, labeled images found on the internet.
- Foundation models transition from task-specific to general-purpose models.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000055_653c9613201c9355a611ab3a71d910ffc66469fd9b3e838e9ffc4490f7654367.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000056_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Foundation model use cases

- Coding
- Image and Video Production
- Writing
- Education
- Conversational Bots
- Information Aggregation
- Data Organization
- Workflow Automation

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000057_b7db07a4b9612810dfab0db37846eb7efc2ea0d4e76bb9d03fa870130efed2f1.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000058_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Planning an AI Application

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000059_e4ea26989fcb8e0fd37282a3c4e9fa0b97b09ad0ab4796142dd45fda302e6002.png)

## Planning an AI application

- Use Case Evaluation
- Setting Expectations
- Milestone Planning
- Maintenance

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000060_fe4c3e40454890cec463219617f0221c25088bd0ea23938f86afba6ab3673e8c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000061_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Evaluating Use Cases

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000062_04111a4c2d1d1a51b883fd7281efb62f1a6483a4082443ff0ac0013abb23da0c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000063_6a56600e1bac993d116a08f4c55acfaa3fffc6185bb2655e67a065d294f3abc4.png)

## Why are we doing this ?

- If you do not do this, competitors with AI can make you obsolete.
- Common for business involving information processing and aggregation.
- Financial analysis, insurance, and data processing.
- If you do not do this, you will miss opportunities to boost profits and productivity.
- You are unsure where AI will fit into your business yet, but you don't want to be left behind.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000064_3356b01c3437861148f49d4c463a9a8035cf319152d0d7afdb447b6d2aef320c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000065_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## The Role of AI in the Application (1/3)

## Critical or complementary

- If an app can work without AI, AI is complementary to the app.
- The more critical AI is to the app, the more accurate and reliable the AI must be.
- Example: Face ID would not work without AI-powered facial recognition, but Gmail would work without Smart Compose.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000066_25eba106c566d387f54262503e5d908eedac738067406d2a6651338a9573e912.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000067_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## The Role of AI in the Application (2/3)

## Reactive or Proactive

- Reactive features show their responses to users' requests or actions.
- Proactive features show responses when there is an opportunity.
- Reactive features are many times expected to happen fast (low latency), proactive responses can be precomputed and shown opportunistically (latency is not as important).

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000068_28c1921e6b3f51f3212c5f24087853b7025b3c2551054b76da3fbb940f81f1e8.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000069_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## The Role of AI in the Application (3/3)

## Dynamic or Static

- Dynamic features are updated continually with user feedback.
- Static features are updated periodically.
- Example: Face ID needs updating as people change appearance.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000070_5b57e1d6bd6f24997917413e8ad86185cd478bc48a56715a3996d5411842994c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000071_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## The Role of Humans in the Application

- Will AI provide background support to humans, make decisions directly, or both ?
- Modes of interaction:
- AI shows several responses that human agents can reference to write faster responses.
- AI responds only to simple requests and routes more complex requests to humans.
- AI responds to al requests directly, without human involvement.
- Involving humans in AI's decision-making process is called human-in-the-loop.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000072_22aa6146b2ff141ed97de8bfa0ca49424777d03db569db24b7c29b8c844750ed.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000073_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## The Crawl-Walk-Run Model

Microsoft (2023) proposed a framework for adoption of AI automation in products:

- 1 . Crawl: human involvement is mandatory.
- 2 . Walk: AI can directly interact with internal users.
- 3 . Run: increased automation, potentially interact with external users.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000074_03c4f7caaa89d740db81f687243302e4bd118bb6f533472144dc95e0023282e7.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000075_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Emerging Open Al Deployment Patterns

Phase 1

Use Cases Inside the Organization

Internal Copilot deployments

Summarization/Analysis

· Customer engagement summarization

Generate financial summaries

Learning assistant - discovery and knowledge mining

Internal automation of business processes

Categorization/Extraction

· Employee knowledge management

Internal communication

· Task automation and scheduling

Content/image generation

Marketing content and image generation

Internal onboarding and content generation

New product description

· Code generation and documentation

Human 'in the loop' review of generative content

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000076_a04118b8fbedf095405366db38ecdbe6c9ba36a578f9e853150e517e0819e0ae.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000077_1ba35c6127440e224d5f59d2ab8b6377cef57ce9bfc7fff6968e8b25437c2c39.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000078_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## AI Product Defensibility

- Low barrier to entry is both a blessing and a curse.
- An AI product is a layer between the foundation model and the user.
- If the foundation model expands its capabilities, the intermediate layer may no longer be needed.
- Three types of competitive advantages: technology, data, and distribution.
- Technology and distribution can be easily achieved by large organizations.
- Data competitive advantages are more naunced: large organizations can have large current data sets, but may lack data on emerging activities.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000079_4b4e287afd39d4fb434fbffcb4f52f16aeea37e334ef44c66f3e8f022de51398.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000080_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Setting Expectations

To ensure a product is not put in front of users before it is ready:

- Quality metrics to measure the quality of the chatbot's responses.
- Latency metrics including TTFT (Time T o First T oken), TPOT (Time Per Output T oken), and total latency.
- Cost metrics: how much it costs per inference request.
- Other metrics: interpretability and fairness.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000081_55ffc90c9db4bf0124212c2f0b5ce1fb1175253c10a9c9197ecc52a8cc60ec41.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000082_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Milestone Planning

- The stronger off-the shelf models, the less work you will have to do.
- Planning an AI product must account for the last mile challenge:
- Initial success with foundation models can be misleading.
- The effort required to build a product after the initial demo can be significant.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000083_2c8df026aa9eb306a8d8f62905aae0164e8aea40b70b5814215ae2c5c38cc565.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000084_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Maintainance

- Think about how the product will change over time.
- Added challenge of rapid progress of AI itself.
- Constantly evaluate the cost/benefit of each technology investment.
- Technologies surrounding AI are considered national security issues for many countries, meaning resources for AI can be regulated: compute, talent, and data.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000085_57a6b60b0c6beed7a1dc6cde3a536f0f5810d217bd23caa1955d7bf448c69b1c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000086_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## The AI engineering Stack

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000087_644acaf1fbdcad20c1bec0d0c1c89e2eb68f3f852fc28e723d91c6308ba241fb.png)

## The AI engineering Stack

- Three layers of the AI Stack
- AI Engineering vs ML Enginering
- AI Enginnering vs Full-Stack Engineering

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000088_17d569de7f37fcbb3363baf2f5ac0b3769752f779cc4a1eca552260441dc5404.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000089_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Three Layers of the AI Stack

Model development

Infrastructure

Prompt engineering

Al interface

RAG

Evaluation

Dataset engineering Inference optimization Modeling &amp; training

Compute management Data management Serving

Monitoring

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000090_8e437873f8548c45d38f01c1d029bb86174c553f5c6b68707305b10e6ea2f81e.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000091_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Three Layers of the AI Stack (1/3)

## Application Development

- Provide a model with good prompts and necessary context.
- Prompt engineering is about getting AI models to express the desirable behaviours from the input alone, without changing model weights.
- AI Interface: create an interface for end users to interact with the AI application.
- Standalone web, desktop, and mobile apps
- Browser extensions
- Chatbots integrated to chat apps (Slack, WhatsApp, etc.)
- Embedded into products (VSCode, Shopify, Discord, WeChat, etc.)
- Requires rigorous evaluation. For enterprise use cases, requires mapping to business objectives and business performance metrics. 43

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000092_c6f937a90401790b436e8478f218be032065fd35b7b5228845f225656234c41f.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000093_012279a03ab4e88851b7f932decebf7b9d777ce6ee9b3d601fe4cdd70097fbf9.png)

## Three Layers of the AI Stack (2/3)

## Model development

- Tooling for developing models, including frameworks for modeling, training, finetuning, and inference optimization.
- Dataset engineering: curating, generating, and annotating data needed for training and adapting AI models.
- Inference optimization means making models faster and cheaper.
- Requires rigorous evaluation.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000094_39a698d08a3d65b80ccd23cb3b5ed8f070816844ab570d59b865b48abe1b8098.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000095_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Three Layers of the AI Stack (3/3)

## Infrastructure

- Tooling for model serving.
- Manage data and compute.
- Monitoring.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000096_374022dcb5e019902db20573a38faa034d29480f4018833080efd7f6ff896ca8.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000097_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## AI Engineering vs ML Engineering

- Without foundation models, one must train a model for an application.
- With AI engineering, we use a model someone else has trained.
- Focus less on modelling and training, and more on model adaptation.
- AI engineering works with models that are costlier.
- AI models are bigger, consume more compute, and have higher latency than traditional ML.
- There is a stronger focus on inference optimisation.
- AI engineering works with models that can produce open-ended outputs.
- Open-ended outputs give AI the flexibility to be used in more tasks.
- Open-ended outputs are harder to evaluate.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000098_ba70297a14136c369f3af00b333104bbb95edea43c9b3883ae8293eece11f5f4.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000099_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## AI Engineering is about Adaptation

- AI engineering differs from ML engineering in that it's less about model development and more about adapting and evaluating models.
- Adaptation techniques fall in two categories:
- Prompt-based techniques : adapt a model without updating the model weights. Ex., prompt engineering.
- Finetuning : requires updating model weights. We adapt a model by making changes to the model itself.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000100_834da39217fbe3a364f58bea4de0d2ad2131ae31b63473aee870fb053a214be6.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000101_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Responsibilities Change with FMs

| Category               | Building with traditionalML                                | BuildingwithFMs                                                                                                |
|------------------------|------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| Modelingand training   | MLknowledgeisrequired for traininga model from scratch     | MLknowledgeisnice-to-have,nota must-have                                                                       |
| Dataset engineering    | Moreaboutfeature engineering, especially with tabular data | Less about feature engineeringandmoreaboutdata deduplication,tokenization,context retrieval,andquality control |
| Inference optimization | Important                                                  | Even moreimportant                                                                                             |

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000102_2b56cdcd15cf41b31695e31f7a67b96556a5b009a8d5ac48a9e90840823c3966.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000103_d14631f5c713bc400396877fb73e94f1dd492741c4970cf5d961eb45c78fbf23.png)

Traditional ML

Data/ML engineers

LLM enabled AI

AI engineers

Data

Product

&gt; Model - if successful &gt; Data -

if scaling

## AI Engineering Changes the Order of Decisions

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000104_8be3b4ab9a2ebb46a4e6eb4f594e6264355723e4fd8b80d48bb0f89bcc71c5eb.png)

[Illustration from "The Rise of the AI Engineer" (Wang, 2023)](https://www.latent.space/p/ai-engineer)

&gt; Product

&gt; Model

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000105_fdc44b4acfd11c26a368699d0325ee419802df857bb00d8ba3ce6ce53fa2810b.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000106_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## AI Engineering vs Full-Stack Engineering

- Focus on application development, espcially on interfaces, brings AI closer to fullstack engineering.
- ML engineering is Python-centric. There is an emergence of JavaScript APIs for AI: LangChain.js, T ransfomer.js, OpenAI's Node library, Vercel's AI SDK.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000107_79ab40b13535b63da6b3d8f277b549655acb14987ac63566bf60e7aaae443b02.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000108_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Data/Research constrained

Product/User constrained

## AI Engineering and Application Development

- evals

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000109_7c9c170500450633c3381d0295a53923b25607db66c7847cdd8f68c8a6f71172.png)

[Illustration from "The Rise of the AI Engineer" (Wang, 2023)](https://www.latent.space/p/ai-engineer)

API

&gt;

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000110_d943b04c8e20f775b4a467dfd04be79be498f62a1c7cd5172c1c84bbb574f010.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000111_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## References

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000112_da0ffbf3b7b37cd00d57a434efa717c336a8a0e62726a68e7842a94151f95d64.png)

## References

- Bommasani, Rishi, et al. "On the opportunities and risks of foundation models." arXiv:2108.07258 (2021).
- Devlin, Jacob, et al. "Bert: Pre-training of deep bidirectional transformers for language understanding." In Proceedings of the 2019 conference of the North American chapter of the association for computational linguistics: human language technologies, volume 1 (long and short papers), pp. 4171-4186. 2019.
- Guy, Oliver. From discussion to deployment: 4 key lessons in generative AI. Microsoft Blog, October 23, 2023 (URL).
- Huyen, Chip. Designing machine learning systems. O'Reilly Media, Inc., 2022
- Smith, Noah and Roon. Generative AI: autocomplete for everything. Dec. 1, 2022 (URL)
- Wang, Shawn. The Rise of the AI Engineer, 2003 (URL)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000113_d9cc6a714a316762c723647b49cf92a97634a579f9b84fe24840a49bb25f7567.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/01_introduction_artifacts/image_000114_012279a03ab4e88851b7f932decebf7b9d777ce6ee9b3d601fe4cdd70097fbf9.png)