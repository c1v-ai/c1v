## Deploying AI

## Finetuning

$ echo "Data Sciences Institute"

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000000_ea599e14d4588c33921df8159984cb8ff5dd32f82a2ce9f56bb94a5c8d07e7ce.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000001_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Introduction

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000002_49560bf1e9ba29234af061f7636227a44526b692eb8a88cfe3388c9019a04ecd.png)

Agenda

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000003_818130d666454ece767016a874b4863e60c0d4931ba94e31454818182b3d8eee.png)

## Agenda

- Finetuning overview
- Finetuning techniques

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000004_41e2b137372a24a3c6f88f1dab37bdc26e0b9a2b558a63b1ec84a17ac5bdc0d9.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000005_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Introduction to Finetuning

- Finetuning is the process of adapting a model to a specific task by adjusting its weights.
- Unlike prompt engineering or RAG, which guide models via inputs or external context, finetuning changes the underlying parameters.
- It can enhance domain-specific capabilities, improve safety, and strengthen instruction-following.
- Finetuning requires significant resources, including compute, data, and ML expertise.
- A memory-efficient approach called parameter-efficient finetuning (PEFT) has become dominant.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000006_c0b91c811a6afd26c37016fa3674ed522e2ddc469cca2dc5102f25ca47e05ae0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000007_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Finetuning vs. Prompting

- Prompt-based methods adapt models by providing instructions, examples, or external information.
- Finetuning directly modifies the model' s weights to embed new behaviors.
- Prompting requires little ML knowledge, while finetuning requires training expertise.
- Prompting is usually the first step; finetuning is attempted when prompting is insufficient.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000008_eae955fd63dffec5501b24ae1f5f2d9c226d0d0c4797f83d5ca115b2b342cb58.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000009_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Finetuning Overview

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000010_7f260593615f05ecbf1d0ea629584cf6efdb6cf7187fdb3e6ee30db54951178b.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000011_1849e3a3014cbf94812d3cd916acc6390b3413a551263942b8baf53c3f432756.png)

## Transfer Learning Foundations

- Finetuning is a form of transfer learning .
- Transfer learning means reusing knowledge from one task to accelerate learning on a related task.
- Foundation models exemplify transfer learning by transferring pre-training knowledge to specialized downstream tasks.
- For example, pretraining on text completion enables adaptation to legal QA, coding, or SQL tasks.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000012_eae955fd63dffec5501b24ae1f5f2d9c226d0d0c4797f83d5ca115b2b342cb58.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000013_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Sample Efficiency

- Training from scratch requires massive data, often millions of examples.
- Finetuning leverages existing base model knowledge, reducing the amount of taskspecific data needed.
- A few hundred high-quality examples can sometimes be sufficient.
- This efficiency is one of the key advantages of finetuning over training from scratch.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000014_eae955fd63dffec5501b24ae1f5f2d9c226d0d0c4797f83d5ca115b2b342cb58.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000015_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Types of Finetuning

- Continued pretraining (self-supervised finetuning): extends pretraining with domain-specific raw data.
- Supervised finetuning (SFT): adapts models with instruction-response pairs.
- Preference finetuning (RLHF/DPO): aligns outputs with human preferences.
- Infilling finetuning: trains models to fill in blanks, useful for text editing and debugging.
- Long-context finetuning: extends maximum context length, often requiring architectural changes.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000016_5a2d8f5323d379d4d023eedf9a797ed3d56d3d0b1c82b623dc7889adab4714ab.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000017_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## When to Finetune

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000018_50ff9af7869e8bad547cebefd9fc091ec940c6c04fb24c22cddd28027456548d.png)

## Reasons to Finetune

- Finetuning can improve domain-specific performance when a base model is insufficient.
- It helps enforce strict output formats like JSON or YAML.
- It can mitigate harmful biases by training on carefully curated datasets.
- Smaller models can be finetuned to imitate larger ones, enabling efficiency gains through distillation .
- Finetuned small models can outperform larger unadapted models on specialized tasks.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000019_5a6c73ac6b7bd8246eba3fd92b9804d7e52f04777f5d4829700c9b1eda82320b.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000020_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Examples of Finetuning Benefits

