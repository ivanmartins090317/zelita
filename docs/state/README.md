# docs/state — estado vivo do projeto

Fonte da verdade do **agora**: o que está em execução, o que falta validar e bugs.

Agentes e humanos **sempre** leem e atualizam esta pasta durante o desenvolvimento.

| Arquivo | Uso |
| --- | --- |
| `ATUAL.md` | Tarefa(s) em execução (WIP) |
| `PENDENCIAS.md` | O que falta fazer / validar (homologação e backlog curto) |
| `BUGS.md` | Bugs abertos e resolvidos |

## Regras

1. Ao **iniciar** uma etapa/feature: atualizar `ATUAL.md` (autonomia, Spec, checklist).
2. Ao **terminar** um item: marcar em `PENDENCIAS.md` / checklist; se foi entrega de código, registrar também em `docs/implementation/`.
3. Ao achar ou fechar bug: registrar em `BUGS.md` (`BG-XX`).
4. Não duplicar PRD aqui — só status operacional.
