## Deploying AI

## Agents

$ echo "Data Sciences Institute"

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000000_ea599e14d4588c33921df8159984cb8ff5dd32f82a2ce9f56bb94a5c8d07e7ce.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000001_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Introduction

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000002_49560bf1e9ba29234af061f7636227a44526b692eb8a88cfe3388c9019a04ecd.png)

Agenda

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000003_818130d666454ece767016a874b4863e60c0d4931ba94e31454818182b3d8eee.png)

## Agenda

- Planning
- Interacting with APIs and MCP
- Agent failure modes and evaluation

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000004_41e2b137372a24a3c6f88f1dab37bdc26e0b9a2b558a63b1ec84a17ac5bdc0d9.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000005_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000006_beb723d5d07d60d08ea7ad02bb33d005e58860006ad381dd213f935cd15ffebd.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000007_c0b91c811a6afd26c37016fa3674ed522e2ddc469cca2dc5102f25ca47e05ae0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000008_e0ea1f7cf6ed861abd28221920a1c56cc1c631c33d37f87b238f1c5bb066fa39.png)

## Introduction to Agents

- An agent perceives its environment and acts upon it.
- Agents are defined by their environment and available actions.
- They can leverage tools to expand their capabilities.
- Chatbots with retrieval or browsing abilities are examples of agents.
- Agents combine reasoning, planning, and tool use.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000009_41e2b137372a24a3c6f88f1dab37bdc26e0b9a2b558a63b1ec84a17ac5bdc0d9.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000010_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Why Agents Matter

- Agents can automate workflows that require multiple steps.
- They integrate perception, planning, and action into cohesive loops.
- Examples include research assistants, trip planners, and negotiation bots.
- Agents represent a path toward autonomous, goal-driven AI systems.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000011_c0b91c811a6afd26c37016fa3674ed522e2ddc469cca2dc5102f25ca47e05ae0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000012_e56ce54e4bbce9376e1678c154aa772414bc34311f2f0b45566bd916edda2145.png)

## Agent Components

- Environment : defines the context in which the agent operates.
- Actions : possible operations available to the agent.
- Tools : extend the agent' s ability to perceive or act.
- Planner : determines how to sequence actions to reach goals.
- Feedback loop : updates decisions based on environment responses.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000013_eae955fd63dffec5501b24ae1f5f2d9c226d0d0c4797f83d5ca115b2b342cb58.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000014_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Tools for Agents

- Tools enhance agents by providing knowledge and capabilities.
- Knowledge augmentation tools retrieve or access data sources.
- Capability extension tools solve inherent model weaknesses, such as calculators.
- Write actions tools allow agents to alter environments, such as sending emails.
- Tool selection shapes the effectiveness and reliability of agents.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000015_7f260593615f05ecbf1d0ea629584cf6efdb6cf7187fdb3e6ee30db54951178b.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000016_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Knowledge Augmentation Tools

- Examples include text retrievers, image retrievers, and SQL executors.
- Tools can provide access to organizational databases and APIs.
- Web browsing tools help agents access up-to-date public information.
- APIs for search, news, and social media extend knowledge coverage.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000017_edd133807a1f103c64ace7f58e1355ae2ab1d01bdbbfaf09a567fbab71ff08fd.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000018_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Capability Extension T ools

- Address inherent model limitations, such as poor arithmetic skills.
- Simple extensions include calculators, calendars, and unit converters.
- More advanced tools include code interpreters and La T eX renderers.
- External tools can also make unimodal models multimodal.
- These extensions boost performance with fewer resources than finetuning.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000019_7a66973b188fcdd95f17c7baf8158e3c1309719adeaff64484b8398ff6a5f1f0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000020_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Write Action T ools

- Write actions allow agents to modify their environment.
- Examples include sending emails, executing SQL updates, or initiating transactions.
- These actions enable automation of complete workflows.
- However, write actions increase risks of security breaches or harmful outcomes.
- Proper safeguards are critical to responsible deployment.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000021_e3cc55118caa0b7c26dbbd39336d0dd02130b0d0e28aa9c525ad36734af75af0.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000022_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Planning in Agents

- Planning determines how agents sequence tool use to complete tasks.
- Agents must break complex tasks into subtasks and reason step by step.
- Planning involves both short-term reasoning and long-term strategy.
- Common methods include chain-of-thought, self-critique, and structured workflows.
- Strong planners help reduce compound errors across multiple steps.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000023_d943b04c8e20f775b4a467dfd04be79be498f62a1c7cd5172c1c84bbb574f010.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000024_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## Evaluating Agents

- Agents are more complex to evaluate than static models.
- Evaluations must consider success rates across multi-step tasks.
- Key risks include compounding errors, increased costs, and higher latency.
- Safety evaluation is critical for agents with write actions.
- Human-in-the-loop monitoring may be necessary in early deployments.

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000025_2df0e583f81fa342abb7b021227bb6a2559e40c8a1046a971684b2fa506b3ac2.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000026_f9dee4bc9a97bbda8e7660ff1fe346ff749af61189a75ae624386de9ad64230a.png)

## References

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000027_c27985c9a6e97c6bedf47c8bbe9a77884ce104f65f4b6ac293b04e1e03d147d0.png)

## References

- Huyen, Chip. Designing machine learning systems. O'Reilly Media, Inc., 2022

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000028_b03ced97185ca0692e3459cd4ddcf7680d2fa10e6243d2cf03dca5727ae7f606.png)

![Image](/Users/davidancor/Projects/DSI/deploying-ai/deploying-ai/01_materials/slides/06_agents_artifacts/image_000029_69537736864dbcec0170d6dc6c1aca3471004bc22d74383248c7dbf015a08a29.png)