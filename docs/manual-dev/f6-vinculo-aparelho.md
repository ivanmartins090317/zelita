# F6 — como ligar o celular

Ambiente: local ou Vercel, com sessão de administradora e pessoa cuidada selecionada. A migration `013_elder_devices` precisa estar no banco.

1. Em Ajustes, na linha “Aparelhos com acesso”, toque em Gerenciar. A rota é `/familia/instalar`.
2. A tela mostra o WhatsApp mascarado, o prazo de 15 minutos e os dois caminhos. Cuidador vê o estado e não vê os botões.
3. “Mostrar o link aqui” não manda WhatsApp. O endereço aparece em letra grande. Se sair da tela, ele não volta; gerar outro invalida o anterior.
4. Abra esse endereço no celular dele. A página pede confirmação e não mostra remédio nem telefone. “Agora não” não gasta o link.
5. “Sim, quero usar” abre `/idoso/instalado` e, em seguida, `/idoso` sem a faixa de prévia e sem pedir login.
6. “Preciso de ajuda” nesse celular não diz que a família foi avisada. Oferece ligar para a família e para o 192. Nenhuma linha nova em `sos_alerts`.
7. Desvincular em `/familia/instalar` derruba o atalho no próximo carregamento, mesmo com o cookie ainda no aparelho.
8. A prévia da família, noutro navegador, continua com a faixa âmbar.

No computador local, sem token da Meta, “Enviar o link para ele” registra dry-run e mostra o endereço presencial. No Vercel, se o template `zelita_device_link` não estiver aprovado, a tela diz que a mensagem não saiu.

Homologação oficial do FL-05 é no Vercel, com evidência no relatório manual. Não marcar os casos TC-FL05-08 a TC-FL05-14 antes dessa rodada.
