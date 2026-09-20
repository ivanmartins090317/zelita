# Em execução

| Campo | Valor |
| --- | --- |
| Etapa | **Gate 1 (P0)** — Produção real |
| Spec | Sem Spec nova (headers + legal mínimo + homologação) |
| Autonomia | `medium` |
| Status | Homologação família no Vercel ok via **Copiar link**; e-mail automático de convite ficou pendente (Gate 3) |

## Entregue (Gate 1 parcial)

- Sentry DSN + migrations `007`/`009` + headers A05 + `/privacidade` e `/termos`
- Homologação Vercel 2026-09-20: FL-01 (OTP no spam), FL-02 (8 passos), FL-03 (remédios), FL-08 smoke (exames)

## Achados da homologação

- OTP chega, mas só na pasta de spam (DNS/reputação Resend, não bug de código)
- Aceite de convite: **Copiar link** → colar em outra aba **funcionou** (2026-09-20)
- Envio automático de e-mail de convite **não existe** — pendente no Gate 3 (`PENDENCIAS.md`)

## Próximo

- Commit/deploy se headers + legal ainda não subiram
- (Opcional, ops) SPF/DKIM/DMARC em `mail.modernxlab.com.br` para o OTP sair do spam
- Gate 2.1 quando o Gate 1 estiver no ar
