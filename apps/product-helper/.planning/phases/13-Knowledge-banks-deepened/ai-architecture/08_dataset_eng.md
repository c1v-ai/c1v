## Deploying AI

## Data Engineering

$ echo "Data Sciences Institute"

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000000_ea599e14d4588c33921df8159984cb8ff5dd32f82a2ce9f56bb94a5c8d07e7ce.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000001_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Introduction

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000002_49560bf1e9ba29234af061f7636227a44526b692eb8a88cfe3388c9019a04ecd.png)

Agenda

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000003_818130d666454ece767016a874b4863e60c0d4931ba94e31454818182b3d8eee.png)

## Agenda

- Data curation
- Data augmentation and synthesis
- Data processing

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000004_41e2b137372a24a3c6f88f1dab37bdc26e0b9a2b558a63b1ec84a17ac5bdc0d9.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000005_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Dataset Engineering

- The quality of a model depends heavily on the quality of its training data.
- Even with infinite compute, a model cannot perform well without appropriate data.
- Dataset engineering aims to create datasets that allow you to train the best model within budget.
- As models demand more data, dataset handling requires more talent and infrastructure investments.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000006_c0b91c811a6afd26c37016fa3674ed522e2ddc469cca2dc5102f25ca47e05ae0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000007_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Data-Centric AI

- Data-centric AI focuses on improving AI performance through better datasets.
- Model-centric AI instead emphasizes architectures, model sizes, and training techniques.
- Data-centric practices are increasingly necessary as data becomes the main differentiator of performance.
- High-quality datasets can often matter more than slight architectural improvements.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000008_eae955fd63dffec5501b24ae1f5f2d9c226d0d0c4797f83d5ca115b2b342cb58.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000009_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Training Phases and Data Needs

- Different training phases require datasets with different attributes.
- Pre-training data quantity is measured in tokens.
- Supervised finetuning data quantity is measured in the number of examples.
- Post-training data requires curation tailored to application-specific needs.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000010_c0b91c811a6afd26c37016fa3674ed522e2ddc469cca2dc5102f25ca47e05ae0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000011_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Key Aspects of Dataset Engineering

- Data curation : deciding what data is needed and how much.
- Data synthesis : generating or augmenting data to fill gaps.
- Data processing : cleaning, filtering, and preparing data.
- These steps are iterative and often require going back and forth.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000012_eae955fd63dffec5501b24ae1f5f2d9c226d0d0c4797f83d5ca115b2b342cb58.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000013_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Data Curation

- Data should have essential characteristics: compliant, diverse, high quality, and sufficient.
- Compliance means adhering to laws, regulations, and internal policies.
- Coverage ensures training data represents the variety of real-world problems.
- High-quality data should exhibit the behaviors you want your model to learn.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000014_7f260593615f05ecbf1d0ea629584cf6efdb6cf7187fdb3e6ee30db54951178b.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000015_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Compliance in Data

- Training data must comply with relevant policies, including privacy and PII restrictions.
- Non-compliant data can cause legal, ethical, and operational risks.
- Thinking through compliance early prevents costly rework later.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000016_6d31804974b1ae3c4e5bf6e610bdd1831bfd83bdacc0abb5c50bf50518fc6fc8.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000017_69537736864dbcec0170d6dc6c1aca3471004bc22d74383248c7dbf015a08a29.png)

## Data Coverage

- Data should capture the diversity of usage patterns expected in your application.
- Examples should include long and short instructions, formal and informal queries, and multiple languages if relevant.
- Diversity dimensions include domain, topic, style, and length.
- Llama 3's performance gains were largely driven by improvements in data quality and diversity.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000018_43b6fd79c9a794361faf9327f3f0bc3711050193ba9cfb38d2e92c361950663a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000019_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Data Quality Challenges

- High-quality annotations are always difficult to obtain.
- Chain-of-thought annotations require detailed step-by-step reasoning, which is laborintensive.
- Tool-use data requires careful design or simulation of task execution.
- Human annotations may not always align with efficient model usage.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000020_7cf1b97244c1893d9aae5d3467328740e53fd2deafe624a33d65098b02fe2e07.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000021_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Experimenting with Small Datasets

- Finetuning with small datasets (50-100 examples) can still show improvements.
- Plotting performance against dataset size helps estimate how much data is needed.
- Gains usually diminish as dataset size grows.
- Diversity of tasks can matter as much as the number of examples.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000022_7751f428e2d4c67633438d3a01d7331419ac55ae754b091a51cd1a3f3d241b92.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000023_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Data Acquisition

- Sources of data include public datasets, purchased datasets, in-house annotation, and synthetic generation.
- Data acquisition strategies balance quality, diversity, budget, and compliance.
- User-generated application data often provides the most valuable feedback loop.
- Building a ' data flywheel' can continually improve product performance.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000024_c9a3138d4c57a305e0a79418a51b09bef35a3f5d34162ec3347b8d56e6ee6cb9.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000025_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Annotation Guidelines

