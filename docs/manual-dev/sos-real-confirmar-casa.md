# SOS real e Confirmar Casa — como experimentar

Ambiente: local ou Vercel, com a pessoa cuidada já cadastrada e um aparelho vinculado de verdade. A prévia da família, no navegador logado e sem o cookie do aparelho, não serve para gravar.

Homologação oficial (TC-FL06-01 a TC-FL06-10) fica para a rodada única no Vercel. Não marcar esses casos antes dela.

## Prévia

1. Com a sessão da família, abra `/idoso`.
2. A faixa âmbar continua. Não aparece “Estou em casa”.
3. “Sim, preciso de ajuda” mostra o ensaio e a faixa. Nenhuma linha nova em `sos_alerts`.
4. Abrir `/idoso/casa` volta para `/idoso`.

## Pedir ajuda no aparelho

1. No celular vinculado, sem a faixa, toque em “Preciso de ajuda” e depois em “Sim, preciso de ajuda”.
2. A tela diz que a família foi avisada e lembra o SAMU 192 e os Bombeiros 193. A Zelita não liga para esses números.
3. Em Pedidos de ajuda, o pedido fica aberto. Cada pessoa da ordem salva ganha uma tentativa de e-mail, enviada ou falhou.
4. O e-mail diz quem pediu ajuda, o horário em `America/Sao_Paulo` e que o detalhe está em Pedidos de ajuda. Não leva coordenada nem telefone.
5. Cancelar na pergunta volta ao início e não cria pedido.
6. Um segundo toque com pedido aberto há menos de 2 minutos não cria outro e não manda outro e-mail. A tela segue calma.
7. Sem permissão de localização já concedida, ou se o GPS não responder em 8 segundos, o pedido permanece e a localização fica indisponível.

Conta pausada e horário de “não incomodar” não seguram este pedido.

## Casa e saída

1. No aparelho, “Estou em casa” abre uma pergunta. “Sim, estou em casa” pede permissão. Se o aparelho devolver a posição, a Casa fica confirmada. Vale no Essencial, no trial e no Cuidado+.
2. Se a pessoa negar ou o GPS falhar, nada é gravado. A tela diz que pode tentar de novo e que, sem isso, a família não recebe aviso de saída.
3. O aviso de saída só sai no Cuidado+, com a Casa confirmada, “avisar ao sair” ligado e a autorização vigente. Abrir o aplicativo não fica lendo o GPS o tempo todo.
4. Uma saída manda um e-mail, junto, para administradora e cuidadora que tenham e-mail. Visualizador e contato de emergência não entram. A ordem do SOS também não.
5. Enquanto a pessoa não voltar para dentro da Casa, abrir de novo não manda outro e-mail.