- Finetuning SQL models for less common dialects or custom queries.
- Grammarly finetuned Flan-T5 models with 82,000 examples, outperforming a GPT-3 variant despite being 60 × smaller.
- Bias reduction studies show finetuning can improve fairness across gender and racial dimensions.
- Finetuned models often offer reduced latency and costs compared to larger generalpurpose models.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000021_d943b04c8e20f775b4a467dfd04be79be498f62a1c7cd5172c1c84bbb574f010.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000022_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Reasons Not to Finetune

- Finetuning requires high up-front data, compute, and expertise.
- A finetuned model may improve at one task but degrade in others.
- High maintenance is required to keep up with newer, stronger base models.
- In many cases, well-crafted prompts and RAG can achieve sufficient results.
- Finetuning should not be the first step; systematic prompting should be tried first.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000023_c9a3138d4c57a305e0a79418a51b09bef35a3f5d34162ec3347b8d56e6ee6cb9.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000024_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Finetuning vs. RAG

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000025_c27985c9a6e97c6bedf47c8bbe9a77884ce104f65f4b6ac293b04e1e03d147d0.png)

## Finetuning vs. RAG: Failures

- Information-based failures should be addressed with RAG.
- Behavioral failures may require finetuning.
- RAG provides models with external, up-to-date, or private information.
- Finetuning improves adherence to formats, styles, and expected outputs.
- In short: RAG is for facts, finetuning is for form .

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000026_12107557e9d16af1837d23d926ec71b41e1a0177975f7d58b028e67690c5eb03.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000027_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Combining RAG and Finetuning

- Both methods can complement each other.
- Studies show RAG often outperforms finetuning for knowledge-heavy tasks.
- RAG on top of finetuned models can improve performance in some cases.
- However, sometimes RAG alone is more effective than combining with finetuning.
- Application developers must evaluate both approaches for their specific use case.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000028_93f81815292f9d5627768b9d601efbdba2c33ba36171e022e2ea9386a1845b83.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000029_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Memory Bottlenecks

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000030_8527f27a2ffc1ede11937515f106c92b462a3a198be41afd45589361d3c351f8.png)

## Why Memory Matters

- Finetuning is far more memory-intensive than inference.
- Memory is consumed by weights, activations, gradients, and optimizer states.
- The number of trainable parameters determines the finetuning memory footprint.
- Techniques like parameter-efficient finetuning (PEFT) reduce memory costs.
- Quantization is another powerful way to lower memory needs.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000031_915c95b1f5ea4663e5665cdf358eb503811bbc73ff237e352bae281612e7b43d.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000032_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Memory Math

- Inference requires memory primarily for weights and activations.
- Training requires additional memory for gradients and optimizer states.
- Example: a 13B model in FP16 needs ~31 GB for inference.
- With full backpropagation and Adam optimizer, training can require over 100 GB.
- Gradient checkpointing can reduce memory at the cost of extra compute.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000033_380788d9527013d5a763fe6b526f206d5b9c8f39483a777e2677298f742586bf.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000034_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Numerical Precision

- Models use floating-point or integer formats to represent values.
- FP32 (single precision) is memory-heavy; FP16 and BF16 are more efficient.
- INT8 and INT4 formats are emerging for even greater efficiency.
- Using the wrong precision format can significantly degrade model quality.
- Hardware support (GPU/TPU architecture) influences which formats are practical.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000035_030bf3d17893f265141d6f20ef752c6927ce2a9fef2a09df823aa82ca6d6cdb2.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000036_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Quantization

- Quantization reduces precision to shrink memory requirements.
- A 10B model in FP32 needs 40 GB; the same model in FP16 needs 20 GB.
- Post-training quantization (PTQ) is the most common approach.
- Serving models in 8-bit or 4-bit precision is increasingly common.
- Quantization can be applied to weights, activations, or both.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000037_56adabd592c99f6415155763753188739a04257f0e6ea97838fb2a0569472c9a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000038_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Parameter-Efficient Finetuning (PEFT)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000039_958726896aa95f9cdab85be1c3f8207d7f7b5c2c9f85215f47612dc178f644f5.png)

## Introduction to PEFT

- PEFT techniques reduce the number of trainable parameters.
- They make finetuning feasible on limited hardware.
- PEFT is widely adopted because it balances performance with efficiency.
- Examples include adapters, LoRA, and prefix tuning.
- These methods allow small changes while keeping most parameters frozen.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000040_653c9613201c9355a611ab3a71d910ffc66469fd9b3e838e9ffc4490f7654367.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000041_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Transfer Learning and Fine Tuning