- Annotation requires clear, detailed guidelines to ensure consistency.
- Guidelines define what makes a response ' good' or 'bad.'
- Without strong guidelines, annotation quality may drift over time.
- Evaluation data guidelines can be reused for annotation purposes.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000026_d943b04c8e20f775b4a467dfd04be79be498f62a1c7cd5172c1c84bbb574f010.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000027_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Data Augmentation and Synthesis

- Data augmentation modifies real data to create new examples (e.g., flipping an image).
- Data synthesis generates artificial data mimicking real properties.
- Both aim to increase dataset size, diversity, and quality.
- Synthetic data is increasingly common, especially for post-training.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000028_915c95b1f5ea4663e5665cdf358eb503811bbc73ff237e352bae281612e7b43d.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000029_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Synthetic Data Use Cases

- Synthetic data can improve quantity by producing large-scale datasets.
- It can expand coverage by creating examples across domains and tasks.
- It can enhance quality by balancing distributions and reducing bias.
- It also helps mitigate privacy risks by replacing sensitive data.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000030_a57f824b7512cd6446a0a82aeca6053ab4eccf32c2b51d425f3e2806c3fd884c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000031_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Instruction Data Synthesis

- Instruction finetuning requires (instruction, response) pairs.
- AI can generate instructions, responses, or both.
- Example: Alpaca used 175 human-written seed pairs and expanded to 52,000 pairs with GPT-3.
- Multi-turn datasets like UltraChat rely heavily on AI synthesis.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000032_c48ac22ac31bcaa80779ea43be65996d36ad8901b1923854dc41e5a3b840ee22.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000033_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Synthetic Data for Preference Training

- AI judges can be used to decide which response is better.
- Biases like first-position bias must be mitigated with careful design.
- Synthetic preference data reduces reliance on costly human feedback.
- Validation of synthetic outputs is crucial to prevent error propagation.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000034_915c95b1f5ea4663e5665cdf358eb503811bbc73ff237e352bae281612e7b43d.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000035_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Model Bootstrapping

- Models can generate data to train smaller or newer models.
- Example: Nemotron-4 was finetuned using synthetic data generated by a teacher model.
- Verified synthetic data improves performance, while unverified data may degrade it.
- Bootstrapping requires mechanisms for quality control.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000036_73f238e07853eb7acf36e18105cdfbea7e284221faee6055ea032bab5b02c037.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000037_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Data Processing

- Processing steps include cleaning, deduplication, normalization, and formatting.
- The order of operations should optimize efficiency.
- Always validate scripts on small samples before scaling to full datasets.
- Keeping original data copies helps protect against script errors.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000038_692935a8faf4a2675a472d0130df376c643669be346a7793923345ebc099d98d.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000039_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Inspecting Data

- Inspecting data provides insights into quality beyond automated checks.
- Statistical analysis can reveal distribution patterns, lengths, and token usage.
- Manual inspection often uncovers issues quickly, saving downstream effort.
- Deduplication prevents biases and test contamination.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000040_56adabd592c99f6415155763753188739a04257f0e6ea97838fb2a0569472c9a.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000041_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Deduplication Issues

- Duplicated data skews distributions and inflates model confidence in false correlations.
- It can also cause contamination between training and test sets.
- Even small duplication rates can significantly degrade performance.
- Deduplication improves both efficiency and fairness of training.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000042_2caa21ed1675ab50585171100e37dd43a4fcd76623a5a374369f0cfaaa2c8c83.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000043_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Limitations of Synthetic Data

- Synthetic data cannot fully replace human-generated data.
- Mixing human and AI data often yields the best results.
- Poor-quality synthetic data may propagate errors and biases.
- Careful evaluation is required to ensure synthetic contributions are beneficial.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000044_653c9613201c9355a611ab3a71d910ffc66469fd9b3e838e9ffc4490f7654367.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000045_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Summary of Dataset Engineering

- Data quality, diversity, and compliance are the foundation of effective AI systems.
- Data-centric AI emphasizes curating and synthesizing datasets over model tweaks.
- Synthetic and augmented data offer scalable solutions but require quality controls.
- Dataset engineering is iterative, requiring constant inspection, evaluation, and improvement.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000046_3b61c64012c3179d2335576029530e527584ff9cbfa03b75ba1ccea0d565b27e.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000047_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## References

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000048_e4ea26989fcb8e0fd37282a3c4e9fa0b97b09ad0ab4796142dd45fda302e6002.png)

## References

- Huyen, Chip. Designing machine learning systems. O'Reilly Media, Inc., 2022

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000049_fe4c3e40454890cec463219617f0221c25088bd0ea23938f86afba6ab3673e8c.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/08_dataset_eng_artifacts/image_000050_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)