- In many applications, one cannot access large amounts of labelled text data to train a model.
- Transfer learning allows to apply the information learned from one task to another.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000042_3b61c64012c3179d2335576029530e527584ff9cbfa03b75ba1ccea0d565b27e.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000043_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Transfer Learning and Fine Tuning

- ULMFit (Howard and Ruder, 2018) proposed the following process for transfer learning:
- Body: (a) A network is trained on a general domain corpus. The weights of the body learn broad features of the source domain. (b) The full LM is fine-tuned on target task data using discriminative fine-tuning and slanted triangular learning rates (STLR).
- Head: (c) A classifier trained for a specific task. The classifier is fine-tuned on the target task using gradual unfreezing, discriminative fine-tuning and STLR.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000044_49563fa9bfdefc20a0e60ad9b046e076a7a8c9dc24464e6176c136d52345f4f6.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000045_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

Softmax layer

Layer 3

Layer 2

Layer 1

Embedding layer

The gold

Softmax layer

Layer 3

Softmax layer

Layer 3

ni

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000046_340489103f423d170a9c661d1e2d79c0cc14d03140fa6037e1ba877502bad1de.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000047_6050162b536b63f79ccf4fa2d23f65971f0d9870e4cc94f0144ad8feaf53d3ed.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000048_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## LoRA: Low-Rank Adaptation

- Fundamental observation: fine-tuning a dense layer only adds a low-rank weight matrix (delta-W) to the original weight matrix (W).
- Fine-tuning can be simplified to train the low-rank weight matrix delta-W, which has the same number of weights as the original weight matrix W.
- The low-rank matrix delta-W can be expressed as the product of two low-rank matrices, A and B.
- Instead of training the full Body and adding a Head , LoRA requires training a small delta-W with fewer parameters.
- Consequently, LoRA is faster to train and requires less memory.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000049_6a303e9593b30bfb07505519a526d1386897f3c81cffa17c3f3f98c3fbbc2faf.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000050_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

h

Pretrained

Weights

WE Rdxd

d

Figure 1: Our reparametriza-

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000051_c85e2a06e5f90e2f3e4eb004a474b5ef65f13d11d2344f6bf35ede95a51a78b4.png)

tion. We only train A and B.

B = 0

r

A = N (0, 02)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000052_3356b01c3437861148f49d4c463a9a8035cf319152d0d7afdb447b6d2aef320c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000053_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Adapter-Based Methods

- Adapters are small modules inserted into transformer layers.
- They enable training only a subset of parameters.
- Performance often approaches full finetuning with far less memory.
- Adapters can be stacked, shared, or tuned per task.
- They are one of the most popular PEFT techniques.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000054_25eba106c566d387f54262503e5d908eedac738067406d2a6651338a9573e912.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000055_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000056_f92befb8b5491b578318076fb7e2da72e1b3b8a50af741895aabc4baab7078a2.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000057_8692e4c8140a0f119d2ca80dac50d7ca5a52d039b4997f4170db5bd7f0cf3631.png)

## Key T akeaways

- Finetuning modifies model weights, unlike prompting or RAG.
- It enhances instruction-following, safety, and domain-specific performance.
- Finetuning is expensive and memory-intensive, requiring careful planning.
- RAG is often better for information needs, while finetuning is for format and behavior.
- Memory bottlenecks are mitigated with quantization, mixed precision, and PEFT.
- Parameter-efficient finetuning, especially adapter-based methods, has become the standard.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000058_ef030fa97228b4a623de804aa43fef45a5871452f0dd9facc3e8fda1d19cbf26.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000059_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## References

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000060_fa4f0624b0c53fbbc78944d957ee9667aa06f78570430e8faef6a5dfcb3d8c52.png)

## References

- Howard, Jeremy, and Sebastian Ruder. "Universal language model fine-tuning for text classification." arXiv preprint arXiv:1801.06146 (2018).
- Hu, Edward J., et al. "Lora: Low-rank adaptation of large language models." arXiv preprint arXiv:2106.09685 (2021).bridging-the-gap-enhanced-neural-networktechniques-for-ai/).
- Huyen, Chip. Designing machine learning systems. O'Reilly Media, Inc., 2022.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000061_2a70b90ff34a69513eef1d416acab67c0526d49a83432094f87754f87b4f0732.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/07_finetuning_artifacts/image_000062_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)